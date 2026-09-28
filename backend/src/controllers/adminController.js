import pool from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Admin Dashboard Stats
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total users and breakdown by role
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as totalAdmins,
        SUM(CASE WHEN role = 'USER' THEN 1 ELSE 0 END) as totalNormalUsers,
        SUM(CASE WHEN role = 'OWNER' THEN 1 ELSE 0 END) as totalOwners
      FROM users
    `);

    // 2. Total stores
    const [storeStats] = await pool.query('SELECT COUNT(*) as totalStores FROM stores');

    // 3. Total ratings & overall platform average
    const [ratingStats] = await pool.query(`
      SELECT 
        COUNT(*) as totalRatings,
        COALESCE(ROUND(AVG(rating), 2), 0) as platformAvgRating
      FROM ratings
    `);

    // 4. Rating distribution (1 to 5 stars)
    const [ratingDistribution] = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings
      GROUP BY rating
      ORDER BY rating DESC
    `);

    // 5. Recent store ratings
    const [recentRatings] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as userName,
        u.email as userEmail,
        s.id as storeId,
        s.name as storeName
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    return successResponse(res, 'Dashboard statistics fetched successfully.', {
      counts: {
        totalUsers: Number(userStats[0].totalUsers) || 0,
        totalAdmins: Number(userStats[0].totalAdmins) || 0,
        totalNormalUsers: Number(userStats[0].totalNormalUsers) || 0,
        totalOwners: Number(userStats[0].totalOwners) || 0,
        totalStores: Number(storeStats[0].totalStores) || 0,
        totalRatings: Number(ratingStats[0].totalRatings) || 0,
        platformAvgRating: Number(ratingStats[0].platformAvgRating) || 0
      },
      ratingDistribution,
      recentRatings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with search, filter, sort and pagination
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { search, name, email, address, role } = req.query;

    // Safe Sort Field Allowlist
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at'
    };

    const sortBy = allowedSortFields[req.query.sortBy] || 'u.created_at';
    const order = (req.query.order && req.query.order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    // Build parameterized query
    const whereConditions = [];
    const queryParams = [];

    if (search && search.trim() !== '') {
      whereConditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (name && name.trim() !== '') {
      whereConditions.push('u.name LIKE ?');
      queryParams.push(`%${name.trim()}%`);
    }

    if (email && email.trim() !== '') {
      whereConditions.push('u.email LIKE ?');
      queryParams.push(`%${email.trim()}%`);
    }

    if (address && address.trim() !== '') {
      whereConditions.push('u.address LIKE ?');
      queryParams.push(`%${address.trim()}%`);
    }

    if (role && ['ADMIN', 'USER', 'OWNER'].includes(role.toUpperCase())) {
      whereConditions.push('u.role = ?');
      queryParams.push(role.toUpperCase());
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM users u ${whereSql}`;
    const [countResult] = await pool.query(countSql, queryParams);
    const total = countResult[0].total;

    // Data query (safe parameterized query, never inject unvalidated variables into SQL)
    const dataSql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at, 
        u.updated_at,
        (SELECT COUNT(*) FROM stores s WHERE s.owner_id = u.id) as ownedStoresCount,
        (SELECT COUNT(*) FROM ratings r WHERE r.user_id = u.id) as ratingsGivenCount
      FROM users u
      ${whereSql}
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    const [users] = await pool.query(dataSql, [...queryParams, limit, offset]);

    return successResponse(res, 'Users retrieved successfully.', users, 200, {
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
 * Get user by ID with detailed context
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return errorResponse(res, 'Invalid user ID.', null, 400);
    }

    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const user = users[0];

    // If user is OWNER, load their assigned stores and rating statistics
    if (user.role === 'OWNER') {
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
      `, [userId]);

      user.stores = stores.map(s => ({
        ...s,
        avgRating: Number(s.avgRating) || 0,
        totalRatings: Number(s.totalRatings) || 0
      }));
    }

    // If user is USER, load their rating activity
    if (user.role === 'USER') {
      const [ratings] = await pool.query(`
        SELECT 
          r.id,
          r.rating,
          r.created_at,
          r.updated_at,
          s.id as storeId,
          s.name as storeName,
          s.address as storeAddress
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);

      user.ratings = ratings;
    }

    return successResponse(res, 'User details retrieved successfully.', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Create User (ADMIN, USER, or OWNER)
 * POST /api/admin/users
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    // Check email uniqueness
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email address already exists.', {
        email: 'An account with this email address already exists.'
      }, 409);
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, normalizedEmail, hashedPassword, trimmedAddress, role]
    );

    const newUser = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
      address: trimmedAddress,
      role
    };

    return successResponse(res, `${role} user account created successfully.`, newUser, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin List Stores with filters, pagination, and sorting
 * GET /api/admin/stores
 */
export const getStores = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { search, name, email, address } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      avg_rating: 'avgRating',
      rating_count: 'totalRatings',
      created_at: 's.created_at'
    };

    const sortBy = allowedSortFields[req.query.sortBy] || 's.created_at';
    const order = (req.query.order && req.query.order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const whereConditions = [];
    const queryParams = [];

    if (search && search.trim() !== '') {
      whereConditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (name && name.trim() !== '') {
      whereConditions.push('s.name LIKE ?');
      queryParams.push(`%${name.trim()}%`);
    }

    if (email && email.trim() !== '') {
      whereConditions.push('s.email LIKE ?');
      queryParams.push(`%${email.trim()}%`);
    }

    if (address && address.trim() !== '') {
      whereConditions.push('s.address LIKE ?');
      queryParams.push(`%${address.trim()}%`);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching stores
    const countSql = `SELECT COUNT(*) as total FROM stores s ${whereSql}`;
    const [countResult] = await pool.query(countSql, queryParams);
    const total = countResult[0].total;

    // Query data with owner info and rating aggregates
    const dataSql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name as ownerName,
        u.email as ownerEmail,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as avgRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereSql}
      GROUP BY s.id, u.name, u.email
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `;

    const [stores] = await pool.query(dataSql, [...queryParams, limit, offset]);

    const formattedStores = stores.map(store => ({
      ...store,
      avgRating: Number(store.avgRating) || 0,
      totalRatings: Number(store.totalRatings) || 0,
      displayRating: Number(store.totalRatings) > 0 ? `${Number(store.avgRating).toFixed(1)} / 5` : 'No ratings yet'
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
 * Admin Create Store (Optionally assigns existing owner or creates new owner via transaction)
 * POST /api/admin/stores
 */
export const createStore = async (req, res, next) => {
  let connection;
  try {
    const { name, email, address, owner_id } = req.body;
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedAddress = address.trim();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let assignedOwnerId = null;

    if (owner_id) {
      // Validate that the assigned owner exists and has role 'OWNER'
      const [ownerRows] = await connection.query(
        'SELECT id, role, name, email FROM users WHERE id = ?',
        [owner_id]
      );

      if (ownerRows.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'The selected store owner does not exist.', {
          owner_id: 'Selected owner not found.'
        }, 400);
      }

      if (ownerRows[0].role !== 'OWNER') {
        await connection.rollback();
        return errorResponse(res, 'The selected user does not have the STORE OWNER role.', {
          owner_id: 'User must have role OWNER to be assigned to a store.'
        }, 400);
      }

      assignedOwnerId = ownerRows[0].id;
    }

    const [result] = await connection.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [trimmedName, normalizedEmail, trimmedAddress, assignedOwnerId]
    );

    await connection.commit();

    const createdStore = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
      address: trimmedAddress,
      owner_id: assignedOwnerId
    };

    return successResponse(res, 'Store created successfully.', createdStore, 201);
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Admin Get Store By ID
 * GET /api/admin/stores/:id
 */
export const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return errorResponse(res, 'Invalid store ID.', null, 400);
    }

    const [stores] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name as ownerName,
        u.email as ownerEmail,
        COALESCE(ROUND(AVG(r.rating), 1), 0) as avgRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id, u.name, u.email
    `, [storeId]);

    if (stores.length === 0) {
      return errorResponse(res, 'Store not found.', null, 404);
    }

    const store = stores[0];
    store.avgRating = Number(store.avgRating) || 0;
    store.totalRatings = Number(store.totalRatings) || 0;
    store.displayRating = store.totalRatings > 0 ? `${store.avgRating.toFixed(1)} / 5` : 'No ratings yet';

    // Fetch individual customer ratings for this store
    const [ratings] = await pool.query(`
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
      ORDER BY r.created_at DESC
    `, [storeId]);

    store.ratings = ratings;

    return successResponse(res, 'Store details retrieved successfully.', store);
  } catch (error) {
    next(error);
  }
};
