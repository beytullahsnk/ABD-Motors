import api from './api';

export const createFolder = async (formData) => {
    try {
        const { data } = await api.post('/folders/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });
        return data;
    } catch (error) {
        if (error.response?.status === 400) {
            throw new Error('Données invalides pour la création du dossier');
        } else if (error.response?.status === 401) {
            throw new Error('Vous devez être connecté pour créer un dossier');
        } else if (error.response?.status === 403) {
            throw new Error('Vous n\'avez pas les droits pour créer un dossier');
        } else {
            throw new Error('Erreur lors de la création du dossier');
        }
    }
};

export const getUserFolders = async () => {
    const { data } = await api.get('/folders/');
    return data;
};

export const updateFolderStatus = async (folderId, status) => {
    const { data } = await api.patch(`/folders/${folderId}/`, { status });
    return data;
}; 