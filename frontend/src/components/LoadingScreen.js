import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Chargement...' }) => (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        gap={2}
    >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
            {message}
        </Typography>
    </Box>
);

export default LoadingScreen; 