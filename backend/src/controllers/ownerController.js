import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all stores owned by the authenticated owner
 * GET /api/owner/stores
 */
export const getOwnerStores = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as avgRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [ownerId]);

    const formattedStores = stores.map(store => ({
      ...store,
      avgRating: Number(store.avgRating) || 0,
      totalRatings: Number(store.totalRatings) || 0
    }));

    return successResponse(res, 'Owner stores retrieved successfully.', formattedStores);
  } catch (error) {
    next(error);
  }
};

/**
 * Owner Dashboard: Metrics and Paginated Customer Ratings for assigned store
 * GET /api/owner/dashboard
 */
export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // 1. Fetch all stores owned by this owner
    const [ownedStores] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as avgRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `, [ownerId]);

    if (ownedStores.length === 0) {
      return successResponse(res, 'No stores currently assigned to your account.', {
        stores: [],
        currentStore: null,
        stats: {
          storeName: 'N/A',
          avgRating: 0,
          totalRatings: 0
        },
        ratings: []
      }, 200, { total: 0, page: 1, limit: 10, totalPages: 0 });
    }

    // Determine target store: either provided storeId or first assigned store
    let targetStoreId = req.query.storeId ? parseInt(req.query.storeId, 10) : ownedStores[0].id;
    
    // Security check: verify the target store belongs to this owner
    const targetStore = ownedStores.find(s => s.id === targetStoreId);
    if (!targetStore) {
      return errorResponse(res, 'Access denied. You are not authorized to view ratings for this store.', null, 403);
    }

    // Pagination and sorting for customer ratings
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at'
    };

    const sortBy = allowedSortFields[req.query.sortBy] || 'r.created_at';
    const order = (req.query.order && req.query.order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    // Count ratings for target store
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM ratings WHERE store_id = ?',
      [targetStoreId]
    );
    const totalRatings = countResult[0].total;

    // Fetch customer ratings
    const [customerRatings] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.name as customerName,
        u.email as customerEmail
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `, [targetStoreId, limit, offset]);

    return successResponse(res, 'Owner dashboard data fetched successfully.', {
      stores: ownedStores.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        avgRating: Number(s.avgRating) || 0,
        totalRatings: Number(s.totalRatings) || 0
      })),
      currentStore: {
        id: targetStore.id,
        name: targetStore.name,
        email: targetStore.email,
        address: targetStore.address,
        avgRating: Number(targetStore.avgRating) || 0,
        totalRatings: Number(targetStore.totalRatings) || 0
      },
      ratings: customerRatings
    }, 200, {
      total: totalRatings,
      page,
      limit,
      totalPages: Math.ceil(totalRatings / limit)
    });
  } catch (error) {
    next(error);
  }
};
