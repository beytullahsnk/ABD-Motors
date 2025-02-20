import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Alert,
} from '@mui/material';
import VehicleCard from '../components/VehicleCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { getVehicles } from '../services/vehicleService';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getVehicles();
                setVehicles(data);
            } catch (error) {
                setError('Erreur lors du chargement des véhicules');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (loading) {
        return <LoadingScreen message="Chargement des véhicules..." />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Véhicules disponibles
            </Typography>
            
            <ErrorAlert error={error} />
            
            {vehicles.length === 0 ? (
                <Alert severity="info">
                    Aucun véhicule disponible pour le moment
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {vehicles.map((vehicle) => (
                        <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                            <VehicleCard vehicle={vehicle} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default VehicleList; 