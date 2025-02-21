import api from './api';

const authService = {
    login: async (email, password) => {
        try {
            // Debug
            console.log('Attempting login with:', { email });

            // Obtention du token
            const { data: tokenData } = await api.post('/auth/token/', {
                username: email,
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
            // S'assurer que le username est l'email
            const data = {
                username: userData.email,
                email: userData.email,
                password: userData.password,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                role: 'CLIENT'
            };

            const response = await api.post('/auth/users/', data);
            console.log('Register success:', response.data);

            // Connecter automatiquement après l'inscription
            return await authService.login(userData.email, userData.password);
        } catch (error) {
            console.error('Register error:', error.response?.data);
            throw error;
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