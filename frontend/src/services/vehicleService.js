import api from './api';

export const getVehicles = async () => {
    const { data } = await api.get('/vehicles/');
    return data;
};

export const getVehicleById = async (id) => {
    const { data } = await api.get(`/vehicles/${id}/`);
    return data;
}; 