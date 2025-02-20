import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Paper,
    Button,
    Chip,
    Stack,
    Box,
    Divider
} from '@mui/material';
import { getVehicleById } from '../services/vehicleService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';

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
            } catch (error) {
                setError('Erreur lors du chargement du véhicule');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    if (loading) {
        return <LoadingScreen message="Chargement du véhicule..." />;
    }

    if (!vehicle && !error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography>Véhicule non trouvé</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <ErrorAlert error={error} />
            <Paper sx={{ p: 3, position: 'relative' }}>
                <Button
                    variant="outlined"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                    onClick={() => navigate(-1)}
                >
                    Retour
                </Button>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <img
                            src={vehicle.image || '/placeholder-car.jpg'}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px'
                            }}
                            onError={(e) => {
                                e.target.src = '/placeholder-car.jpg';
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom>
                            {vehicle.brand} {vehicle.model}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {vehicle.rental_price}€/jour
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Année
                                </Typography>
                                <Typography variant="body1">
                                    {vehicle.year}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Kilométrage
                                </Typography>
                                <Typography variant="body1">
                                    {vehicle.mileage} km
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                {vehicle.has_insurance && (
                                    <Chip label="Assuré" color="success" />
                                )}
                                {vehicle.has_maintenance && (
                                    <Chip label="Entretenu" color="success" />
                                )}
                            </Stack>
                            <Box>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {vehicle.description || "Aucune description disponible"}
                                </Typography>
                            </Box>
                        </Stack>
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