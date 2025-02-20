import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import FolderCreation from './pages/FolderCreation';

// Theme
import theme from './theme';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Chargement..." />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <AuthProvider>
                    <Router>
                        <Routes>
                            {/* Routes publiques */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Routes protégées */}
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/vehicles"
                                element={
                                    <PrivateRoute>
                                        <VehicleList />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/vehicles/:id"
                                element={
                                    <PrivateRoute>
                                        <VehicleDetail />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/vehicles/:id/reserve"
                                element={
                                    <PrivateRoute>
                                        <FolderCreation />
                                    </PrivateRoute>
                                }
                            />

                            {/* Redirection par défaut */}
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default App;
