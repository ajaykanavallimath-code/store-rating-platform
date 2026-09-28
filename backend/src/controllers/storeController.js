import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * List stores for Normal Users and Browsing
 * GET /api/stores
 */
export const getStores = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const { search, name, address } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      avg_rating: 'avgRating',
      rating_count: 'totalRatings',
      created_at: 's.created_at'
    };

    const sortBy = allowedSortFields[req.query.sortBy] || 's.name';
    const order = (req.query.order && req.query.order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const whereConditions = [];
    const queryParams = [];

    if (search && search.trim() !== '') {
      whereConditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (name && name.trim() !== '') {
      whereConditions.push('s.name LIKE ?');
      queryParams.push(`%${name.trim()}%`);
    }

    if (address && address.trim() !== '') {
      whereConditions.push('s.address LIKE ?');
      queryParams.push(`%${address.trim()}%`);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total stores
    const countSql = `SELECT COUNT(*) as total FROM stores s ${whereSql}`;
    const [countResult] = await pool.query(countSql, queryParams);
    const total = countResult[0].total;

    // Subquery for current user's rating if logged in
    const userRatingSelect = currentUserId 
      ? `(SELECT r_user.rating FROM ratings r_user WHERE r_user.store_id = s.id AND r_user.user_id = ?) as userSubmittedRating,`
      : `NULL as userSubmittedRating,`;

    const dataParams = currentUserId ? [currentUserId, ...queryParams] : [...queryParams];

    const dataSql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        ${userRatingSelect}
        COALESCE(ROUND(AVG(r.rating), 1), 0) as avgRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereSql}
      GROUP BY s.id
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    const [stores] = await pool.query(dataSql, [...dataParams, limit, offset]);

    const formattedStores = stores.map(store => ({
      ...store,
      avgRating: Number(store.avgRating) || 0,
      totalRatings: Number(store.totalRatings) || 0,
      userSubmittedRating: store.userSubmittedRating !== null ? Number(store.userSubmittedRating) : null
    }));

    return successResponse(res, 'Stores retrieved successfully.', formattedStores, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single store details
 * GET /api/stores/:id
 */
export const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return errorResponse(res, 'Invalid store ID.', null, 400);
    }

    const currentUserId = req.user ? req.user.id : null;

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
      WHERE s.id = ?
      GROUP BY s.id
    `, [storeId]);

    if (stores.length === 0) {
      return errorResponse(res, 'Store not found.', null, 404);
    }

    const store = stores[0];
    store.avgRating = Number(store.avgRating) || 0;
    store.totalRatings = Number(store.totalRatings) || 0;

    let userSubmittedRating = null;
    let userRatingDate = null;

    if (currentUserId) {
      const [userRatings] = await pool.query(
        'SELECT rating, updated_at FROM ratings WHERE store_id = ? AND user_id = ?',
        [storeId, currentUserId]
      );
      if (userRatings.length > 0) {
        userSubmittedRating = Number(userRatings[0].rating);
        userRatingDate = userRatings[0].updated_at;
      }
    }

    store.userSubmittedRating = userSubmittedRating;
    store.userRatingDate = userRatingDate;

    return successResponse(res, 'Store details retrieved successfully.', store);
  } catch (error) {
    next(error);
  }
};
