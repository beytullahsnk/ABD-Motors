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

const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login: loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Réinitialiser l'erreur

        try {
            await loginUser(login, password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response?.data);
            if (error.response?.status === 401) {
                setError('Identifiants incorrects');
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
                        id="login"
                        label="Email ou nom d'utilisateur"
                        name="login"
                        autoComplete="email username"
                        autoFocus
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
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
