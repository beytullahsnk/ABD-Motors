import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Avatar,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <AppBar position="sticky" elevation={0}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 70 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <DirectionsCarIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
                        <Typography
                            variant="h5"
                            component="div"
                            sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ABD Motors
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <Button 
                            color="primary"
                            onClick={() => navigate('/dashboard')}
                            sx={{ 
                                fontWeight: 500,
                                '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.04)' }
                            }}
                        >
                            Tableau de bord
                        </Button>
                        <Button 
                            color="primary"
                            onClick={() => navigate('/vehicles')}
                            sx={{ 
                                fontWeight: 500,
                                '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.04)' }
                            }}
                        >
                            Véhicules
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    width: 40,
                                    height: 40,
                                    fontWeight: 600,
                                }}
                            >
                                {user.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Button 
                                variant="outlined"
                                color="primary"
                                onClick={handleLogout}
                                sx={{ 
                                    borderRadius: 20,
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: 'rgba(44, 62, 80, 0.04)',
                                    }
                                }}
                            >
                                Déconnexion
                            </Button>
                        </Box>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 