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
} from '@mui/material';
import ErrorAlert from '../components/ErrorAlert';
import { isValidEmail } from '../utils/validators';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Réinitialiser l'erreur

        if (!isValidEmail(email)) {
            setError('Format d\'email invalide');
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response?.data);
            if (error.response?.status === 401) {
                setError('Email ou mot de passe incorrect');
            } else {
                setError(error.response?.data?.detail || 'Une erreur est survenue');
            }
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
                    Connexion
                </Typography>
                <ErrorAlert error={error} />
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Se connecter
                    </Button>
                    <Link href="/register" variant="body2">
                        {"Pas encore de compte ? S'inscrire"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
