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
    Divider,
    IconButton,
    Fade
} from '@mui/material';
import { getVehicleById, getAdjacentVehicles } from '../services/vehicleService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { formatPrice } from '../utils/dateUtils';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

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
    const [adjacentVehicles, setAdjacentVehicles] = useState({ previous: null, next: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Charger d'abord les données du véhicule
                const vehicleData = await getVehicleById(id);
                setVehicle(vehicleData);
                setLoading(false);

                // Charger les véhicules adjacents en arrière-plan
                const adjacentData = await getAdjacentVehicles(id);
                setAdjacentVehicles(adjacentData);
            } catch (error) {
                setError('Erreur lors du chargement du véhicule');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleNavigate = (vehicleId) => {
        navigate(`/vehicles/${vehicleId}`);
    };

    const getPriceDisplay = () => {
        if (!vehicle) return '';
        
        if (vehicle.type_offer === 'RENTAL') {
            return (
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'baseline'
                        }}
                    >
                        {formatPrice(vehicle.rental_price)}
                        <Typography 
                            component="span" 
                            sx={{ 
                                fontSize: '1.2rem',
                                ml: 1,
                                color: 'text.secondary',
                                fontWeight: 500
                            }}
                        >
                            /jour
                        </Typography>
                    </Typography>
                </Box>
            );
        } else if (vehicle.type_offer === 'SALE') {
            return (
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 1
                        }}
                    >
                        {formatPrice(vehicle.sale_price)}
                    </Typography>
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
            <ErrorAlert error={error} />
            
            {/* Navigation Arrows */}
            <Box>
                {adjacentVehicles.previous && (
                    <IconButton
                        sx={{
                            position: 'fixed',
                            left: { xs: 16, md: '5%' },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                            width: { xs: 40, md: 56 },
                            height: { xs: 40, md: 56 },
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) scale(1.05)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                '& .MuiSvgIcon-root': {
                                    transform: 'translateX(-2px)',
                                    color: 'primary.main',
                                }
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => handleNavigate(adjacentVehicles.previous)}
                    >
                        <ArrowBackIosNewIcon 
                            sx={{ 
                                fontSize: { xs: 20, md: 24 },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                color: 'text.primary',
                            }} 
                        />
                    </IconButton>
                )}
                {adjacentVehicles.next && (
                    <IconButton
                        sx={{
                            position: 'fixed',
                            right: { xs: 16, md: '5%' },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                            width: { xs: 40, md: 56 },
                            height: { xs: 40, md: 56 },
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) scale(1.05)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                '& .MuiSvgIcon-root': {
                                    transform: 'translateX(2px)',
                                    color: 'primary.main',
                                }
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => handleNavigate(adjacentVehicles.next)}
                    >
                        <ArrowForwardIosIcon 
                            sx={{ 
                                fontSize: { xs: 20, md: 24 },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                color: 'text.primary',
                            }} 
                        />
                    </IconButton>
                )}
            </Box>

            <Paper 
                sx={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                }}
                elevation={0}
            >
                <Button
                    variant="outlined"
                    sx={{ 
                        position: 'absolute',
                        top: 24,
                        left: 24,
                        zIndex: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        px: 3,
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={() => navigate('/vehicles')}
                >
                    Retour
                </Button>

                <Grid container>
                    <Grid item xs={12} md={7}>
                        <Box 
                            sx={{ 
                                position: 'relative',
                                height: { xs: '300px', md: '600px' },
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={vehicle.image || '/images/placeholder-car.jpg'}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: vehicle.state !== 'AVAILABLE' ? 'brightness(0.9)' : 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                }}
                                onError={(e) => {
                                    e.target.src = '/images/placeholder-car.jpg';
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4))',
                                }}
                            />
                            <Chip 
                                label={getStatusLabel(vehicle.state, vehicle.type_offer)}
                                sx={{
                                    position: 'absolute',
                                    top: 24,
                                    right: 24,
                                    height: '32px',
                                    backgroundColor: theme => {
                                        switch (vehicle.state) {
                                            case 'AVAILABLE':
                                                return 'rgba(39, 174, 96, 0.95)';
                                            case 'RESERVED':
                                                return 'rgba(243, 156, 18, 0.95)';
                                            case 'SOLD':
                                            case 'RENTED':
                                                return 'rgba(231, 76, 60, 0.95)';
                                            default:
                                                return 'rgba(127, 140, 141, 0.95)';
                                        }
                                    },
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.02em',
                                    backdropFilter: 'blur(8px)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    '& .MuiChip-label': {
                                        padding: '0 16px',
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box 
                            sx={{ 
                                p: { xs: 3, md: 5 },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                            }}
                        >
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    mb: 1,
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                    lineHeight: 1.2
                                }}
                            >
                                {vehicle.brand} {vehicle.model}
                            </Typography>
                            
                            {getPriceDisplay()}
                            
                            <Divider sx={{ my: 4 }} />
                            
                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <Typography 
                                        variant="subtitle2" 
                                        color="text.secondary" 
                                        sx={{ mb: 1, fontSize: '0.875rem' }}
                                    >
                                        Année
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {vehicle.year}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography 
                                        variant="subtitle2" 
                                        color="text.secondary" 
                                        sx={{ mb: 1, fontSize: '0.875rem' }}
                                    >
                                        Kilométrage
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        {vehicle.mileage} km
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Stack 
                                direction="row" 
                                spacing={1.5} 
                                sx={{ 
                                    mt: 4,
                                    flexWrap: 'wrap',
                                    gap: 1.5
                                }}
                            >
                                <Chip 
                                    label={vehicle.type_offer === 'RENTAL' ? 'À louer' : 'À vendre'} 
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        height: '32px',
                                        '& .MuiChip-label': {
                                            px: 2
                                        }
                                    }}
                                />
                                {vehicle.has_insurance && (
                                    <Chip 
                                        label="Assuré" 
                                        sx={{
                                            bgcolor: 'rgba(39, 174, 96, 0.1)',
                                            color: 'success.dark',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            height: '32px',
                                            '& .MuiChip-label': {
                                                px: 2
                                            }
                                        }}
                                    />
                                )}
                                {vehicle.has_maintenance && (
                                    <Chip 
                                        label="Entretenu" 
                                        sx={{
                                            bgcolor: 'rgba(39, 174, 96, 0.1)',
                                            color: 'success.dark',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            height: '32px',
                                            '& .MuiChip-label': {
                                                px: 2
                                            }
                                        }}
                                    />
                                )}
                            </Stack>

                            <Box sx={{ mt: 4 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    color="text.secondary" 
                                    sx={{ 
                                        mb: 2,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Description
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: 'text.primary',
                                        lineHeight: 1.8,
                                        fontSize: '1rem',
                                        opacity: 0.9
                                    }}
                                >
                                    {vehicle.description || "Aucune description disponible"}
                                </Typography>
                            </Box>
                            
                            <Box 
                                sx={{ 
                                    mt: 'auto', 
                                    pt: 5,
                                    position: 'sticky',
                                    bottom: 0,
                                    bgcolor: 'background.paper',
                                    zIndex: 1
                                }}
                            >
                                {getActionButton()}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default VehicleDetail;