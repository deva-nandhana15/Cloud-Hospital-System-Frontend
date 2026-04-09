import api from './api';

export const patientService = {
  createPatient: async (data) => {
    const response = await api.post('/api/patients/', data);
    return response.data;
  },

  getAllPatients: async () => {
    const response = await api.get('/api/patients/');
    return response.data;
  },

  getPatient: async (id) => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },

  updatePatient: async (id, data) => {
    const response = await api.put(`/api/patients/${id}`, data);
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await api.delete(`/api/patients/${id}`);
    return response.data;
  },

  addVitals: async (data) => {
    const response = await api.post('/api/patients/vitals/add', data);
    return response.data;
  },

  getPatientVitals: async (patientId) => {
    const response = await api.get(`/api/patients/${patientId}/vitals`);
    return response.data;
  },
};
