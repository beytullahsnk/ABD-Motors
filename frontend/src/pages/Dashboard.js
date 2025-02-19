import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAvailableVehicles } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getAvailableVehicles();
                console.log('Fetched vehicles:', data);
                setVehicles(data);
                setLoading(false);
            } catch (err) {
                console.error('Error in dashboard:', err);
                setError(err.response?.data?.detail || 'Erreur lors du chargement des véhicules');
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            console.log('User in dashboard:', user);
            console.log('First name:', user.first_name);
            console.log('Last name:', user.last_name);
        }
    }, [user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    // Si pas d'utilisateur, rediriger vers la page de connexion
    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* En-tête avec profil utilisateur */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h6" component="h1">
                                Bienvenue, {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleLogout}
                        >
                            Se déconnecter
                        </Button>
                    </Paper>
                </Grid>

                {/* Liste des véhicules disponibles */}
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        Véhicules disponibles
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {vehicles.length === 0 && !error ? (
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
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 