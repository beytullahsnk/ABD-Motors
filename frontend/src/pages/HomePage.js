import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Grid, Card, CardContent } from "@mui/material";

const HomePage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicules = async () => {
      setLoading(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem("user"));
      const token = user ? user.access : null;

      if (!token) {
        setError("Aucun token trouvé. Connectez-vous d'abord.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/vehicles/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setVehicules(response.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des véhicules. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicules();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Liste des Véhicules
      </Typography>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={2}>
        {vehicules.map((vehicule) => (
          <Grid item xs={12} sm={6} md={4} key={vehicule.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{vehicule.marque} {vehicule.modele}</Typography>
                <Typography>Année : {vehicule.year}</Typography>
                <Typography>Prix : {vehicule.sale_price} €</Typography>
                <Typography>Prix : {vehicule.rental_price} €</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;