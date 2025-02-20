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
            <CardMedia
                component="img"
                height="200"
                image={vehicle.image || '/placeholder-car.jpg'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                onError={(e) => {
                    e.target.src = '/placeholder-car.jpg';
                }}
            />
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
                        size="small" 
                        color={vehicle.type_offer === 'RENTAL' ? 'primary' : 'secondary'}
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