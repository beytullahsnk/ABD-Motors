from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from user.permissions import IsGestionnaireOrAdmin, IsOwnerOrStaff
from .models import Folder, File
from .serializers import FolderSerializer, FileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import os
import logging

logger = logging.getLogger(__name__)

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type_folder', 'status']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrStaff()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return Folder.objects.all()
        return Folder.objects.filter(client=user)
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def change_status(self, request, pk=None):
        folder = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Folder.STATUS):
            folder.status = new_status
            folder.save()
            return Response(self.get_serializer(folder).data)
        return Response(
            {'error': 'Statut invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Filtre les documents en fonction du rôle de l'utilisateur"""
        user = self.request.user
        
        # Les gestionnaires et admins peuvent voir tous les fichiers
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return self.queryset
        
        # Les clients ne peuvent voir que les fichiers liés à leurs dossiers
        client_folders = Folder.objects.filter(client=user)
        return self.queryset.filter(folder__in=client_folders)

    def perform_create(self, serializer):
        try:
            folder_id = self.request.data.get('folder')
            if folder_id:
                folder = Folder.objects.get(id=folder_id)
                # Vérifier que l'utilisateur est le propriétaire du dossier ou un membre du staff
                if folder.client != self.request.user and self.request.user.role not in ['GESTIONNAIRE', 'ADMIN']:
                    raise PermissionDenied("Vous n'êtes pas autorisé à ajouter des fichiers à ce dossier.")
            
            # Ne pas ajouter user=self.request.user car le modèle File n'a plus de champ user
            serializer.save()
            logger.info(f"Fichier créé avec succès: {serializer.instance.id}")
        except Exception as e:
            logger.error(f"Erreur lors de la création du fichier: {str(e)}")
            raise

    def perform_update(self, serializer):
        folder = serializer.instance.folder
        if folder and not IsOwnerOrStaff().has_object_permission(self.request, self, folder):
            raise PermissionDenied("Vous n'êtes pas autorisé à modifier ce fichier.")
        serializer.save()
        
    def perform_destroy(self, instance):
        # Vérification des permissions
        folder = instance.folder
        if folder and not IsOwnerOrStaff().has_object_permission(self.request, self, folder):
            raise PermissionDenied("Vous n'êtes pas autorisé à supprimer ce fichier.")
        
        # Suppression sécurisée du fichier
        try:
            instance.delete()
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du fichier: {str(e)}")
            raise
