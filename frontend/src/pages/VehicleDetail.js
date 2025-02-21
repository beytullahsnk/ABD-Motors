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
import { formatPrice } from '../utils/dateUtils';

const getStatusColor = (state) => {
    switch (state) {
        case 'AVAILABLE':
            return 'success';
        case 'RESERVED':
            return 'warning';
        case 'SOLD':
        case 'RENTED':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusLabel = (state, type_offer) => {
    switch (state) {
        case 'AVAILABLE':
            return 'Disponible';
        case 'RESERVED':
            return 'Réservé';
        case 'SOLD':
            return 'Vendu';
        case 'RENTED':
            return 'En location';
        default:
            return state;
    }
};

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

    const getPriceDisplay = () => {
        if (!vehicle) return '';
        
        if (vehicle.type_offer === 'RENTAL') {
            return (
                <Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                        {formatPrice(vehicle.rental_price)}/jour
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Location
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Chip 
                            label={getStatusLabel(vehicle.state, vehicle.type_offer)}
                            color={getStatusColor(vehicle.state)}
                            size="small"
                        />
                    </Stack>
                </Box>
            );
        } else if (vehicle.type_offer === 'SALE') {
            return (
                <Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                        {formatPrice(vehicle.sale_price)}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Vente
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Chip 
                            label={getStatusLabel(vehicle.state, vehicle.type_offer)}
                            color={getStatusColor(vehicle.state)}
                            size="small"
                        />
                    </Stack>
                </Box>
            );
        }
    };

    const getActionButton = () => {
        if (!vehicle) return null;

        if (vehicle.state !== 'AVAILABLE') {
            return null;
        }

        if (vehicle.type_offer === 'RENTAL') {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate(`/vehicles/${vehicle.id}/reserve`)}
                >
                    Réserver maintenant
                </Button>
            );
        } else if (vehicle.type_offer === 'SALE') {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate(`/vehicles/${vehicle.id}/purchase`)}
                >
                    Acheter maintenant
                </Button>
            );
        }
    };

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
                        <Box sx={{ position: 'relative' }}>
                            <img
                                src={vehicle.image || '/images/placeholder-car.jpg'}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = '/images/placeholder-car.jpg';
                                }}
                            />
                            <Chip 
                                label={getStatusLabel(vehicle.state, vehicle.type_offer)}
                                color={getStatusColor(vehicle.state)}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom>
                            {vehicle.brand} {vehicle.model}
                        </Typography>
                        
                        {getPriceDisplay()}
                        
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
                                <Chip 
                                    label={vehicle.type_offer === 'RENTAL' ? 'À louer' : 'À vendre'} 
                                    color={vehicle.type_offer === 'RENTAL' ? 'primary' : 'secondary'}
                                />
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
                            {getActionButton()}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default VehicleDetail;