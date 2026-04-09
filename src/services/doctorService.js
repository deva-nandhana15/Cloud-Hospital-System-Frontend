import api from './api';

export const doctorService = {
  createDoctor: async (data) => {
    const response = await api.post('/api/doctors/', data);
    return response.data;
  },

  getAllDoctors: async () => {
    const response = await api.get('/api/doctors/');
    return response.data;
  },

  getDoctor: async (id) => {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  },

  updateDoctor: async (id, data) => {
    const response = await api.put(`/api/doctors/${id}`, data);
    return response.data;
  },
};