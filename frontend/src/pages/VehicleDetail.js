import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Button,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import { getVehicleById } from '../services/vehicleService';

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    {/* Image du véhicule */}
                    <Grid item xs={12} md={6}>
                        <img
                            src={vehicle.image || '/placeholder-car.jpg'}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Grid>

                    {/* Informations du véhicule */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom>
                            {vehicle.brand} {vehicle.model}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {vehicle.daily_rate}€/jour
                        </Typography>

                        <Stack direction="row" spacing={1} my={2}>
                            {vehicle.has_insurance && (
                                <Chip label="Assuré" color="success" />
                            )}
                            {vehicle.has_maintenance && (
                                <Chip label="Entretenu" color="success" />
                            )}
                            {vehicle.has_assistance && (
                                <Chip label="Assistance" color="success" />
                            )}
                            {vehicle.has_technical_control && (
                                <Chip label="Contrôle technique" color="success" />
                            )}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" paragraph>
                            <strong>Année :</strong> {vehicle.year}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Kilométrage :</strong> {vehicle.mileage} km
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Type de carburant :</strong> {vehicle.fuel_type}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Transmission :</strong> {vehicle.transmission}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Nombre de places :</strong> {vehicle.seats}
                        </Typography>

                        {vehicle.description && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1" paragraph>
                                    {vehicle.description}
                                </Typography>
                            </>
                        )}

                        <Box mt={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={() => navigate(`/vehicles/${vehicle.id}/reserve`)}
                            >
                                Réserver ce véhicule
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default VehicleDetail; 