import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Grid,
} from '@mui/material';
import { getVehicleById } from '../services/vehicleService';
import { createFolder } from '../services/folderService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { FOLDER_STATUS } from '../utils/constants';
import api from '../services/api';

const steps = ['Documents requis', 'Confirmation'];

const PurchaseCreation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [folderData, setFolderData] = useState({
        idCard: null,
        proofAddress: null,
        incomeProof: null,
    });

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const data = await getVehicleById(id);
                setVehicle(data);
            } catch (error) {
                setError('Erreur lors du chargement du véhicule');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleFileUpload = (event, documentType) => {
        const file = event.target.files[0];
        setFolderData(prev => ({
            ...prev,
            [documentType]: file
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Vérifier si le véhicule est toujours disponible
            const vehicleData = await getVehicleById(id);
            if (vehicleData.state !== 'AVAILABLE') {
                setError('Ce véhicule n\'est plus disponible à l\'achat');
                return;
            }

            // Vérifier que tous les fichiers sont valides
            const fileUploads = [
                { file: folderData.idCard, type: 'ID_CARD', name: 'Carte d\'identité' },
                { file: folderData.proofAddress, type: 'PROOF_ADDRESS', name: 'Justificatif de domicile' },
                { file: folderData.incomeProof, type: 'INCOME_PROOF', name: 'Justificatif de revenus' }
            ];

            // Vérifier le type de chaque fichier avant de créer le dossier
            const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            for (const fileData of fileUploads) {
                if (!fileData.file) {
                    throw new Error(`Le fichier ${fileData.name} est manquant`);
                }
                if (!acceptedTypes.includes(fileData.file.type)) {
                    throw new Error(`Le fichier ${fileData.name} doit être une image (JPEG/PNG/WebP) ou un PDF`);
                }
            }
            
            // Une fois les fichiers validés, créer le dossier
            const folderFormData = new FormData();
            folderFormData.append('vehicle_id', id);
            folderFormData.append('type_folder', 'PURCHASE');

            let folderResponse;
            try {
                folderResponse = await createFolder(folderFormData);
                console.log('Dossier créé avec succès:', folderResponse);
            } catch (error) {
                throw new Error('Erreur lors de la création du dossier: ' + (error.response?.data?.detail || error.message));
            }

            // Upload chaque fichier
            try {
                for (const fileData of fileUploads) {
                    const fileFormData = new FormData();
                    fileFormData.append('file', fileData.file);
                    fileFormData.append('file_type', fileData.type);
                    
                    await api.post(`/folders/${folderResponse.id}/files/`, fileFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }
                console.log('Tous les fichiers ont été uploadés avec succès');
                handleNext();
            } catch (uploadError) {
                // Si l'upload échoue, on devrait supprimer le dossier créé
                try {
                    await api.delete(`/folders/${folderResponse.id}/`);
                } catch (deleteError) {
                    console.error('Erreur lors de la suppression du dossier:', deleteError);
                }
                throw new Error(`Erreur lors de l'upload des fichiers: ${uploadError.message}`);
            }
        } catch (error) {
            console.error('Erreur détaillée:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(error.message || error.response?.data?.detail || 'Une erreur est survenue lors de la création du dossier');
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <input
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                style={{ display: 'none' }}
                                id="id-card-upload"
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'idCard')}
                            />
                            <label htmlFor="id-card-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {folderData.idCard ? 'Carte d\'identité chargée' : 'Charger la carte d\'identité'}
                                </Button>
                            </label>
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                style={{ display: 'none' }}
                                id="proof-address-upload"
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'proofAddress')}
                            />
                            <label htmlFor="proof-address-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {folderData.proofAddress ? 'Justificatif de domicile chargé' : 'Charger le justificatif de domicile'}
                                </Button>
                            </label>
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                style={{ display: 'none' }}
                                id="income-proof-upload"
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'incomeProof')}
                            />
                            <label htmlFor="income-proof-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {folderData.incomeProof ? 'Justificatif de revenus chargé' : 'Charger le justificatif de revenus'}
                                </Button>
                            </label>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Dossier créé avec succès !
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Votre dossier d'achat a été soumis et est en attente de validation. Une fois vos documents validés, nous vous enverrons le contrat à signer.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/profile')}
                            sx={{ mt: 3 }}
                        >
                            Voir mes dossiers
                        </Button>
                    </Box>
                );
            default:
                return 'Étape inconnue';
        }
    };

    if (loading && activeStep !== 1) {
        return <LoadingScreen message="Chargement..." />;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, position: 'relative' }}>
                {activeStep !== 1 && (
                    <Button
                        variant="outlined"
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                        onClick={() => navigate(-1)}
                    >
                        Annuler
                    </Button>
                )}
                
                <Typography variant="h4" gutterBottom>
                    {activeStep === 1 ? 'Dossier soumis' : 'Achat de véhicule'}
                </Typography>

                <ErrorAlert error={error} />

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        {activeStep !== 1 && (
                            <>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                                        Retour
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
                                    disabled={
                                        activeStep === 0 && (!folderData.idCard || !folderData.proofAddress || !folderData.incomeProof)
                                    }
                                >
                                    {activeStep === steps.length - 2 ? 'Soumettre le dossier' : 'Suivant'}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PurchaseCreation; 