import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('srp_token', response.data.data.token);
      localStorage.setItem('srp_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data?.data?.token) {
      localStorage.setItem('srp_token', response.data.data.token);
      localStorage.setItem('srp_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('srp_token');
      localStorage.removeItem('srp_user');
    }
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    localStorage.removeItem('srp_token');
    localStorage.removeItem('srp_user');
    return response.data;
  }
};

export default authService;
