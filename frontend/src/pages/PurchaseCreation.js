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
        signedContract: null,
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
            const formData = new FormData();
            formData.append('vehicle', id);
            formData.append('type_folder', 'PURCHASE');
            formData.append('id_card', folderData.idCard);
            formData.append('proof_address', folderData.proofAddress);
            formData.append('income_proof', folderData.incomeProof);
            formData.append('signed_contract', folderData.signedContract);
            formData.append('status', FOLDER_STATUS.PENDING);

            await createFolder(formData);
            handleNext();
        } catch (error) {
            setError('Erreur lors de la création du dossier');
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
                                accept="image/*,.pdf"
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
                                accept="image/*,.pdf"
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
                                accept="image/*,.pdf"
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
                        <Grid item xs={12}>
                            <input
                                accept="image/*,.pdf"
                                style={{ display: 'none' }}
                                id="contract-upload"
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'signedContract')}
                            />
                            <label htmlFor="contract-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {folderData.signedContract ? 'Contrat signé chargé' : 'Charger le contrat signé'}
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
                            Votre dossier d'achat a été soumis et est en attente de validation.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/dashboard')}
                            sx={{ mt: 3 }}
                        >
                            Retour au tableau de bord
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
                    {activeStep === 1 ? 'Achat confirmé' : 'Achat de véhicule'}
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
                                        activeStep === 0 && (!folderData.idCard || !folderData.proofAddress || !folderData.incomeProof || !folderData.signedContract)
                                    }
                                >
                                    {activeStep === steps.length - 2 ? 'Confirmer l\'achat' : 'Suivant'}
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