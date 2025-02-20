import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from '../services/vehicleService';
import { getUserFolders } from '../services/folderService';
import VehicleCard from '../components/VehicleCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate, formatPrice } from '../utils/dateUtils';
import { 
    FOLDER_STATUS_LABELS, 
    FOLDER_STATUS_COLORS 
} from '../utils/constants';

const getFolderStatusColor = (status) => {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'error';
        default: return 'default';
    }
};

const getFolderStatusLabel = (status) => {
    switch (status) {
        case 'PENDING': return 'En attente';
        case 'APPROVED': return 'Approuvé';
        case 'REJECTED': return 'Refusé';
        default: return status;
    }
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesData, foldersData] = await Promise.all([
                    getVehicles(),
                    getUserFolders()
                ]);
                setVehicles(vehiclesData);
                setFolders(foldersData);
            } catch (error) {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <LoadingScreen message="Chargement du tableau de bord..." />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <ErrorAlert error={error} />
            
            {/* En-tête avec profil utilisateur */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6">
                            Bienvenue, {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Dossiers de location */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Mes dossiers de location
                </Typography>
                {folders.length === 0 ? (
                    <Typography color="text.secondary">
                        Vous n'avez pas encore de dossier de location
                    </Typography>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Dates</TableCell>
                                    <TableCell>Statut</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {folders.map((folder) => (
                                    <TableRow key={folder.id}>
                                        <TableCell>
                                            {folder.vehicle.brand} {folder.vehicle.model}
                                        </TableCell>
                                        <TableCell>
                                            Du {formatDate(folder.start_date)} au {formatDate(folder.end_date)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={FOLDER_STATUS_LABELS[folder.status]}
                                                color={FOLDER_STATUS_COLORS[folder.status]}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Véhicules disponibles */}
            <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                    Véhicules disponibles
                </Typography>
                <Grid container spacing={3}>
                    {vehicles.map((vehicle) => (
                        <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                            <VehicleCard vehicle={vehicle} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default Dashboard;