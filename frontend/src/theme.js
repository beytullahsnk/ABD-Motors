import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2C3E50',
            light: '#34495E',
            dark: '#1A252F',
        },
        secondary: {
            main: '#E74C3C',
            light: '#FF6B6B',
            dark: '#C0392B',
        },
        background: {
            default: '#F8F9FA',
            paper: '#FFFFFF',
        },
        error: {
            main: '#E74C3C',
        },
        warning: {
            main: '#F39C12',
        },
        success: {
            main: '#27AE60',
        },
        text: {
            primary: '#2C3E50',
            secondary: '#7F8C8D',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
            letterSpacing: '0.02em',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    padding: '10px 20px',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(44, 62, 80, 0.1)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(44, 62, 80, 0.1)',
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(44, 62, 80, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid rgba(44, 62, 80, 0.05)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(44, 62, 80, 0.08)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(44, 62, 80, 0.05)',
                    border: '1px solid rgba(44, 62, 80, 0.05)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#2C3E50',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(44, 62, 80, 0.08)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    height: '28px',
                },
                filled: {
                    backgroundColor: 'rgba(44, 62, 80, 0.08)',
                    '&:hover': {
                        backgroundColor: 'rgba(44, 62, 80, 0.12)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 6,
                        backgroundColor: '#FFFFFF',
                        '& fieldset': {
                            borderColor: 'rgba(44, 62, 80, 0.15)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(44, 62, 80, 0.3)',
                        },
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(44, 62, 80, 0.08)',
                },
            },
        },
    },
});

export default theme; 