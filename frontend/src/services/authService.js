import api from './api';

const authService = {
    login: async (username, password) => {
        try {
            // Debug
            console.log('Attempting login with:', { username });

            // Obtention du token
            const { data: tokenData } = await api.post('/auth/token/', {
                username: username,
                password: password
            });

            if (!tokenData.access) {
                throw new Error('No access token received');
            }

            // Debug
            console.log('Token received:', tokenData);

            // Obtention des données utilisateur
            const { data: userData } = await api.get('/auth/users/me/', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access}`
                }
            });

            // Debug
            console.log('User data received:', userData);

            const user = {
                ...userData,
                access: tokenData.access,
                refresh: tokenData.refresh
            };

            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                response: {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers
                },
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data
                }
            });
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const data = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                role: 'CLIENT'
            };

            console.log('Attempting registration with data:', {
                ...data,
                password: '[HIDDEN]'
            });

            const response = await api.post('/auth/users/', data);
            console.log('Registration API response:', response.data);

            if (!response.data) {
                throw new Error('No response data from registration');
            }

            // Connecter automatiquement après l'inscription
            console.log('Attempting automatic login after registration');
            return await authService.login(userData.username, userData.password);
        } catch (error) {
            console.error('Registration error details:', {
                message: error.message,
                response: {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers
                },
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data ? {
                        ...error.config.data,
                        password: '[HIDDEN]'
                    } : null
                }
            });
            
            // Construire un message d'erreur plus descriptif
            let errorMessage = 'Erreur lors de l\'inscription: ';
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    // Si l'erreur contient des champs spécifiques
                    const fieldErrors = Object.entries(error.response.data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
                        .join(', ');
                    errorMessage += fieldErrors;
                } else {
                    errorMessage += error.response.data;
                }
            } else {
                errorMessage += error.message || 'Une erreur inconnue est survenue';
            }
            
            throw new Error(errorMessage);
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService; 