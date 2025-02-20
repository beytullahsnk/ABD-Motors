import React from 'react';
import { Alert, Box } from '@mui/material';

const ErrorAlert = ({ error, sx = {} }) => {
    if (!error) return null;
    
    return (
        <Box sx={{ mb: 2, ...sx }}>
            <Alert severity="error">
                {error}
            </Alert>
        </Box>
    );
};

export default ErrorAlert; 