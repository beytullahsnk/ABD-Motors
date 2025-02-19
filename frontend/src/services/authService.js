import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const authService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/token/`, {
                email,
                password
            });
            if (response.data.access) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            // Transformer les données pour correspondre au modèle backend
            const backendData = {
                username: userData.email,
                email: userData.email,
                password: userData.password,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                role: 'CLIENT',
                is_active: true
            };

            const response = await axios.post(`${API_URL}/users/`, backendData);
            return response.data;
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);
            if (error.response?.data) {
                const errors = error.response.data;
                if (typeof errors === 'object') {
                    // Construire un message d'erreur à partir des erreurs du backend
                    const errorMessage = Object.entries(errors)
                        .map(([field, messages]) => {
                            // Traduire les noms de champs pour l'utilisateur
                            const fieldTranslations = {
                                username: 'Nom d\'utilisateur',
                                email: 'Email',
                                password: 'Mot de passe',
                                first_name: 'Prénom',
                                last_name: 'Nom',
                                phone: 'Téléphone'
                            };
                            const fieldName = fieldTranslations[field] || field;
                            return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                        })
                        .join('\n');
                    throw new Error(errorMessage);
                }
            }
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export default authService; 