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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    MenuItem,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Person as PersonIcon,
    Folder as FolderIcon,
    DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolders } from '../services/folderService';
import { getVehicles } from '../services/vehicleService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/dateUtils';
import { isValidPhone } from '../utils/validators';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    CheckCircle as ValidateIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon,
    HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
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

const getStatusChip = (status) => {
    const statusConfig = {
        'PENDING': { color: 'warning', label: 'En attente' },
        'IN_PROGRESS': { color: 'info', label: 'En cours' },
        'VALIDATED': { color: 'success', label: 'Validé' },
        'REJECTED': { color: 'error', label: 'Rejeté' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
};

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [folders, setFolders] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
    });
    const [success, setSuccess] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        sort: 'newest'
    });

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
        setEditMode(true);
        setFormData({
            email: user?.email || '',
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || '',
        });
    };

    const handleCancel = () => {
        setEditMode(false);
        setError(null);
    };

    const validateForm = () => {
        if (!formData.email || !formData.first_name || !formData.last_name) {
            setError('Tous les champs obligatoires doivent être remplis');
            return false;
        }

        if (!isValidPhone(formData.phone)) {
            setError('Format de numéro de téléphone invalide');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const { data } = await api.patch('/auth/users/me/', formData);
            setUser({ ...user, ...data });
            setEditMode(false);
            setSuccess('Profil mis à jour avec succès');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError('Erreur lors de la mise à jour du profil');
        }
    };

    const handleStatusChange = async (folderId, newStatus, rejectionReason = '') => {
        try {
            // Mettre à jour le statut du dossier
            await api.post(`/folders/${folderId}/change_status/`, {
                status: newStatus,
                rejection_reason: rejectionReason
            });

            // Trouver le dossier concerné
            const folder = folders.find(f => f.id === folderId);
            if (folder && folder.vehicle) {
                // Si le dossier est validé
                if (newStatus === 'VALIDATED') {
                    // Mettre à jour l'état du véhicule et assigner le client
                    await api.patch(`/vehicles/${folder.vehicle.id}/`, {
                        state: folder.type_folder === 'PURCHASE' ? 'SOLD' : 'RENTED',
                        [folder.type_folder === 'PURCHASE' ? 'owner' : 'renter']: folder.client.id,
                        rental_start_date: folder.type_folder === 'RENTAL' ? new Date().toISOString() : null
                    });
                }
                // Si le dossier est rejeté
                else if (newStatus === 'REJECTED') {
                    // Remettre le véhicule comme disponible et retirer le client
                    await api.patch(`/vehicles/${folder.vehicle.id}/`, {
                        state: 'AVAILABLE',
                        owner: null,
                        renter: null,
                        rental_start_date: null,
                        rental_end_date: null
                    });
                }
            }

            setSuccess('Statut du dossier mis à jour avec succès');
            // Rafraîchir les données
            fetchFolders();
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut');
            console.error('Error updating status:', err);
        }
    };

    const handlePreview = (file) => {
        setSelectedFile(file);
        setOpenPreview(true);
    };

    const renderFilePreview = () => {
        if (!selectedFile) return null;

        const fileUrl = selectedFile.file;
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);

        return isImage ? (
            <img src={fileUrl} alt="Document" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        ) : (
            <iframe
                src={fileUrl}
                title="Document"
                width="100%"
                height="500px"
                style={{ border: 'none' }}
            />
        );
    };

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const fetchFolders = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type_folder', filters.type);
            
            const { data } = await api.get(`/folders/?${params.toString()}`);
            
            // Tri des dossiers
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a.creation_date);
                const dateB = new Date(b.creation_date);
                return filters.sort === 'newest' ? dateB - dateA : dateA - dateB;
            });
            
            setFolders(sortedData);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des dossiers');
            console.error('Error fetching folders:', err);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, [filters]);

    if (loading) {
        return <LoadingScreen message="Chargement du profil..." />;
    }

    // Interface pour les clients
    if (user?.role !== 'ADMIN') {
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
                                        {editMode ? (
                                            <Stack spacing={2} sx={{ mt: 2 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Prénom"
                                                            value={formData.first_name}
                                                            onChange={handleChange('first_name')}
                                                            fullWidth
                                                            required
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Nom"
                                                            value={formData.last_name}
                                                            onChange={handleChange('last_name')}
                                                            fullWidth
                                                            required
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <TextField
                                                    label="Email"
                                                    value={formData.email}
                                                    onChange={handleChange('email')}
                                                    fullWidth
                                                    required
                                                    type="email"
                                                />
                                                <TextField
                                                    label="Téléphone"
                                                    value={formData.phone}
                                                    onChange={handleChange('phone')}
                                                    fullWidth
                                                    helperText="Format: +33 6 12 34 56 78"
                                                />
                                            </Stack>
                                        ) : (
                                            <>
                                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                                <Stack spacing={1}>
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
                                                    label={user.role === 'CLIENT' ? 'Client' : 'Gestionnaire'} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ mt: 2 }}
                                                    icon={<PersonIcon />}
                                                />
                                            </>
                                        )}
                                    </Box>
                                    <Box>
                                        {editMode ? (
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSave}
                                                    startIcon={<SaveIcon />}
                                                >
                                                    Enregistrer
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleCancel}
                                                    startIcon={<CancelIcon />}
                                                >
                                                    Annuler
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                onClick={handleEdit}
                                                startIcon={<EditIcon />}
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Statistiques des dossiers */}
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

                {/* Liste des dossiers */}
                <Card>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {FOLDER_TABS.map((tab) => (
                            <Tab 
                                key={tab.value}
                                label={`${tab.label} (${getFoldersByStatus(tab.value).length})`}
                                icon={<FolderIcon />}
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>

                    {FOLDER_TABS.map((tab, index) => (
                        <TabPanel key={tab.value} value={tabValue} index={index}>
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
                                        {getFoldersByStatus(tab.value).map((folder) => (
                                            <TableRow key={folder.id}>
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
                                                        color={folder.type_folder === 'RENTAL' ? 'primary' : 'secondary'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(folder.creation_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
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
                                        {getFoldersByStatus(tab.value).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    <Typography variant="body1" sx={{ py: 2 }}>
                                                        Aucun dossier {tab.label.toLowerCase()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    ))}
                </Card>
            </Container>
        );
    }

    // Interface pour les administrateurs
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="profile tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Informations personnelles" />
                    <Tab label="Gestion des dossiers" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h5">
                                {editMode ? 'Modifier le profil' : 'Informations personnelles'}
                            </Typography>
                            {!editMode ? (
                                <Button
                                    startIcon={<EditIcon />}
                                    variant="outlined"
                                    onClick={handleEdit}
                                >
                                    Modifier
                                </Button>
                            ) : (
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                    >
                                        Enregistrer
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    value={editMode ? formData.first_name : user?.first_name}
                                    onChange={handleChange('first_name')}
                                    disabled={!editMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    value={editMode ? formData.last_name : user?.last_name}
                                    onChange={handleChange('last_name')}
                                    disabled={!editMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={editMode ? formData.email : user?.email}
                                    onChange={handleChange('email')}
                                    disabled={!editMode}
                                    required
                                    type="email"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    value={editMode ? formData.phone : user?.phone}
                                    onChange={handleChange('phone')}
                                    disabled={!editMode}
                                    helperText="Format: +33 6 12 34 56 78"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {user?.role === 'ADMIN' && (
                        <Paper sx={{ mb: 3, p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FilterIcon color="action" />
                                <TextField
                                    select
                                    label="Statut"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                >
                                    <MenuItem value="">Tous</MenuItem>
                                    <MenuItem value="PENDING">En attente</MenuItem>
                                    <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                                    <MenuItem value="VALIDATED">Validés</MenuItem>
                                    <MenuItem value="REJECTED">Rejetés</MenuItem>
                                </TextField>
                                <TextField
                                    select
                                    label="Type de dossier"
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                >
                                    <MenuItem value="">Tous</MenuItem>
                                    <MenuItem value="PURCHASE">Achat</MenuItem>
                                    <MenuItem value="RENTAL">Location</MenuItem>
                                </TextField>
                                <TextField
                                    select
                                    label="Trier par date"
                                    value={filters.sort}
                                    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                >
                                    <MenuItem value="newest">Plus récents</MenuItem>
                                    <MenuItem value="oldest">Plus anciens</MenuItem>
                                </TextField>
                            </Stack>
                        </Paper>
                    )}

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Véhicule</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell>Documents</TableCell>
                                    <TableCell>Statut</TableCell>
                                    {user?.role === 'ADMIN' && (
                                        <TableCell align="center">Actions</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {folders.map((folder) => (
                                    <TableRow key={folder.id}>
                                        <TableCell>
                                            {folder.client.first_name} {folder.client.last_name}
                                        </TableCell>
                                        <TableCell>
                                            {folder.type_folder === 'PURCHASE' ? 'Achat' : 'Location'}
                                        </TableCell>
                                        <TableCell>
                                            {folder.vehicle.brand} {folder.vehicle.model}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(folder.creation_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {folder.files.map((file) => (
                                                    <Chip
                                                        key={file.id}
                                                        label={file.file_type}
                                                        size="small"
                                                        onClick={() => handlePreview(file)}
                                                        icon={<ViewIcon />}
                                                    />
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(folder.status)}
                                        </TableCell>
                                        {user?.role === 'ADMIN' && (
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    {folder.status !== 'PENDING' && (
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => handleStatusChange(folder.id, 'PENDING')}
                                                            title="Mettre en attente"
                                                        >
                                                            <HourglassEmptyIcon />
                                                        </IconButton>
                                                    )}
                                                    {folder.status !== 'VALIDATED' && (
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleStatusChange(folder.id, 'VALIDATED')}
                                                            title="Valider"
                                                        >
                                                            <ValidateIcon />
                                                        </IconButton>
                                                    )}
                                                    {folder.status !== 'REJECTED' && (
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleStatusChange(folder.id, 'REJECTED')}
                                                            title="Rejeter"
                                                        >
                                                            <RejectIcon />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>

            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Aperçu du document
                    {selectedFile && ` - ${selectedFile.file_type}`}
                </DialogTitle>
                <DialogContent>
                    {renderFilePreview()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPreview(false)}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile; 