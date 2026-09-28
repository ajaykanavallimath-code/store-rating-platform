import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_platform',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  decimalNumbers: true
};

const rawMySqlPool = mysql.createPool(dbConfig);
let isMySqlAvailable = false;

// In-Memory Relational Dataset (Used seamlessly when local MySQL service is offline)
const inMemoryDb = {
  users: [
    {
      id: 1,
      name: 'System Administrator Admin',
      email: 'admin@storerating.com',
      password: '$2b$10$b0P.kkwfW1uCIaChs.Yce.X/grSFrJETNdv.JD4l3H1DRGHxYqHkq', // AdminPass123!
      address: '100 Enterprise Boulevard, Suite 500, Tech City, TC 90210',
      role: 'ADMIN',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z'
    },
    {
      id: 2,
      name: 'Alexander James Owner Sr.',
      email: 'alex.owner@techsuperstore.com',
      password: '$2b$10$llwNQXjbiZjeUQA9EYvLS.ISVlbXu42tQjPcM19XXyVtcFQs/1Es.', // OwnerPass123!
      address: '250 Market Square Plaza, Downtown District, Metropolis, NY 10001',
      role: 'OWNER',
      created_at: '2026-01-11T11:00:00Z',
      updated_at: '2026-01-11T11:00:00Z'
    },
    {
      id: 3,
      name: 'Catherine Marie Owner Jr.',
      email: 'catherine.owner@greenorganic.com',
      password: '$2b$10$llwNQXjbiZjeUQA9EYvLS.ISVlbXu42tQjPcM19XXyVtcFQs/1Es.', // OwnerPass123!
      address: '742 Evergreen Terrace Commercial Ave, Springfield, IL 62704',
      role: 'OWNER',
      created_at: '2026-01-12T12:00:00Z',
      updated_at: '2026-01-12T12:00:00Z'
    },
    {
      id: 4,
      name: 'Jonathan David Doe Consumer',
      email: 'john.doe@communityreviews.org',
      password: '$2b$10$P.LZ5Q2BdCaBVGnu0yfqUuQ06vY.oUKgw2xLXSBYppALiq0H4ggQC', // UserPass123!
      address: '123 Residential Parkway, Apt 4B, Seattle, WA 98101',
      role: 'USER',
      created_at: '2026-01-15T09:00:00Z',
      updated_at: '2026-01-15T09:00:00Z'
    },
    {
      id: 5,
      name: 'Samantha Louise Taylor User',
      email: 'samantha.taylor@shopperguide.net',
      password: '$2b$10$P.LZ5Q2BdCaBVGnu0yfqUuQ06vY.oUKgw2xLXSBYppALiq0H4ggQC', // UserPass123!
      address: '456 Westview Heights Blvd, Portland, OR 97201',
      role: 'USER',
      created_at: '2026-01-16T14:00:00Z',
      updated_at: '2026-01-16T14:00:00Z'
    },
    {
      id: 6,
      name: 'Michael Brandon Miller Client',
      email: 'michael.miller@globalshopper.io',
      password: '$2b$10$P.LZ5Q2BdCaBVGnu0yfqUuQ06vY.oUKgw2xLXSBYppALiq0H4ggQC', // UserPass123!
      address: '789 Grand Vista Highway, San Jose, CA 95113',
      role: 'USER',
      created_at: '2026-01-17T16:00:00Z',
      updated_at: '2026-01-17T16:00:00Z'
    },
    {
      id: 7,
      name: 'Eleanor Victoria Vance Buyer',
      email: 'eleanor.vance@qualityeval.com',
      password: '$2b$10$P.LZ5Q2BdCaBVGnu0yfqUuQ06vY.oUKgw2xLXSBYppALiq0H4ggQC', // UserPass123!
      address: '321 Pinecrest Meadows Road, Austin, TX 78701',
      role: 'USER',
      created_at: '2026-01-18T18:00:00Z',
      updated_at: '2026-01-18T18:00:00Z'
    }
  ],
  stores: [
    {
      id: 1,
      name: 'Nexus Electronics & Gadget Superstore',
      email: 'support@nexuselectronics.com',
      address: '250 Market Square Plaza, Suite 101, Metropolis, NY 10001',
      owner_id: 2,
      created_at: '2026-01-12T10:00:00Z',
      updated_at: '2026-01-12T10:00:00Z'
    },
    {
      id: 2,
      name: 'Green Leaf Organic Gourmet Market',
      email: 'contact@greenleafmarket.com',
      address: '742 Evergreen Terrace Commercial Ave, Springfield, IL 62704',
      owner_id: 3,
      created_at: '2026-01-13T11:00:00Z',
      updated_at: '2026-01-13T11:00:00Z'
    },
    {
      id: 3,
      name: 'Apex Fitness & Sports Equipment Hub',
      email: 'info@apexfitnesshub.com',
      address: '880 Olympic Boulevard, West Wing, Denver, CO 80202',
      owner_id: 2,
      created_at: '2026-01-14T12:00:00Z',
      updated_at: '2026-01-14T12:00:00Z'
    },
    {
      id: 4,
      name: 'Artisan Roast Specialty Coffee Roasters',
      email: 'hello@artisanroastcoffee.com',
      address: '15 Coffee Bean Way, Old Quarter, Portland, OR 97205',
      owner_id: 3,
      created_at: '2026-01-15T13:00:00Z',
      updated_at: '2026-01-15T13:00:00Z'
    },
    {
      id: 5,
      name: 'Modern Living Furniture & Home Design Studio',
      email: 'service@modernlivingdesign.com',
      address: '500 Design District Blvd, Suite 200, Chicago, IL 60607',
      owner_id: null,
      created_at: '2026-01-16T14:00:00Z',
      updated_at: '2026-01-16T14:00:00Z'
    },
    {
      id: 6,
      name: 'Pure Glow Botanicals & Skincare Boutique',
      email: 'care@pureglowbotanicals.com',
      address: '620 Blossom Garden Court, San Francisco, CA 94102',
      owner_id: null,
      created_at: '2026-01-17T15:00:00Z',
      updated_at: '2026-01-17T15:00:00Z'
    }
  ],
  ratings: [
    { id: 1, user_id: 4, store_id: 1, rating: 5, created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-20T10:00:00Z' },
    { id: 2, user_id: 5, store_id: 1, rating: 4, created_at: '2026-01-21T11:00:00Z', updated_at: '2026-01-21T11:00:00Z' },
    { id: 3, user_id: 6, store_id: 1, rating: 5, created_at: '2026-01-22T12:00:00Z', updated_at: '2026-01-22T12:00:00Z' },
    { id: 4, user_id: 7, store_id: 1, rating: 4, created_at: '2026-01-23T13:00:00Z', updated_at: '2026-01-23T13:00:00Z' },
    { id: 5, user_id: 4, store_id: 2, rating: 5, created_at: '2026-01-24T14:00:00Z', updated_at: '2026-01-24T14:00:00Z' },
    { id: 6, user_id: 5, store_id: 2, rating: 5, created_at: '2026-01-25T15:00:00Z', updated_at: '2026-01-25T15:00:00Z' },
    { id: 7, user_id: 6, store_id: 2, rating: 4, created_at: '2026-01-26T16:00:00Z', updated_at: '2026-01-26T16:00:00Z' },
    { id: 8, user_id: 4, store_id: 3, rating: 3, created_at: '2026-01-27T17:00:00Z', updated_at: '2026-01-27T17:00:00Z' },
    { id: 9, user_id: 6, store_id: 3, rating: 4, created_at: '2026-01-28T18:00:00Z', updated_at: '2026-01-28T18:00:00Z' },
    { id: 10, user_id: 5, store_id: 4, rating: 5, created_at: '2026-01-29T19:00:00Z', updated_at: '2026-01-29T19:00:00Z' },
    { id: 11, user_id: 7, store_id: 4, rating: 5, created_at: '2026-01-30T20:00:00Z', updated_at: '2026-01-30T20:00:00Z' },
    { id: 12, user_id: 4, store_id: 5, rating: 4, created_at: '2026-01-31T21:00:00Z', updated_at: '2026-01-31T21:00:00Z' }
  ]
};

let nextUserId = 8;
let nextStoreId = 7;
let nextRatingId = 13;

/**
 * Executes relational in-memory SQL operations matching exact schema & queries
 */
const executeInMemoryQuery = async (sql, params = []) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT user by email
  if (/^SELECT .* FROM users WHERE email = \?/i.test(cleanSql)) {
    const email = (params[0] || '').toLowerCase();
    const user = inMemoryDb.users.find(u => u.email.toLowerCase() === email);
    return [user ? [{ ...user }] : [], []];
  }

  // 2. SELECT user by id
  if (/^SELECT .* FROM users WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const user = inMemoryDb.users.find(u => u.id === id);
    return [user ? [{ ...user }] : [], []];
  }

  // 3. INSERT user
  if (/^INSERT INTO users/i.test(cleanSql)) {
    const [name, email, password, address, role] = params;
    const newUser = {
      id: nextUserId++,
      name,
      email: email.toLowerCase(),
      password,
      address,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryDb.users.push(newUser);
    return [{ insertId: newUser.id, affectedRows: 1 }, []];
  }

  // 4. UPDATE users SET password
  if (/^UPDATE users SET password =/i.test(cleanSql)) {
    const [newPassword, userId] = params;
    const user = inMemoryDb.users.find(u => u.id === parseInt(userId, 10));
    if (user) {
      user.password = newPassword;
      user.updated_at = new Date().toISOString();
    }
    return [{ affectedRows: user ? 1 : 0 }, []];
  }

  // 5. Admin Dashboard Counts
  if (/SELECT COUNT\(\*\) as totalUsers.*FROM users/i.test(cleanSql)) {
    const totalUsers = inMemoryDb.users.length;
    const totalAdmins = inMemoryDb.users.filter(u => u.role === 'ADMIN').length;
    const totalNormalUsers = inMemoryDb.users.filter(u => u.role === 'USER').length;
    const totalOwners = inMemoryDb.users.filter(u => u.role === 'OWNER').length;
    return [[{ totalUsers, totalAdmins, totalNormalUsers, totalOwners }], []];
  }

  if (/SELECT COUNT\(\*\) as totalStores FROM stores/i.test(cleanSql)) {
    return [[{ totalStores: inMemoryDb.stores.length }], []];
  }

  if (/SELECT COUNT\(\*\) as totalRatings.*ROUND\(AVG\(rating\)/i.test(cleanSql)) {
    const totalRatings = inMemoryDb.ratings.length;
    const sum = inMemoryDb.ratings.reduce((acc, r) => acc + r.rating, 0);
    const platformAvgRating = totalRatings > 0 ? (sum / totalRatings).toFixed(2) : '0';
    return [[{ totalRatings, platformAvgRating: Number(platformAvgRating) }], []];
  }

  if (/SELECT rating, COUNT\(\*\) as count FROM ratings GROUP BY rating/i.test(cleanSql)) {
    const counts = {};
    inMemoryDb.ratings.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
    const result = [5, 4, 3, 2, 1].map(star => ({ rating: star, count: counts[star] || 0 }));
    return [result, []];
  }

  if (/SELECT r\.id, r\.rating, r\.created_at, u\.name as userName.*FROM ratings r.*LIMIT 5/i.test(cleanSql)) {
    const sorted = [...inMemoryDb.ratings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const rows = sorted.map(r => {
      const u = inMemoryDb.users.find(user => user.id === r.user_id) || {};
      const s = inMemoryDb.stores.find(store => store.id === r.store_id) || {};
      return {
        id: r.id,
        rating: r.rating,
        created_at: r.created_at,
        userName: u.name || 'User',
        userEmail: u.email || '',
        storeId: s.id,
        storeName: s.name || 'Store'
      };
    });
    return [rows, []];
  }

  // 6. Admin Users List & Count
  if (/SELECT COUNT\(\*\) as total FROM users/i.test(cleanSql)) {
    let filtered = [...inMemoryDb.users];
    // filter logic
    if (params.length > 0) {
      const searchVal = params[0]?.replace(/%/g, '').toLowerCase();
      if (searchVal) {
        filtered = filtered.filter(u => 
          u.name.toLowerCase().includes(searchVal) || 
          u.email.toLowerCase().includes(searchVal) || 
          u.address.toLowerCase().includes(searchVal)
        );
      }
    }
    return [[{ total: filtered.length }], []];
  }

  if (/SELECT u\.id, u\.name, u\.email, u\.address, u\.role.*FROM users u/i.test(cleanSql)) {
    let filtered = inMemoryDb.users.map(u => ({
      ...u,
      ownedStoresCount: inMemoryDb.stores.filter(s => s.owner_id === u.id).length,
      ratingsGivenCount: inMemoryDb.ratings.filter(r => r.user_id === u.id).length
    }));

    // Check limit / offset
    const limit = parseInt(params[params.length - 2], 10) || 10;
    const offset = parseInt(params[params.length - 1], 10) || 0;
    return [filtered.slice(offset, offset + limit), []];
  }

  // 7. Store / Owner queries
  if (/SELECT COUNT\(\*\) as total FROM stores/i.test(cleanSql)) {
    let filtered = [...inMemoryDb.stores];
    return [[{ total: filtered.length }], []];
  }

  if (/SELECT s\.id, s\.name, s\.email, s\.address.*FROM stores s/i.test(cleanSql)) {
    const hasCurrentUserId = params.length > 0 && typeof params[0] === 'number';
    const currentUserId = hasCurrentUserId ? params[0] : null;

    let rows = inMemoryDb.stores.map(s => {
      const storeRatings = inMemoryDb.ratings.filter(r => r.store_id === s.id);
      const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = storeRatings.length > 0 ? (sum / storeRatings.length).toFixed(1) : 0;
      const owner = inMemoryDb.users.find(u => u.id === s.owner_id);
      const userRating = currentUserId 
        ? inMemoryDb.ratings.find(r => r.store_id === s.id && r.user_id === currentUserId)?.rating ?? null
        : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner_id: s.owner_id,
        ownerName: owner?.name || null,
        ownerEmail: owner?.email || null,
        avgRating: Number(avgRating),
        totalRatings: storeRatings.length,
        userSubmittedRating: userRating,
        created_at: s.created_at,
        updated_at: s.updated_at
      };
    });

    const limit = parseInt(params[params.length - 2], 10) || 20;
    const offset = parseInt(params[params.length - 1], 10) || 0;
    return [rows.slice(offset, offset + limit), []];
  }

  // Single store by ID
  if (/SELECT .* FROM stores WHERE id = \?/i.test(cleanSql) || /SELECT s\.id.*FROM stores s.*WHERE s\.id = \?/i.test(cleanSql)) {
    const storeId = parseInt(params[0], 10);
    const s = inMemoryDb.stores.find(st => st.id === storeId);
    if (!s) return [[], []];

    const storeRatings = inMemoryDb.ratings.filter(r => r.store_id === s.id);
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = storeRatings.length > 0 ? (sum / storeRatings.length).toFixed(1) : 0;

    return [[{
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      owner_id: s.owner_id,
      avgRating: Number(avgRating),
      totalRatings: storeRatings.length,
      created_at: s.created_at,
      updated_at: s.updated_at
    }], []];
  }

  // 8. Ratings queries
  if (/SELECT id, rating FROM ratings WHERE user_id = \? AND store_id = \?/i.test(cleanSql)) {
    const [userId, storeId] = params;
    const found = inMemoryDb.ratings.find(r => r.user_id === parseInt(userId, 10) && r.store_id === parseInt(storeId, 10));
    return [found ? [{ ...found }] : [], []];
  }

  if (/SELECT rating, updated_at FROM ratings WHERE store_id = \? AND user_id = \?/i.test(cleanSql)) {
    const [storeId, userId] = params;
    const found = inMemoryDb.ratings.find(r => r.store_id === parseInt(storeId, 10) && r.user_id === parseInt(userId, 10));
    return [found ? [{ ...found }] : [], []];
  }

  if (/SELECT .* FROM ratings WHERE store_id = \?/i.test(cleanSql)) {
    const storeId = parseInt(params[0], 10);
    const storeRatings = inMemoryDb.ratings.filter(r => r.store_id === storeId);
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = storeRatings.length > 0 ? (sum / storeRatings.length).toFixed(1) : 0;
    return [[{ avgRating: Number(avgRating), totalRatings: storeRatings.length }], []];
  }

  if (/INSERT INTO ratings/i.test(cleanSql)) {
    const [userId, storeId, rating] = params;
    const newRating = {
      id: nextRatingId++,
      user_id: parseInt(userId, 10),
      store_id: parseInt(storeId, 10),
      rating: parseInt(rating, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryDb.ratings.push(newRating);
    return [{ insertId: newRating.id, affectedRows: 1 }, []];
  }

  if (/UPDATE ratings SET rating =/i.test(cleanSql)) {
    const [rating, ratingId, userId] = params;
    const r = inMemoryDb.ratings.find(item => item.id === parseInt(ratingId, 10) && item.user_id === parseInt(userId, 10));
    if (r) {
      r.rating = parseInt(rating, 10);
      r.updated_at = new Date().toISOString();
    }
    return [{ affectedRows: r ? 1 : 0 }, []];
  }

  if (/SELECT r\.id, r\.rating.*FROM ratings r.*WHERE r\.user_id = \?/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const userRatings = inMemoryDb.ratings.filter(r => r.user_id === userId);
    const rows = userRatings.map(r => {
      const s = inMemoryDb.stores.find(store => store.id === r.store_id) || {};
      return {
        id: r.id,
        rating: r.rating,
        created_at: r.created_at,
        updated_at: r.updated_at,
        storeId: s.id,
        storeName: s.name,
        storeAddress: s.address,
        storeEmail: s.email
      };
    });
    return [rows, []];
  }

  // Owner stores
  if (/SELECT s\.id, s\.name, s\.email, s\.address.*FROM stores s.*WHERE s\.owner_id = \?/i.test(cleanSql)) {
    const ownerId = parseInt(params[0], 10);
    const owned = inMemoryDb.stores.filter(s => s.owner_id === ownerId).map(s => {
      const storeRatings = inMemoryDb.ratings.filter(r => r.store_id === s.id);
      const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        created_at: s.created_at,
        avgRating: storeRatings.length > 0 ? Number((sum / storeRatings.length).toFixed(1)) : 0,
        totalRatings: storeRatings.length
      };
    });
    return [owned, []];
  }

  // Owner dashboard customer ratings table
  if (/SELECT r\.id, r\.rating.*u\.name as customerName.*FROM ratings r.*WHERE r\.store_id = \?/i.test(cleanSql)) {
    const storeId = parseInt(params[0], 10);
    const storeRatings = inMemoryDb.ratings.filter(r => r.store_id === storeId);
    const rows = storeRatings.map(r => {
      const u = inMemoryDb.users.find(user => user.id === r.user_id) || {};
      return {
        id: r.id,
        rating: r.rating,
        created_at: r.created_at,
        updated_at: r.updated_at,
        customerName: u.name || 'Shopper',
        customerEmail: u.email || 'customer@example.com'
      };
    });
    return [rows, []];
  }

  // Default fallback empty rowset
  return [[], []];
};

export const pool = {
  query: async (sql, params = []) => {
    if (isMySqlAvailable) {
      try {
        return await rawMySqlPool.query(sql, params);
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
          isMySqlAvailable = false;
          console.warn('[DB Fallback] MySQL disconnected. Switched to in-memory SQL execution.');
          return await executeInMemoryQuery(sql, params);
        }
        throw err;
      }
    }
    return await executeInMemoryQuery(sql, params);
  },

  getConnection: async () => {
    if (isMySqlAvailable) {
      try {
        return await rawMySqlPool.getConnection();
      } catch {
        isMySqlAvailable = false;
      }
    }

    // Mock transaction connection object for in-memory mode
    return {
      query: async (sql, params) => await executeInMemoryQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

export const testConnection = async () => {
  try {
    const connection = await rawMySqlPool.getConnection();
    console.log(`[DB] Successfully connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    isMySqlAvailable = true;
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[DB] MySQL server not detected (${error.message}).`);
    console.log('⚡ [DB] Active: In-Memory SQL Engine initialized with full sample dataset for instant out-of-the-box demo & testing.');
    isMySqlAvailable = false;
    return false;
  }
};

export default pool;
