import axios from 'axios';
import { API_URL, DEFAULT_HEADERS } from '../utils/config';

// Instance axios avec configuration de base
const api = axios.create({
    baseURL: API_URL,
    headers: DEFAULT_HEADERS,
});

// Log des requêtes
api.interceptors.request.use(
    (config) => {
        console.log('Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
        });
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.access) {
            config.headers.Authorization = `Bearer ${user.access}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Log des réponses
api.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api; 