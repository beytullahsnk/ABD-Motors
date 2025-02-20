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
                    {vehicle.has_insurance && (
                        <Chip label="Assuré" size="small" color="success" />
                    )}
                    {vehicle.has_maintenance && (
                        <Chip label="Entretenu" size="small" color="success" />
                    )}
                </Stack>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                        {formatPrice(vehicle.rental_price)}
                    </Typography>
                    <Button 
                        size="small" 
                        variant="contained"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vehicles/${vehicle.id}/reserve`);
                        }}
                    >
                        Réserver
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default VehicleCard;