import os
import boto3
import tempfile
import subprocess
import logging
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Document, AIInteraction, Folder
from .serializers import DocumentSerializer, AIInteractionSerializer, FolderSerializer

logger = logging.getLogger(__name__)

class FolderViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les dossiers."""
    
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les dossiers selon l'utilisateur connecté."""
        user = self.request.user
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return Folder.objects.all()
        return Folder.objects.filter(created_by=self.request.user)
    
    def perform_create(self, serializer):
        """Ajouter l'utilisateur lors de la création."""
        serializer.save(created_by=self.request.user)
        logger.info(f"Dossier créé par l'utilisateur {self.request.user.id}: {serializer.instance.name}")


class QueryView(views.APIView):
    """API endpoint pour interroger l'IA sur les documents."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Endpoint pour interroger l'IA sur les documents."""
        query = request.data.get('query', '')
        document_ids = request.data.get('document_ids', [])
        
        if not query:
            return Response(
                {'error': 'La requête ne peut pas être vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrer les documents selon l'utilisateur ou son rôle
        if request.user.role in ['GESTIONNAIRE', 'ADMIN']:
            documents = Document.objects.filter(id__in=document_ids)
        else:
            documents = Document.objects.filter(
                id__in=document_ids, 
                uploaded_by=request.user
            )
        
        if not documents:
            return Response(
                {'error': 'Aucun document valide sélectionné ou vous n\'avez pas accès à ces documents'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Limiter la taille du contexte pour éviter les surcharges
        max_context_length = 10000
        
        # Préparer le contexte pour l'IA avec le contenu des documents
        context_parts = []
        for doc in documents:
            content = doc.content_text or 'Contenu non disponible'
            # Tronquer le contenu si nécessaire
            if len(content) > 2000:  # Limiter la taille par document
                content = content[:1997] + "..."
            context_parts.append(
                f"Document: {doc.title}\nType: {doc.get_document_type_display()}\nContenu:\n{content}"
            )
        
        context = "\n\n".join(context_parts)
        
        # Limiter la taille totale du contexte
        if len(context) > max_context_length:
            context = context[:max_context_length - 3] + "..."
            logger.warning(f"Contexte tronqué pour l'utilisateur {request.user.id}: longueur > {max_context_length}")
        
        # Appel à Ollama (en local)
        try:
            logger.info(f"Requête IA de l'utilisateur {request.user.id}: {query} (contexte: {len(context)} caractères)")
            response = self._query_ollama(query, context)
            
            # Sauvegarder l'interaction
            interaction = AIInteraction.objects.create(
                user=request.user,
                query=query,
                response=response
            )
            interaction.documents.set(documents)
            
            return Response({
                'query': query,
                'response': response,
                'documents': DocumentSerializer(documents, many=True).data
            })
        except Exception as e:
            logger.error(f"Erreur lors de la communication avec l'IA: {str(e)}")
            return Response(
                {'error': f'Erreur lors de la communication avec l\'IA: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _query_ollama(self, query, context):
        """Interroger Ollama en local."""
        try:
            import requests
            logger.debug(f"Tentative de communication avec Ollama sur http://localhost:11434/api/generate")
            
            # Vérifier si Ollama est accessible
            try:
                health_check = requests.get('http://localhost:11434/api/tags', timeout=5)
                if health_check.status_code != 200:
                    logger.error(f"Ollama n'est pas accessible (status code: {health_check.status_code})")
                    return "Le service Ollama n'est pas disponible actuellement. Veuillez vérifier que Ollama est installé et en cours d'exécution sur votre serveur."
                
                # Vérifier si le modèle llama2 est disponible
                models = health_check.json().get('models', [])
                llama2_available = any(model.get('name', '').startswith('llama2') for model in models)
                if not llama2_available:
                    logger.error("Le modèle llama2 n'est pas disponible dans Ollama")
                    return "Le modèle llama2 n'est pas disponible. Veuillez l'installer avec la commande 'ollama pull llama2'."
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Impossible de se connecter à Ollama: {str(e)}")
                return "Impossible de se connecter au service Ollama. Veuillez vérifier que Ollama est installé et en cours d'exécution sur votre serveur (http://localhost:11434)."
                
            # Tenter d'envoyer la requête à Ollama
            try:
                logger.info(f"Envoi de la requête à Ollama avec {len(context)} caractères de contexte")
                response = requests.post(
                    'http://localhost:11434/api/generate',
                    json={
                        'model': 'llama2',
                        'prompt': f"""Contexte: {context}\n\nQuestion: {query}\n\nRéponse:""",
                        'stream': False,
                        'options': {
                            'temperature': 0.7,
                            'num_predict': 1000  # Limite la longueur de la réponse
                        }
                    },
                    timeout=90  # Augmenter le timeout pour les documents longs
                )
                
                logger.info(f"Réponse reçue de Ollama: status={response.status_code}")
                
                if response.status_code == 200:
                    result = response.json().get('response', '')
                    logger.info(f"Réponse de l'IA obtenue ({len(result)} caractères)")
                    return result
                else:
                    error_msg = f"Erreur API Ollama: {response.status_code}"
                    if hasattr(response, 'json'):
                        try:
                            error_details = response.json()
                            error_msg += f" - {error_details.get('error', '')}"
                        except:
                            pass
                    logger.error(error_msg)
                    return f"Erreur lors de la communication avec Ollama: {error_msg}"
            except requests.exceptions.Timeout:
                logger.error("Timeout lors de la communication avec Ollama")
                return "Le temps de réponse d'Ollama a été dépassé. Le contexte est peut-être trop volumineux ou le modèle est occupé."
            except requests.exceptions.RequestException as e:
                logger.error(f"Erreur lors de la requête à Ollama: {str(e)}")
                return f"Erreur de communication avec Ollama: {str(e)}"
                
        except ImportError:
            # Fallback si requests n'est pas disponible
            logger.error("Module 'requests' non disponible")
            return "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Le module 'requests' n'est pas disponible sur le serveur."
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la communication avec Ollama: {str(e)}")
            return f"Une erreur inattendue s'est produite lors de la communication avec Ollama: {str(e)}"


class DocumentViewSet(viewsets.ModelViewSet):
    """API endpoint pour gérer les documents."""
    
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les documents selon l'utilisateur connecté."""
        user = self.request.user
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return Document.objects.all()
        return Document.objects.filter(uploaded_by=user)
    
    def perform_create(self, serializer):
        """Ajouter l'utilisateur et gérer l'upload S3."""
        try:
            logger.info(f"Tentative de création d'un document par l'utilisateur {self.request.user.id}")
            document = serializer.save(uploaded_by=self.request.user)
            logger.info(f"Document créé avec succès: {document.id} - {document.title}")
            
            # Si S3 est configuré, extraire le texte et stocker la clé S3
            if settings.USE_S3 and document.file:
                logger.info(f"Traitement S3 pour le document: {document.id}")
                # Extraction du texte du PDF
                self._extract_text_from_pdf(document)
            else:
                logger.debug(f"Pas d'extraction de texte: USE_S3={settings.USE_S3}, file={bool(document.file)}")
        except Exception as e:
            logger.error(f"Exception lors de la création du document: {str(e)}")
            raise
    
    def _extract_text_from_pdf(self, document):
        """Extraire le texte d'un document PDF."""
        if document.file and (document.file.name.endswith('.pdf') or (document.s3_key and document.s3_key.endswith('.pdf'))):
            try:
                file_key = document.s3_key or document.file.name
                logger.info(f"Traitement du document PDF: {document.id} - {document.title}, fichier: {file_key}")
                
                # Télécharger le fichier depuis S3
                temp_path = None
                if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
                    try:
                        logger.info(f"Tentative de téléchargement depuis S3: bucket={settings.AWS_STORAGE_BUCKET_NAME}, fichier={file_key}")
                        # Configuration du client S3
                        s3 = boto3.client(
                            's3',
                            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                            region_name=settings.AWS_S3_REGION_NAME
                        )
                        
                        # Créer un fichier temporaire pour stocker le contenu du fichier S3
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                            temp_path = temp_file.name
                            # Utiliser la clé telle quelle, car elle doit déjà contenir le préfixe complet
                            s3_key = file_key
                            logger.info(f"Téléchargement depuis S3: {s3_key} -> {temp_path}")
                            
                            # Télécharger le fichier
                            s3.download_file(
                                settings.AWS_STORAGE_BUCKET_NAME,
                                s3_key,
                                temp_path
                            )
                            logger.info(f"Fichier téléchargé avec succès: {temp_path}")
                    except Exception as e:
                        logger.error(f"Erreur lors du téléchargement depuis S3: {str(e)}")
                        # Fallback: Essayez d'utiliser le chemin local du fichier
                        if hasattr(document.file, 'path'):
                            temp_path = document.file.path
                            logger.info(f"Utilisation du chemin local: {temp_path}")
                        else:
                            logger.error("Impossible d'accéder au fichier PDF. Abandon de l'extraction de texte.")
                            return
                else:
                    # Utiliser le chemin local du fichier
                    if hasattr(document.file, 'path'):
                        temp_path = document.file.path
                        logger.info(f"Utilisation du chemin local: {temp_path}")
                    else:
                        logger.error("Impossible d'accéder au fichier PDF. Abandon de l'extraction de texte.")
                        return
                
                # Utiliser PyPDF2 pour extraire le texte
                try:
                    logger.info(f"Extraction du texte avec PyPDF2: {temp_path}")
                    from PyPDF2 import PdfReader
                    reader = PdfReader(temp_path)
                    text = ""
                    for i, page in enumerate(reader.pages):
                        page_text = page.extract_text()
                        text += f"[Page {i+1}]\n{page_text}\n\n"
                    document.content_text = text
                    logger.info(f"Texte extrait: {len(text)} caractères")
                    document.save()
                    logger.info(f"Document sauvegardé avec succès")
                except Exception as e2:
                    logger.error(f"Erreur avec PyPDF2: {str(e2)}")
                    document.content_text = "Échec de l'extraction du texte. Veuillez réessayer plus tard."
                    document.save()
                
                # Nettoyer les fichiers temporaires si nécessaire
                if temp_path and hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
                    try:
                        os.unlink(temp_path)
                        logger.info(f"Fichier temporaire supprimé: {temp_path}")
                    except Exception as e:
                        logger.error(f"Erreur lors de la suppression du fichier temporaire: {str(e)}")
            except Exception as e:
                logger.error(f"Erreur générale lors de l'extraction du texte: {str(e)}")
                document.content_text = "Échec de l'extraction du texte. Veuillez réessayer plus tard."
                document.save()

    @action(detail=False, methods=['get'])
    def list_s3_documents(self, request):
        """Liste les documents disponibles dans le bucket S3."""
        try:
            if not hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') or not settings.AWS_STORAGE_BUCKET_NAME:
                return Response(
                    {'error': 'AWS S3 n\'est pas configuré correctement'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            # Configuration du client S3
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            # Préfixe pour la recherche dans S3
            prefix = 'media/documents/'
            logger.info(f"Recherche des documents dans S3 avec préfixe: {prefix}")
            
            # Lister les objets dans le dossier media/documents/
            response = s3.list_objects_v2(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Prefix=prefix
            )
            
            # Formater la réponse
            documents = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    # Ignorer le dossier lui-même
                    if key == prefix:
                        continue
                        
                    documents.append({
                        'key': key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'url': f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{key}" if hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN') else None
                    })
                
                logger.info(f"Nombre de documents trouvés: {len(documents)}")
            else:
                logger.info("Aucun document trouvé dans le bucket S3")
            
            return Response(documents)
        except Exception as e:
            logger.error(f"Erreur lors de la liste des documents S3: {str(e)}")
            return Response(
                {'error': f'Erreur lors de la liste des documents S3: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def import_from_s3(self, request):
        """Importe un document depuis S3 dans la base de données."""
        try:
            key = request.data.get('key')
            title = request.data.get('title')
            document_type = request.data.get('document_type', 'location')  # Par défaut: location
            
            if not key:
                return Response(
                    {'error': 'Aucune clé S3 fournie'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if not title:
                # Utiliser le nom du fichier comme titre par défaut
                title = key.split('/')[-1]
            
            logger.info(f"Importation du document depuis S3: {key}")
            logger.info(f"Titre: {title}, Type: {document_type}")
                
            # Créer l'enregistrement Document
            document = Document.objects.create(
                title=title,
                document_type=document_type,
                file=key,  # Stocker la clé S3 comme chemin du fichier
                s3_key=key,
                uploaded_by=request.user
            )
            
            # Extraire le texte du document
            self._extract_text_from_pdf(document)
            
            return Response(DocumentSerializer(document).data)
        except Exception as e:
            logger.error(f"Erreur lors de l'importation depuis S3: {str(e)}")
            return Response(
                {'error': f'Erreur lors de l\'importation depuis S3: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AIInteractionViewSet(viewsets.ModelViewSet):
    """API endpoint pour les interactions avec l'IA."""
    
    queryset = AIInteraction.objects.all()
    serializer_class = AIInteractionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def ask(self, request):
        """Endpoint pour interroger l'IA sur les documents."""
        query = request.data.get('query', '')
        document_ids = request.data.get('document_ids', [])
        
        if not query:
            return Response(
                {'error': 'La requête ne peut pas être vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        documents = Document.objects.filter(id__in=document_ids)
        if not documents:
            return Response(
                {'error': 'Aucun document valide sélectionné'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Préparer le contexte pour l'IA avec le contenu des documents
        context = "\n\n".join([
            f"Document: {doc.title}\nType: {doc.get_document_type_display()}\nContenu:\n{doc.content_text or 'Contenu non disponible'}"
            for doc in documents
        ])
        
        # Appel à Ollama (en local)
        try:
            response = self._query_ollama(query, context)
            
            # Sauvegarder l'interaction
            interaction = AIInteraction.objects.create(
                user=request.user,
                query=query,
                response=response
            )
            interaction.documents.set(documents)
            
            return Response({
                'query': query,
                'response': response,
                'documents': DocumentSerializer(documents, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la communication avec l\'IA: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _query_ollama(self, query, context):
        """Interroger Ollama en local."""
        # En production, remplacez cette méthode par un vrai appel à l'API Ollama
        try:
            import requests
            logger.debug(f"Tentative de communication avec Ollama sur http://localhost:11434/api/generate")
            
            # Vérifier si Ollama est accessible
            try:
                health_check = requests.get('http://localhost:11434/api/tags', timeout=2)
                if health_check.status_code != 200:
                    logger.error(f"Ollama n'est pas accessible (status code: {health_check.status_code})")
                    return "Le service Ollama n'est pas disponible actuellement. Veuillez vérifier que Ollama est installé et en cours d'exécution sur votre serveur."
                
                # Vérifier si le modèle llama2 est disponible
                models = health_check.json().get('models', [])
                llama2_available = any(model.get('name', '').startswith('llama2') for model in models)
                if not llama2_available:
                    logger.error("Le modèle llama2 n'est pas disponible dans Ollama")
                    return "Le modèle llama2 n'est pas disponible. Veuillez l'installer avec la commande 'ollama pull llama2'."
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Impossible de se connecter à Ollama: {str(e)}")
                return "Impossible de se connecter au service Ollama. Veuillez vérifier que Ollama est installé et en cours d'exécution sur votre serveur (http://localhost:11434)."
                
            # Tenter d'envoyer la requête à Ollama
            try:
                logger.info(f"Envoi de la requête à Ollama avec {len(context)} caractères de contexte")
                response = requests.post(
                    'http://localhost:11434/api/generate',
                    json={
                        'model': 'llama2',
                        'prompt': f"""Contexte: {context}\n\nQuestion: {query}\n\nRéponse:""",
                        'stream': False
                    },
                    timeout=60  # Augmenter le timeout pour les documents longs
                )
                
                logger.info(f"Réponse reçue de Ollama: status={response.status_code}")
                
                if response.status_code == 200:
                    result = response.json().get('response', '')
                    logger.info(f"Réponse de l'IA obtenue ({len(result)} caractères)")
                    return result
                else:
                    error_msg = f"Erreur API Ollama: {response.status_code}"
                    if hasattr(response, 'json'):
                        try:
                            error_details = response.json()
                            error_msg += f" - {error_details.get('error', '')}"
                        except:
                            pass
                    logger.error(error_msg)
                    return f"Erreur lors de la communication avec Ollama: {error_msg}"
            except requests.exceptions.Timeout:
                logger.error("Timeout lors de la communication avec Ollama")
                return "Le temps de réponse d'Ollama a été dépassé. Le contexte est peut-être trop volumineux ou le modèle est occupé."
            except requests.exceptions.RequestException as e:
                logger.error(f"Erreur lors de la requête à Ollama: {str(e)}")
                return f"Erreur de communication avec Ollama: {str(e)}"
                
        except ImportError:
            # Fallback si requests n'est pas disponible
            logger.error("Module 'requests' non disponible")
            return "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Le module 'requests' n'est pas disponible sur le serveur."
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la communication avec Ollama: {str(e)}")
            return f"Une erreur inattendue s'est produite lors de la communication avec Ollama: {str(e)}" 