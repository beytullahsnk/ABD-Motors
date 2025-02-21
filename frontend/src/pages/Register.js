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
    Grid,
} from '@mui/material';
import ErrorAlert from '../components/ErrorAlert';
import { isValidEmail, isValidPhone, isStrongPassword } from '../utils/validators';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des champs
        if (!isValidEmail(formData.email)) {
            setError('Format d\'email invalide');
            return;
        }

        if (!formData.username.trim()) {
            setError('Le nom d\'utilisateur est requis');
            return;
        }

        if (!formData.firstName.trim()) {
            setError('Le prénom est requis');
            return;
        }

        if (!formData.lastName.trim()) {
            setError('Le nom est requis');
            return;
        }

        if (formData.phone && !isValidPhone(formData.phone)) {
            setError('Format de numéro de téléphone invalide');
            return;
        }

        if (!isStrongPassword(formData.password)) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await register(formData);
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.detail || 'Erreur lors de l\'inscription');
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
                <ErrorAlert error={error} />
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
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="username"
                                label="Nom d'utilisateur"
                                value={formData.username}
                                onChange={handleChange}
                                helperText="Ce nom d'utilisateur sera utilisé pour vous connecter"
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
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="phone"
                                label="Téléphone (facultatif)"
                                value={formData.phone}
                                onChange={handleChange}
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
                                helperText="8 caractères minimum"
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
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        S'inscrire
                    </Button>
                    <Link href="/login" variant="body2">
                        Déjà un compte ? Se connecter
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;