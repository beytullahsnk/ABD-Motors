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

    // Debug pour voir l'URL de l'image
    console.log('Vehicle image data:', {
        vehicle: vehicle.brand + ' ' + vehicle.model,
        imageUrl: vehicle.image_url,
        imagePath: vehicle.image,
        fullImageUrl: vehicle.image_url ? new URL(vehicle.image_url).href : null
    });

    // Fonction pour vérifier si l'URL est accessible
    const checkImageUrl = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log('Image URL check:', {
                url,
                status: response.status,
                ok: response.ok
            });
        } catch (error) {
            console.error('Image URL check failed:', error);
        }
    };

    // Vérifier l'URL si elle existe
    React.useEffect(() => {
        if (vehicle.image_url) {
            checkImageUrl(vehicle.image_url);
        }
    }, [vehicle.image_url]);

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
            <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                <CardMedia
                    component="img"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    image={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    onError={(e) => {
                        console.error('Image load error:', {
                            vehicle: vehicle.brand + ' ' + vehicle.model,
                            attemptedUrl: vehicle.image_url,
                            error: e.error,
                            imageDetails: {
                                naturalWidth: e.target.naturalWidth,
                                naturalHeight: e.target.naturalHeight,
                                currentSrc: e.target.currentSrc
                            }
                        });
                        e.target.src = '/images/placeholder-car.jpg';
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
                    {vehicle.has_insurance && (
                        <Chip label="Assuré" size="small" color="success" />
                    )}
                    {vehicle.has_maintenance && (
                        <Chip label="Entretenu" size="small" color="success" />
                    )}
                </Stack>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                        {formatPrice(vehicle.rental_price)}/jour
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