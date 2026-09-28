import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Helper to fetch updated store aggregate rating
 */
const getStoreRatingSummary = async (storeId) => {
  const [rows] = await pool.query(`
    SELECT 
      COALESCE(ROUND(AVG(rating), 1), 0) as avgRating,
      COUNT(id) as totalRatings
    FROM ratings
    WHERE store_id = ?
  `, [storeId]);

  return {
    avgRating: Number(rows[0]?.avgRating) || 0,
    totalRatings: Number(rows[0]?.totalRatings) || 0
  };
};

/**
 * Submit new rating for a store
 * POST /api/ratings
 */
export const createRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check that store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return errorResponse(res, 'Store not found.', null, 404);
    }

    // Check if user already rated this store
    const [existing] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length > 0) {
      return errorResponse(
        res,
        'You have already submitted a rating for this store. You can update your existing rating.',
        { storeId: 'Rating already submitted for this store.' },
        409
      );
    }

    // Insert new rating
    const [result] = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );

    const summary = await getStoreRatingSummary(storeId);

    return successResponse(res, 'Thank you! Your rating has been submitted successfully.', {
      ratingId: result.insertId,
      storeId: Number(storeId),
      rating: Number(rating),
      avgRating: summary.avgRating,
      totalRatings: summary.totalRatings
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing rating for a store
 * PUT /api/ratings/:storeId
 */
export const updateRating = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const { rating } = req.body;
    const userId = req.user.id;

    if (isNaN(storeId)) {
      return errorResponse(res, 'Invalid store ID.', null, 400);
    }

    // Check if store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return errorResponse(res, 'Store not found.', null, 404);
    }

    // Check if rating exists
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let ratingId;
    if (existing.length > 0) {
      ratingId = existing[0].id;
      await pool.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [rating, ratingId, userId]
      );
    } else {
      // Upsert if not yet submitted
      const [insertResult] = await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      ratingId = insertResult.insertId;
    }

    const summary = await getStoreRatingSummary(storeId);

    return successResponse(res, 'Your rating has been updated successfully.', {
      ratingId,
      storeId,
      rating: Number(rating),
      avgRating: summary.avgRating,
      totalRatings: summary.totalRatings
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ratings submitted by the current authenticated user
 * GET /api/ratings/mine
 */
export const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [ratings] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id as storeId,
        s.name as storeName,
        s.address as storeAddress,
        s.email as storeEmail
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.updated_at DESC
    `, [userId]);

    return successResponse(res, 'User ratings retrieved successfully.', ratings);
  } catch (error) {
    next(error);
  }
};
