import api from './api';

export const ratingService = {
  createRating: async (storeId, rating) => {
    const response = await api.post('/ratings', { storeId, rating });
    return response.data;
  },

  updateRating: async (storeId, rating) => {
    const response = await api.put(`/ratings/${storeId}`, { rating });
    return response.data;
  },

  getMyRatings: async () => {
    const response = await api.get('/ratings/mine');
    return response.data;
  }
};

export default ratingService;
