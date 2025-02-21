import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Avatar,
    Grid,
    Tabs,
    Tab,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    IconButton,
    Stack,
    Divider,
    Card,
    CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FolderIcon from '@mui/icons-material/Folder';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolders } from '../services/folderService';
import { getVehicles } from '../services/vehicleService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/dateUtils';
import { isValidPhone } from '../utils/validators';
import api from '../services/api';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const getFolderStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'VALIDATED':
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
        case 'VALIDATED':
            return 'Validé';
        case 'REJECTED':
            return 'Refusé';
        default:
            return status;
    }
};

// Constantes pour les états des dossiers
const FOLDER_TABS = [
    { value: 'PENDING', label: 'En attente', color: 'warning' },
    { value: 'VALIDATED', label: 'Validés', color: 'success' },
    { value: 'REJECTED', label: 'Refusés', color: 'error' }
];

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [folders, setFolders] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        username: user.username || '',
        phone: user.phone || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const foldersData = await getUserFolders();
                setFolders(foldersData);
            } catch (error) {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filtrage des dossiers par état
    const getFoldersByStatus = (status) => {
        return folders.filter(folder => folder.status === status);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({
            username: user.username || '',
            phone: user.phone || '',
            first_name: user.first_name || '',
            last_name: user.last_name || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setValidationErrors({});
    };

    const validateForm = () => {
        const errors = {};
        
        if (!editedData.username.trim()) {
            errors.username = 'Le nom d\'utilisateur est requis';
        }
        
        if (!editedData.first_name.trim()) {
            errors.first_name = 'Le prénom est requis';
        }

        if (!editedData.last_name.trim()) {
            errors.last_name = 'Le nom est requis';
        }
        
        if (editedData.phone && !isValidPhone(editedData.phone)) {
            errors.phone = 'Format de numéro de téléphone invalide';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await api.patch('/auth/users/me/', {
                username: editedData.username,
                phone: editedData.phone,
                first_name: editedData.first_name,
                last_name: editedData.last_name
            });
            
            // Vérifier si nous avons reçu une réponse valide
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }

            // Récupérer l'utilisateur stocké
            const storedUser = JSON.parse(localStorage.getItem('user'));
            
            // Créer l'utilisateur mis à jour
            const updatedUser = {
                ...storedUser,
                username: response.data.username,
                phone: response.data.phone,
                first_name: response.data.first_name,
                last_name: response.data.last_name
            };

            // Mettre à jour le localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Mettre à jour le contexte
            setUser(updatedUser);

            setIsEditing(false);
            setValidationErrors({});
            setError(null);
        } catch (error) {
            console.error('Erreur de mise à jour:', error);
            
            // Gestion détaillée des erreurs
            if (error.response) {
                // Erreur avec réponse du serveur
                console.error('Données de l\'erreur:', error.response.data);
                
                if (error.response.data?.username) {
                    setValidationErrors(prev => ({
                        ...prev,
                        username: Array.isArray(error.response.data.username) 
                            ? error.response.data.username[0] 
                            : error.response.data.username
                    }));
                }
                
                if (error.response.data?.phone) {
                    setValidationErrors(prev => ({
                        ...prev,
                        phone: Array.isArray(error.response.data.phone) 
                            ? error.response.data.phone[0] 
                            : error.response.data.phone
                    }));
                }

                if (error.response.data?.first_name) {
                    setValidationErrors(prev => ({
                        ...prev,
                        first_name: Array.isArray(error.response.data.first_name) 
                            ? error.response.data.first_name[0] 
                            : error.response.data.first_name
                    }));
                }

                if (error.response.data?.last_name) {
                    setValidationErrors(prev => ({
                        ...prev,
                        last_name: Array.isArray(error.response.data.last_name) 
                            ? error.response.data.last_name[0] 
                            : error.response.data.last_name
                    }));
                }

                setError(
                    error.response.data?.detail || 
                    error.response.data?.message ||
                    'Erreur lors de la mise à jour du profil. Veuillez vérifier vos informations.'
                );
            } else if (error.request) {
                // Erreur sans réponse du serveur
                setError('Impossible de contacter le serveur. Veuillez vérifier votre connexion.');
            } else {
                // Erreur lors de la configuration de la requête
                setError(error.message || 'Une erreur est survenue lors de la mise à jour du profil.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (event) => {
        setEditedData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    if (loading) {
        return <LoadingScreen message="Chargement du profil..." />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <ErrorAlert error={error} />
            
            {/* En-tête du profil */}
            <Card sx={{ mb: 3, overflow: 'visible' }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar 
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem',
                                    fontWeight: 600,
                                    boxShadow: 3
                                }}
                            >
                                {user.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    {isEditing ? (
                                        <Stack spacing={2} sx={{ mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="Prénom"
                                                        value={editedData.first_name}
                                                        onChange={handleChange('first_name')}
                                                        error={!!validationErrors.first_name}
                                                        helperText={validationErrors.first_name}
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="Nom"
                                                        value={editedData.last_name}
                                                        onChange={handleChange('last_name')}
                                                        error={!!validationErrors.last_name}
                                                        helperText={validationErrors.last_name}
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <TextField
                                                label="Nom d'utilisateur"
                                                value={editedData.username}
                                                onChange={handleChange('username')}
                                                error={!!validationErrors.username}
                                                helperText={validationErrors.username}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                }}
                                            />
                                            <TextField
                                                label="Téléphone"
                                                value={editedData.phone}
                                                onChange={handleChange('phone')}
                                                error={!!validationErrors.phone}
                                                helperText={validationErrors.phone}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                }}
                                            />
                                        </Stack>
                                    ) : (
                                        <>
                                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                                                {user.first_name} {user.last_name}
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <BadgeIcon sx={{ mr: 1 }} />
                                                    <Typography>@{user.username}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <EmailIcon sx={{ mr: 1 }} />
                                                    <Typography>{user.email}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <PhoneIcon sx={{ mr: 1 }} />
                                                    <Typography>{user.phone || 'Aucun numéro de téléphone'}</Typography>
                                                </Box>
                                            </Stack>
                                            <Chip 
                                                label={user.role} 
                                                color="primary" 
                                                size="small" 
                                                sx={{ mt: 2 }}
                                                icon={<PersonIcon />}
                                            />
                                        </>
                                    )}
                                </Box>
                                <Box>
                                    {isEditing ? (
                                        <Stack direction="row" spacing={1}>
                                            <IconButton 
                                                onClick={handleSave} 
                                                color="primary" 
                                                title="Enregistrer"
                                                sx={{ 
                                                    bgcolor: 'primary.light',
                                                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                                }}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={handleCancel} 
                                                color="error" 
                                                title="Annuler"
                                                sx={{ 
                                                    bgcolor: 'error.light',
                                                    '&:hover': { bgcolor: 'error.main', color: 'white' }
                                                }}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        <IconButton 
                                            onClick={handleEdit} 
                                            color="primary" 
                                            title="Modifier"
                                            sx={{ 
                                                bgcolor: 'primary.light',
                                                '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {FOLDER_TABS.map((tab) => (
                    <Grid item xs={12} sm={4} key={tab.value}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: `${tab.color}.light` }}>
                                        <FolderIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">{getFoldersByStatus(tab.value).length}</Typography>
                                        <Typography color="text.secondary">Dossiers {tab.label.toLowerCase()}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Onglets et tableaux */}
            <Card>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab 
                        label={`En attente (${getFoldersByStatus('PENDING').length})`}
                        icon={<FolderIcon />}
                        iconPosition="start"
                    />
                    <Tab 
                        label={`Validés (${getFoldersByStatus('VALIDATED').length})`}
                        icon={<FolderIcon />}
                        iconPosition="start"
                    />
                    <Tab 
                        label={`Refusés (${getFoldersByStatus('REJECTED').length})`}
                        icon={<FolderIcon />}
                        iconPosition="start"
                    />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFoldersByStatus('PENDING').map((folder) => (
                                    <TableRow key={folder.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2">
                                                {folder.vehicle.brand} {folder.vehicle.model}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {folder.vehicle.year}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={folder.type_folder === 'RENTAL' ? 'Location' : 'Achat'}
                                                sx={{ 
                                                    bgcolor: folder.type_folder === 'RENTAL' ? 'primary.main' : 'secondary.main',
                                                    color: 'white',
                                                    fontWeight: 500
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(folder.creation_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => navigate(`/vehicles/${folder.vehicle.id}`)}
                                                startIcon={<DirectionsCarIcon />}
                                            >
                                                Voir le véhicule
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFoldersByStatus('VALIDATED').map((folder) => (
                                    <TableRow key={folder.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2">
                                                {folder.vehicle.brand} {folder.vehicle.model}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {folder.vehicle.year}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={folder.type_folder === 'RENTAL' ? 'Location' : 'Achat'}
                                                sx={{ 
                                                    bgcolor: folder.type_folder === 'RENTAL' ? 'primary.main' : 'secondary.main',
                                                    color: 'white',
                                                    fontWeight: 500
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(folder.creation_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => navigate(`/vehicles/${folder.vehicle.id}`)}
                                                startIcon={<DirectionsCarIcon />}
                                            >
                                                Voir le véhicule
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFoldersByStatus('REJECTED').map((folder) => (
                                    <TableRow key={folder.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2">
                                                {folder.vehicle.brand} {folder.vehicle.model}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {folder.vehicle.year}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={folder.type_folder === 'RENTAL' ? 'Location' : 'Achat'}
                                                sx={{ 
                                                    bgcolor: folder.type_folder === 'RENTAL' ? 'primary.main' : 'secondary.main',
                                                    color: 'white',
                                                    fontWeight: 500
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(folder.creation_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => navigate(`/vehicles/${folder.vehicle.id}`)}
                                                startIcon={<DirectionsCarIcon />}
                                            >
                                                Voir le véhicule
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Card>
        </Container>
    );
};

export default Profile; 