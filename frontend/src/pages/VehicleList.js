import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Alert,
    Box,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Chip,
    Stack,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Divider,
    useTheme,
} from '@mui/material';
import VehicleCard from '../components/VehicleCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import { getVehicles } from '../services/vehicleService';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const VehicleList = () => {
    const theme = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('year_desc');
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

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

    const filteredVehicles = vehicles
        .filter(vehicle => {
            const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'ALL' || vehicle.type_offer === typeFilter;
            const matchesAvailability = !showOnlyAvailable || vehicle.state === 'AVAILABLE';
            return matchesSearch && matchesType && matchesAvailability;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (a.type_offer === 'SALE' ? a.sale_price : a.rental_price) -
                           (b.type_offer === 'SALE' ? b.sale_price : b.rental_price);
                case 'price_desc':
                    return (b.type_offer === 'SALE' ? b.sale_price : b.rental_price) -
                           (a.type_offer === 'SALE' ? a.sale_price : a.rental_price);
                case 'year_desc':
                    return b.year - a.year;
                case 'year_asc':
                    return a.year - b.year;
                default:
                    return b.year - a.year;
            }
        });

    const handleResetFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setSortBy('year_desc');
        setShowOnlyAvailable(false);
    };

    if (loading) {
        return <LoadingScreen message="Chargement des véhicules..." />;
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            {/* En-tête avec fond dégradé */}
            <Box
                sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    color: 'white',
                    py: 6,
                    mb: 4,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography 
                                variant="h3" 
                                component="h1" 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 800,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                Nos Véhicules
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Découvrez notre sélection de véhicules disponibles à la location et à la vente
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card 
                                sx={{ 
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <DirectionsCarIcon sx={{ fontSize: 40, color: 'white' }} />
                                        <Box>
                                            <Typography sx={{ color: 'white' }}>
                                                Total de véhicules :
                                            </Typography>
                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                {vehicles.length}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <ErrorAlert error={error} />

                {/* Filtres et recherche */}
                <Card sx={{ mb: 4, p: 2 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher un véhicule..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <FormControl fullWidth>
                                <Select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    displayEmpty
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <TuneIcon />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="ALL">Tous les types</MenuItem>
                                    <MenuItem value="RENTAL">Location</MenuItem>
                                    <MenuItem value="SALE">Vente</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <FormControl fullWidth>
                                <Select
                                    value={showOnlyAvailable}
                                    onChange={(e) => setShowOnlyAvailable(e.target.value)}
                                    displayEmpty
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <DirectionsCarIcon />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value={false}>Tous les états</MenuItem>
                                    <MenuItem value={true}>Disponibles uniquement</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <FormControl fullWidth>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    displayEmpty
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SortIcon />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="year_desc">Plus récents</MenuItem>
                                    <MenuItem value="year_asc">Plus anciens</MenuItem>
                                    <MenuItem value="price_asc">Prix croissant</MenuItem>
                                    <MenuItem value="price_desc">Prix décroissant</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2.4} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <IconButton
                                onClick={handleResetFilters}
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    width: 56,
                                    height: 56,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                                title="Réinitialiser les filtres"
                            >
                                <RestartAltIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Card>

                {/* Résultats de la recherche */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {filteredVehicles.length} résultats trouvés
                    </Typography>
                </Box>

                {filteredVehicles.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <DirectionsCarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Aucun véhicule ne correspond à votre recherche
                        </Typography>
                        <Typography color="text.secondary">
                            Essayez de modifier vos critères de recherche
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {filteredVehicles.map((vehicle) => (
                            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                                <VehicleCard vehicle={vehicle} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default VehicleList; 