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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                height: 90,
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar 
                    disableGutters 
                    sx={{ 
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 3
                    }}
                >
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease-in-out',
                            padding: '8px 16px',
                            borderRadius: '16px',
                            '&:hover': { 
                                transform: 'scale(1.02)',
                                backgroundColor: 'rgba(44, 62, 80, 0.04)'
                            }
                        }}
                        onClick={() => navigate('/vehicles')}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '16px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '16px',
                                boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'rotate(8deg) scale(1.1)',
                                    boxShadow: '0 6px 16px rgba(44, 62, 80, 0.25)'
                                }
                            }}
                        >
                            <DirectionsCarIcon 
                                sx={{ 
                                    fontSize: 38,
                                    color: 'white'
                                }} 
                            />
                        </Box>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{ 
                                fontWeight: 800,
                                background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '1px',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -4,
                                    left: 0,
                                    width: '0%',
                                    height: '3px',
                                    background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)',
                                    transition: 'width 0.3s ease-in-out',
                                    borderRadius: '2px'
                                },
                                '&:hover::after': {
                                    width: '100%'
                                }
                            }}
                        >
                            ABD Motors
                        </Typography>
                    </Box>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 3,
                            '& > *': {
                                transition: 'all 0.3s ease-in-out'
                            }
                        }}
                    >
                        <IconButton
                            onClick={() => navigate('/profile')}
                            sx={{
                                p: 0.5,
                                borderRadius: '50%',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    '& .MuiAvatar-root': {
                                        transform: 'translateY(-2px) scale(1.05)',
                                        boxShadow: '0 6px 16px rgba(44, 62, 80, 0.25)',
                                        bgcolor: 'primary.dark',
                                    }
                                }
                            }}
                        >
                            <Avatar 
                                sx={{ 
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'primary.main',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                    border: '2px solid white',
                                    boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)',
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                {user.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Button 
                            variant="contained"
                            color="primary"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ 
                                borderRadius: '16px',
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)',
                                background: 'linear-gradient(45deg, #2C3E50 30%, #3498DB 90%)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(44, 62, 80, 0.25)',
                                }
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