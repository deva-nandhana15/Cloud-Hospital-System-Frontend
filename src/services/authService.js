import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
  },

  getCurrentUser: () => {
    const uid = localStorage.getItem('user_id');
    return {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      user_id: uid != null && uid !== '' ? parseInt(uid, 10) : null,
      full_name: localStorage.getItem('full_name'),
    };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};