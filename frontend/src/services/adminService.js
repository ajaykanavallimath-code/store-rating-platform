import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  getStores: async (params = {}) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  getStoreById: async (id) => {
    const response = await api.get(`/admin/stores/${id}`);
    return response.data;
  },

  createStore: async (storeData) => {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  }
};

export default adminService;
