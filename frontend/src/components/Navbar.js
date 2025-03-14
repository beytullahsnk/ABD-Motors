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
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <AppBar 
            position="sticky" 
            sx={{
                backgroundColor: 'background.paper',
                height: 70,
                display: 'flex',
                justifyContent: 'center',
            }}
            elevation={0}
        >
            <Container maxWidth="lg">
                <Toolbar 
                    disableGutters 
                    sx={{ 
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            gap: 2,
                            '&:hover': {
                                '& .car-icon': {
                                    transform: 'scale(1.1) rotate(-5deg)',
                                    color: 'primary.dark',
                                },
                                '& .logo-text': {
                                    transform: 'translateX(4px)',
                                    color: 'primary.dark',
                                }
                            }
                        }}
                        onClick={() => navigate('/vehicles')}
                    >
                        <DirectionsCarIcon 
                            sx={{ 
                                fontSize: 28,
                                color: 'primary.main',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            className="car-icon"
                        />
                        <Typography
                            variant="h5"
                            component="div"
                            className="logo-text"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main',
                                letterSpacing: '-0.01em',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            ABD Motors
                        </Typography>
                    </Box>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                        }}
                    >
                        <IconButton
                            onClick={() => navigate('/profile')}
                            sx={{
                                padding: 0.5,
                            }}
                        >
                            <Avatar 
                                sx={{ 
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                }}
                            >
                                {user.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Button 
                            variant="outlined"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ 
                                borderColor: 'rgba(44, 62, 80, 0.2)',
                                color: 'text.primary',
                            }}
                        >
                            Déconnexion
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 