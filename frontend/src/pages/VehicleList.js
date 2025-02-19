import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';
import VehicleCard from '../components/VehicleCard';
import { getAvailableVehicles } from '../services/vehicleService';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getAvailableVehicles();
                setVehicles(data);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des véhicules');
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Véhicules disponibles
            </Typography>
            <Grid container spacing={3}>
                {vehicles.map((vehicle) => (
                    <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                        <VehicleCard vehicle={vehicle} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default VehicleList; 