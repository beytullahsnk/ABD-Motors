import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const createReservation = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/reservations/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating reservation:', error.response?.data || error.message);
        throw error;
    }
};

export const getUserReservations = async () => {
    try {
        const response = await axios.get(`${API_URL}/reservations/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reservations:', error.response?.data || error.message);
        throw error;
    }
}; 