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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { getVehicleById } from '../services/vehicleService';
import { createFolder } from '../services/folderService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { FOLDER_STATUS } from '../utils/constants';

const steps = ['Dates de location', 'Documents requis', 'Confirmation'];

const FolderCreation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [folderData, setFolderData] = useState({
        startDate: null,
        endDate: null,
        idCard: null,
        drivingLicense: null,
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
            formData.append('start_date', folderData.startDate.toISOString().split('T')[0]);
            formData.append('end_date', folderData.endDate.toISOString().split('T')[0]);
            formData.append('id_card', folderData.idCard);
            formData.append('driving_license', folderData.drivingLicense);
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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de début"
                                    value={folderData.startDate}
                                    onChange={(newValue) => {
                                        setFolderData(prev => ({ ...prev, startDate: newValue }));
                                    }}
                                    minDate={new Date()}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de fin"
                                    value={folderData.endDate}
                                    onChange={(newValue) => {
                                        setFolderData(prev => ({ ...prev, endDate: newValue }));
                                    }}
                                    minDate={folderData.startDate || new Date()}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                );
            case 1:
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
                                id="license-upload"
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'drivingLicense')}
                            />
                            <label htmlFor="license-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {folderData.drivingLicense ? 'Permis de conduire chargé' : 'Charger le permis de conduire'}
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
            case 2:
                return (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Dossier créé avec succès !
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Votre dossier de location a été soumis et est en attente de validation.
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

    if (loading && activeStep !== 2) {
        return <LoadingScreen message="Chargement..." />;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, position: 'relative' }}>
                {activeStep !== 2 && (
                    <Button
                        variant="outlined"
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                        onClick={() => navigate(-1)}
                    >
                        Annuler
                    </Button>
                )}
                
                <Typography variant="h4" gutterBottom>
                    {activeStep === 2 ? 'Réservation confirmée' : 'Réservation de véhicule'}
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
                        {activeStep !== 2 && (
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
                                        (activeStep === 0 && (!folderData.startDate || !folderData.endDate)) ||
                                        (activeStep === 1 && (!folderData.idCard || !folderData.drivingLicense || !folderData.signedContract))
                                    }
                                >
                                    {activeStep === steps.length - 2 ? 'Confirmer la réservation' : 'Suivant'}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default FolderCreation; 