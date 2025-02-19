import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Fonction pour obtenir le token JWT
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.access) {
        return { Authorization: `Bearer ${user.access}` };
    }
    return {};
};

export const getAvailableVehicles = async () => {
    try {
        const response = await axios.get(`${API_URL}/vehicles/available/`, {
            headers: {
                ...getAuthHeader()
            }
        });
        console.log('Vehicles response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
};

export const getVehicleById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/vehicles/${id}/`, {
            headers: {
                ...getAuthHeader()
            }
        });
        console.log('Vehicle details response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle details:', error.response?.data || error.message);
        throw error;
    }
}; 