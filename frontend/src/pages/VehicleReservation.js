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
    TextField,
    Alert,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { getVehicleById } from '../services/vehicleService';
import { createReservation } from '../services/reservationService';

const steps = ['Dates de réservation', 'Documents requis', 'Confirmation'];

const VehicleReservation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reservationData, setReservationData] = useState({
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
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement du véhicule');
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
        setReservationData(prev => ({
            ...prev,
            [documentType]: file
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('vehicle', id);
            formData.append('start_date', reservationData.startDate.toISOString());
            formData.append('end_date', reservationData.endDate.toISOString());
            formData.append('id_card', reservationData.idCard);
            formData.append('driving_license', reservationData.drivingLicense);
            formData.append('signed_contract', reservationData.signedContract);

            await createReservation(formData);
            handleNext();
        } catch (err) {
            setError('Erreur lors de la création de la réservation');
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
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Date de début"
                                    value={reservationData.startDate}
                                    onChange={(newValue) => {
                                        setReservationData(prev => ({
                                            ...prev,
                                            startDate: newValue
                                        }));
                                    }}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={new Date()}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Date de fin"
                                    value={reservationData.endDate}
                                    onChange={(newValue) => {
                                        setReservationData(prev => ({
                                            ...prev,
                                            endDate: newValue
                                        }));
                                    }}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={reservationData.startDate || new Date()}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Veuillez télécharger les documents suivants :
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                            >
                                {reservationData.idCard ? 'Carte d\'identité téléchargée' : 'Télécharger votre carte d\'identité'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, 'idCard')}
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                            >
                                {reservationData.drivingLicense ? 'Permis de conduire téléchargé' : 'Télécharger votre permis de conduire'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, 'drivingLicense')}
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                            >
                                {reservationData.signedContract ? 'Contrat signé téléchargé' : 'Télécharger le contrat signé'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, 'signedContract')}
                                />
                            </Button>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Réservation confirmée !
                        </Typography>
                        <Typography variant="body1">
                            Votre réservation a été enregistrée avec succès.
                            Nous vous contacterons prochainement pour finaliser les détails.
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
                return 'Unknown step';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !vehicle) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error">{error || 'Véhicule non trouvé'}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Réservation - {vehicle.brand} {vehicle.model}
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                    {getStepContent(activeStep)}
                </Box>

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
                                    (activeStep === 0 && (!reservationData.startDate || !reservationData.endDate)) ||
                                    (activeStep === 1 && (!reservationData.idCard || !reservationData.drivingLicense || !reservationData.signedContract))
                                }
                            >
                                {activeStep === steps.length - 2 ? 'Confirmer la réservation' : 'Suivant'}
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default VehicleReservation; 