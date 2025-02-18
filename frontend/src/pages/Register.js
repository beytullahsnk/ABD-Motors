import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    Grid,
    CircularProgress
} from '@mui/material';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Réinitialiser l'erreur lorsque l'utilisateur modifie un champ
        setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
            setError('Veuillez remplir tous les champs obligatoires');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registrationData } = formData;
            await register(registrationData);
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.data) {
                // Gestion des erreurs spécifiques du backend
                const backendError = error.response.data;
                if (backendError.email) {
                    setError("Cette adresse email est déjà utilisée");
                } else if (backendError.detail) {
                    setError(backendError.detail);
                } else {
                    setError("Une erreur est survenue lors de l'inscription");
                }
            } else {
                setError("Une erreur est survenue lors de l'inscription");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Inscription
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                name="firstName"
                                label="Prénom"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!error && !formData.firstName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                name="lastName"
                                label="Nom"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!error && !formData.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="email"
                                label="Adresse email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!error && !formData.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="phone"
                                label="Téléphone"
                                value={formData.phone}
                                onChange={handleChange}
                                error={!!error && !formData.phone}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Mot de passe"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!error && (!formData.password || formData.password.length < 8)}
                                helperText="Le mot de passe doit contenir au moins 8 caractères"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirmer le mot de passe"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!error && formData.password !== formData.confirmPassword}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "S'inscrire"}
                    </Button>
                    <Link href="/login" variant="body2">
                        {"Déjà un compte ? Se connecter"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Register; 