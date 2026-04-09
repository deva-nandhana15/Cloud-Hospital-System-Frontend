import api from './api';

export const billingService = {
  createBill: async (data) => {
    const response = await api.post('/api/billing/', data);
    return response.data;
  },

  getAllBills: async () => {
    const response = await api.get('/api/billing/');
    return response.data;
  },

  getBill: async (id) => {
    const response = await api.get(`/api/billing/${id}`);
    return response.data;
  },

  updateBill: async (id, data) => {
    const response = await api.put(`/api/billing/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id) => {
    const response = await api.patch(`/api/billing/${id}/pay`);
    return response.data;
  },

  markAsOverdue: async (id) => {
    const response = await api.patch(`/api/billing/${id}/overdue`);
    return response.data;
  },
};
