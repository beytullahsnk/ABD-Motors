import api from './api';

export const createFolder = async (formData) => {
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

export const updateFolderStatus = async (folderId, status) => {
    const { data } = await api.patch(`/folders/${folderId}/`, { status });
    return data;
}; 