import api from './api';

export const labReportService = {
  uploadReport: async (formData) => {
    const response = await api.post('/api/lab-reports/upload', formData);
    return response.data;
  },

  getAllReports: async () => {
    const response = await api.get('/api/lab-reports/');
    return response.data;
  },

  getPatientReports: async (patientId) => {
    const response = await api.get(`/api/lab-reports/patient/${patientId}`);
    return response.data;
  },
};