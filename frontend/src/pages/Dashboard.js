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
    IconButton,
    Collapse,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from '../services/vehicleService';
import { getUserFolders } from '../services/folderService';
import VehicleCard from '../components/VehicleCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate, formatPrice } from '../utils/dateUtils';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { 
    FOLDER_STATUS_LABELS, 
    FOLDER_STATUS_COLORS 
} from '../utils/constants';

const getFolderStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'APPROVED':
            return 'success';
        case 'REJECTED':
            return 'error';
        default:
            return 'default';
    }
};

const getFolderStatusLabel = (status) => {
    switch (status) {
        case 'PENDING':
            return 'En attente';
        case 'APPROVED':
            return 'Approuvé';
        case 'REJECTED':
            return 'Refusé';
        default:
            return status;
    }
};

const getFileTypeLabel = (fileType) => {
    switch (fileType) {
        case 'ID_CARD':
            return 'Carte d\'identité';
        case 'DRIVER_LICENSE':
            return 'Permis de conduire';
        case 'PROOF_ADDRESS':
            return 'Justificatif de domicile';
        case 'INCOME_PROOF':
            return 'Justificatif de revenus';
        case 'INSURANCE':
            return 'Attestation d\'assurance';
        case 'OTHER':
            return 'Autre document';
        default:
            return fileType;
    }
};

const FolderRow = ({ folder }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle2">
                        {folder.vehicle.brand} {folder.vehicle.model}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={getFolderStatusLabel(folder.status)}
                        color={getFolderStatusColor(folder.status)}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/vehicles/${folder.vehicle.id}`)}
                    >
                        Voir le véhicule
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Documents fournis:
                            </Typography>
                            <Stack direction="column" spacing={1}>
                                {folder.files && folder.files.map((file, index) => (
                                    <Box key={index}>
                                        <Typography variant="body2">
                                            {getFileTypeLabel(file.file_type)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
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
                                    <TableCell width={50} />
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {folders.map((folder) => (
                                    <FolderRow key={folder.id} folder={folder} />
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