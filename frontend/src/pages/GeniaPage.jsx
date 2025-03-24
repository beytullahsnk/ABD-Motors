import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Paper, TextField, Button, 
         CircularProgress, Box, Divider } from '@mui/material';
import { Upload, Send, InsertDriveFile, Chat, CloudDownload } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GeniaPage = () => {
  const { user } = useAuth();
  // Obtenir le token directement depuis localStorage
  const token = user?.access || JSON.parse(localStorage.getItem('user'))?.access;
  
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [s3Documents, setS3Documents] = useState([]);
  const [s3Loading, setS3Loading] = useState(false);
  const [showS3Modal, setShowS3Modal] = useState(false);

  // Configuration Axios
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  // Vérifier la présence du token
  useEffect(() => {
    if (!token) {
      console.error("Aucun token d'authentification trouvé");
      alert("Erreur d'authentification. Veuillez vous reconnecter.");
    } else {
      console.log("Token disponible:", token.substring(0, 15) + "...");
    }
  }, [token]);

  // Pour les requêtes d'upload
  const uploadFile = async (formData) => {
    try {
      console.log("Token utilisé:", token);
      console.log("Fichier à uploader:", formData.get('file')?.name);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/genia/documents/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Upload réussi:", response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
        },
        request: error.request ? 'Existe' : 'N\'existe pas'
      });
      throw error;
    }
  };

  // Charger les documents silencieusement en arrière-plan
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/genia/documents/');
        setDocuments(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      }
    };

    if (token) {
      fetchDocuments();
    }
  }, [token]);

  // Gérer l'upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier à uploader');
      return;
    }

    const formData = new FormData();
    // Utiliser le nom du fichier comme titre
    formData.append('title', file.name);
    // Type de document par défaut
    formData.append('document_type', 'location');
    formData.append('file', file);

    setUploading(true);
    try {
      const uploadedDoc = await uploadFile(formData);
      
      // Recharger les documents et sélectionner automatiquement le document qui vient d'être uploadé
      const response = await api.get('/genia/documents/');
      setDocuments(response.data);
      
      // Sélectionner automatiquement le document qui vient d'être uploadé
      if (uploadedDoc && uploadedDoc.id) {
        setSelectedDocuments([uploadedDoc.id]);
      }
      
      // Réinitialiser le fichier
      setFile(null);

      // Réinitialiser l'input file
      document.getElementById('file-upload').value = '';
      
      // Notification de succès
      alert('Document uploadé avec succès! Vous pouvez maintenant poser votre question.');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  // Gérer la requête IA
  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Veuillez entrer une question');
      return;
    }

    if (selectedDocuments.length === 0) {
      alert('Aucun document sélectionné. Veuillez d\'abord uploader ou importer un document.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/genia/interactions/ask/', {
        query: query,
        document_ids: selectedDocuments
      });
      
      setResponse(response.data.response);
    } catch (error) {
      console.error('Erreur lors de la requête IA:', error);
      setResponse('Erreur lors de la communication avec l\'IA. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour lister les documents dans S3
  const fetchS3Documents = async () => {
    setS3Loading(true);
    try {
      const response = await api.get('/genia/documents/list_s3_documents/');
      setS3Documents(response.data);
      setShowS3Modal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des documents S3:', error);
      alert('Erreur lors du chargement des documents S3. Veuillez réessayer.');
    } finally {
      setS3Loading(false);
    }
  };

  // Fonction pour importer un document depuis S3
  const importFromS3 = async (key) => {
    setS3Loading(true);
    try {
      // Extraire uniquement le nom du fichier de la clé
      const filename = key.split('/').pop();
      
      const data = {
        key,
        title: filename,
        document_type: 'location'  // Type par défaut
      };
      
      const response = await api.post('/genia/documents/import_from_s3/', data);
      
      // Recharger les documents
      const documentsResponse = await api.get('/genia/documents/');
      setDocuments(documentsResponse.data);
      
      // Sélectionner automatiquement le document importé
      if (response.data && response.data.id) {
        setSelectedDocuments([response.data.id]);
      }
      
      // Fermer le modal
      setShowS3Modal(false);
      
      alert('Document importé avec succès! Vous pouvez maintenant poser votre question.');
    } catch (error) {
      console.error('Erreur lors de l\'importation depuis S3:', error);
      alert('Erreur lors de l\'importation depuis S3. Veuillez réessayer.');
    } finally {
      setS3Loading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        <Chat sx={{ mr: 1, verticalAlign: 'middle' }} />
        Interface GenIA - Interrogation de documents
      </Typography>

      <Grid container spacing={4}>
        {/* Section Upload et Import */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Upload sx={{ mr: 1, verticalAlign: 'middle' }} />
              Ajouter un document
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Chargez un nouveau document ou importez-en un depuis S3.
            </Typography>
            
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<InsertDriveFile />}
            >
              Choisir un fichier PDF
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fichier: {file.name}
              </Typography>
            )}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleUpload}
              disabled={uploading || !file}
              startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
            >
              {uploading ? 'Upload en cours...' : 'Uploader le document'}
            </Button>
            
            <Divider sx={{ my: 3, opacity: 0.6 }}>OU</Divider>
            
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={fetchS3Documents}
              disabled={s3Loading}
              startIcon={s3Loading ? <CircularProgress size={20} /> : <CloudDownload />}
            >
              {s3Loading ? 'Chargement...' : 'Importer depuis S3'}
            </Button>
          </Paper>
        </Grid>

        {/* Section IA */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Chat sx={{ mr: 1, verticalAlign: 'middle' }} />
              Interroger l'IA sur {selectedDocuments.length > 0 ? 'votre document' : 'vos documents'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {selectedDocuments.length === 0 ? (
              <Box sx={{ py: 2, px: 3, mb: 2, backgroundColor: '#fff9e6', borderRadius: 1, border: '1px solid #ffe58f' }}>
                <Typography variant="body2" color="warning.main">
                  Commencez par uploader ou importer un document depuis S3 pour pouvoir poser des questions.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ py: 2, px: 3, mb: 2, backgroundColor: '#e6f7ff', borderRadius: 1, border: '1px solid #91d5ff' }}>
                <Typography variant="body2" color="primary">
                  Document prêt pour interrogation. Posez votre question ci-dessous.
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Posez votre question sur le document"
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              margin="normal"
              placeholder="Exemple: Quel est le montant du loyer dans ce document? Quelle est la durée du contrat?"
              disabled={selectedDocuments.length === 0}
            />
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleQuery}
              disabled={loading || selectedDocuments.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              {loading ? 'Traitement en cours...' : 'Envoyer la question'}
            </Button>
            
            {response && (
              <Paper variant="outlined" sx={{ p: 3, mt: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>
                  Réponse de l'IA:
                </Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                  {response}
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Modal pour les documents S3 */}
      {showS3Modal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowS3Modal(false)}
        >
          <Box
            sx={{
              width: '80%',
              maxWidth: 800,
              maxHeight: '80vh',
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" gutterBottom>
              Documents disponibles sur S3
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {s3Documents.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                Aucun document disponible sur S3
              </Typography>
            ) : (
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {s3Documents.map((doc) => (
                  <Box
                    key={doc.key}
                    sx={{ 
                      mb: 2, 
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{doc.key.split('/').pop()}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Taille: {(doc.size / 1024).toFixed(2)} KB | Modifié: {new Date(doc.last_modified).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => importFromS3(doc.key)}
                      disabled={s3Loading}
                    >
                      Importer
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setShowS3Modal(false)}>
                Fermer
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default GeniaPage; 