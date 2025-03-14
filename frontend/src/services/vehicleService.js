import api from './api';

export const getVehicles = async () => {
    const { data } = await api.get('/vehicles/');
    return data;
};

export const getVehicleById = async (id) => {
    const { data } = await api.get(`/vehicles/${id}/`);
    return data;
};

export const getAdjacentVehicles = async (currentId) => {
    const { data: vehicles } = await api.get('/vehicles/');
    const currentIndex = vehicles.findIndex(v => v.id === parseInt(currentId));
    
    return {
        previous: currentIndex > 0 ? vehicles[currentIndex - 1].id : null,
        next: currentIndex < vehicles.length - 1 ? vehicles[currentIndex + 1].id : null
    };
}; 