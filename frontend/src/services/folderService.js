import api from './api';

export const createFolder = async (folderData) => {
    const formData = new FormData();
    
    // Convertir les données du dossier en FormData
    Object.keys(folderData).forEach(key => {
        formData.append(key, folderData[key]);
    });

    const { data } = await api.post('/folders/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const getUserFolders = async () => {
    const { data } = await api.get('/folders/');
    return data;
}; 