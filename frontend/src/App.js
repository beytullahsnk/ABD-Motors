import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import VehicleReservation from './pages/VehicleReservation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
                    <VehicleReservation />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
