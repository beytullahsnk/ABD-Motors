import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

const getStatusLabel = (state) => {
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

const VehicleCard = ({ vehicle }) => {
    const navigate = useNavigate();

    const getPriceDisplay = () => {
        if (vehicle.type_offer === 'RENTAL') {
            return `${formatPrice(vehicle.rental_price)}/jour`;
        } else if (vehicle.type_offer === 'SALE') {
            return formatPrice(vehicle.sale_price);
        }
        return 'Prix non disponible';
    };

    const getActionButton = () => {
        if (vehicle.state !== 'AVAILABLE') {
            return null;
        }

        if (vehicle.type_offer === 'RENTAL') {
            return (
                <Button 
                    size="small" 
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vehicles/${vehicle.id}/reserve`);
                    }}
                >
                    Louer
                </Button>
            );
        } else if (vehicle.type_offer === 'SALE') {
            return (
                <Button 
                    size="small" 
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vehicles/${vehicle.id}/purchase`);
                    }}
                >
                    Acheter
                </Button>
            );
        }
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    boxShadow: 6,
                    cursor: 'pointer'
                }
            }}
            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={vehicle.image || '/placeholder-car.jpg'}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    onError={(e) => {
                        e.target.src = '/placeholder-car.jpg';
                    }}
                    sx={{
                        filter: vehicle.state !== 'AVAILABLE' ? 'brightness(0.9)' : 'none',
                    }}
                />
                <Chip 
                    label={getStatusLabel(vehicle.state)}
                    color={getStatusColor(vehicle.state)}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        height: '24px',
                        backgroundColor: theme => {
                            switch (vehicle.state) {
                                case 'AVAILABLE':
                                    return 'rgba(39, 174, 96, 0.9)';
                                case 'RESERVED':
                                    return 'rgba(243, 156, 18, 0.9)';
                                case 'SOLD':
                                case 'RENTED':
                                    return 'rgba(231, 76, 60, 0.9)';
                                default:
                                    return 'rgba(127, 140, 141, 0.9)';
                            }
                        },
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.02em',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        '& .MuiChip-label': {
                            padding: '0 8px',
                        }
                    }}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                    {vehicle.brand} {vehicle.model}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {vehicle.year} - {vehicle.mileage} km
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                    <Chip 
                        label={vehicle.type_offer === 'RENTAL' ? 'À louer' : 'À vendre'} 
                        sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                        size="small" 
                    />
                    {vehicle.has_insurance && (
                        <Chip label="Assuré" size="small" color="success" />
                    )}
                    {vehicle.has_maintenance && (
                        <Chip label="Entretenu" size="small" color="success" />
                    )}
                </Stack>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                        {getPriceDisplay()}
                    </Typography>
                    {getActionButton()}
                </Box>
            </CardContent>
        </Card>
    );
};

export default VehicleCard;