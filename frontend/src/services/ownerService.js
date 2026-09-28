import api from './api';

export const ownerService = {
  getStores: async () => {
    const response = await api.get('/owner/stores');
    return response.data;
  },

  getDashboard: async (params = {}) => {
    const response = await api.get('/owner/dashboard', { params });
    return response.data;
  }
};

export default ownerService;
