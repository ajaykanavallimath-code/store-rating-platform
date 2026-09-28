import api from './api';

export const storeService = {
  getStores: async (params = {}) => {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  getStoreById: async (id) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  }
};

export default storeService;
