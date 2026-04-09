import api from './api';

export const appointmentService = {
  bookAppointment: async (data) => {
    const response = await api.post('/api/appointments/', data);
    return response.data;
  },

  getAllAppointments: async () => {
    const response = await api.get('/api/appointments/');
    return response.data;
  },

  getAppointment: async (id) => {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data;
  },

  updateAppointment: async (id, data) => {
    const response = await api.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.patch(`/api/appointments/${id}/cancel`);
    return response.data;
  },

  completeAppointment: async (id) => {
    const response = await api.patch(`/api/appointments/${id}/complete`);
    return response.data;
  },
};
