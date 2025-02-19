import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Titre de l'application */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Mon App
        </Typography>

        {/* Liens de navigation */}
        <Button color="inherit" component={Link} to="/">
          Accueil
        </Button>

        {user && (
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>
        )}

        {user ? (
          <Button color="inherit" onClick={logout}>
            Déconnexion
          </Button>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/register">
              S'inscrire
            </Button>
            <Button color="inherit" component={Link} to="/login">
              Connexion
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;