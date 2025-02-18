import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* En-tête */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography component="h1" variant="h5">
                            Tableau de bord
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => navigate('/reservations/new')}>
                            Nouvelle réservation
                        </Button>
                    </Paper>
                </Grid>

                {/* Informations utilisateur */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Profil
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1">
                                Nom: {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body1">
                                Email: {user?.email}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleLogout}
                            sx={{ mt: 2 }}
                        >
                            Se déconnecter
                        </Button>
                    </Paper>
                </Grid>

                {/* Réservations en cours */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Mes réservations en cours
                        </Typography>
                        {/* Liste des réservations à implémenter */}
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Aucune réservation en cours
                        </Typography>
                    </Paper>
                </Grid>

                {/* Historique des réservations */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Historique des réservations
                        </Typography>
                        {/* Historique à implémenter */}
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Aucun historique disponible
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 