import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const hashPassword = async (pwd) => {
  return await bcrypt.hash(pwd, 10);
};

export async function seed() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'store_rating_platform';

  console.log(`[Seed] Connecting to MySQL database '${dbName}' at ${host}:${port}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database: dbName
    });

    console.log('[Seed] Seeding users...');

    // Default Admin from ENV or fallback
    const adminName = (process.env.ADMIN_NAME || 'System Administrator Admin').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@storerating.com').trim().toLowerCase();
    const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'AdminPass123!');
    const defaultPassword = await hashPassword('UserPass123!');
    const ownerPassword = await hashPassword('OwnerPass123!');

    const usersToSeed = [
      // 1 Admin
      {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        address: '100 Enterprise Boulevard, Suite 500, Tech City, TC 90210',
        role: 'ADMIN'
      },
      // 2 Store Owners
      {
        name: 'Alexander James Owner Sr.',
        email: 'alex.owner@techsuperstore.com',
        password: ownerPassword,
        address: '250 Market Square Plaza, Downtown District, Metropolis, NY 10001',
        role: 'OWNER'
      },
      {
        name: 'Catherine Marie Owner Jr.',
        email: 'catherine.owner@greenorganic.com',
        password: ownerPassword,
        address: '742 Evergreen Terrace Commercial Ave, Springfield, IL 62704',
        role: 'OWNER'
      },
      // 4 Normal Users
      {
        name: 'Jonathan David Doe Consumer',
        email: 'john.doe@communityreviews.org',
        password: defaultPassword,
        address: '123 Residential Parkway, Apt 4B, Seattle, WA 98101',
        role: 'USER'
      },
      {
        name: 'Samantha Louise Taylor User',
        email: 'samantha.taylor@shopperguide.net',
        password: defaultPassword,
        address: '456 Westview Heights Blvd, Portland, OR 97201',
        role: 'USER'
      },
      {
        name: 'Michael Brandon Miller Client',
        email: 'michael.miller@globalshopper.io',
        password: defaultPassword,
        address: '789 Grand Vista Highway, San Jose, CA 95113',
        role: 'USER'
      },
      {
        name: 'Eleanor Victoria Vance Buyer',
        email: 'eleanor.vance@qualityeval.com',
        password: defaultPassword,
        address: '321 Pinecrest Meadows Road, Austin, TX 78701',
        role: 'USER'
      }
    ];

    const userIdMap = {};

    for (const u of usersToSeed) {
      const [existing] = await connection.query('SELECT id, role FROM users WHERE email = ?', [u.email]);
      if (existing.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
          [u.name, u.email, u.password, u.address, u.role]
        );
        userIdMap[u.email] = result.insertId;
        console.log(`  + Created user: ${u.email} (${u.role})`);
      } else {
        userIdMap[u.email] = existing[0].id;
        console.log(`  = User exists: ${u.email} (ID: ${existing[0].id})`);
      }
    }

    console.log('[Seed] Seeding stores...');
    const storesToSeed = [
      {
        name: 'Nexus Electronics & Gadget Superstore',
        email: 'support@nexuselectronics.com',
        address: '250 Market Square Plaza, Suite 101, Metropolis, NY 10001',
        ownerEmail: 'alex.owner@techsuperstore.com'
      },
      {
        name: 'Green Leaf Organic Gourmet Market',
        email: 'contact@greenleafmarket.com',
        address: '742 Evergreen Terrace Commercial Ave, Springfield, IL 62704',
        ownerEmail: 'catherine.owner@greenorganic.com'
      },
      {
        name: 'Apex Fitness & Sports Equipment Hub',
        email: 'info@apexfitnesshub.com',
        address: '880 Olympic Boulevard, West Wing, Denver, CO 80202',
        ownerEmail: 'alex.owner@techsuperstore.com'
      },
      {
        name: 'Artisan Roast Specialty Coffee Roasters',
        email: 'hello@artisanroastcoffee.com',
        address: '15 Coffee Bean Way, Old Quarter, Portland, OR 97205',
        ownerEmail: 'catherine.owner@greenorganic.com'
      },
      {
        name: 'Modern Living Furniture & Home Design Studio',
        email: 'service@modernlivingdesign.com',
        address: '500 Design District Blvd, Suite 200, Chicago, IL 60607',
        ownerEmail: null
      },
      {
        name: 'Pure Glow Botanicals & Skincare Boutique',
        email: 'care@pureglowbotanicals.com',
        address: '620 Blossom Garden Court, San Francisco, CA 94102',
        ownerEmail: null
      }
    ];

    const storeIdMap = {};

    for (const s of storesToSeed) {
      const ownerId = s.ownerEmail ? userIdMap[s.ownerEmail] : null;
      const [existing] = await connection.query('SELECT id FROM stores WHERE name = ?', [s.name]);
      if (existing.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
          [s.name, s.email, s.address, ownerId]
        );
        storeIdMap[s.name] = result.insertId;
        console.log(`  + Created store: "${s.name}" (ID: ${result.insertId}, Owner ID: ${ownerId || 'None'})`);
      } else {
        storeIdMap[s.name] = existing[0].id;
        // Keep owner_id updated if needed
        await connection.query('UPDATE stores SET owner_id = ?, email = ?, address = ? WHERE id = ?', [
          ownerId,
          s.email,
          s.address,
          existing[0].id
        ]);
        console.log(`  = Store exists: "${s.name}" (ID: ${existing[0].id})`);
      }
    }

    console.log('[Seed] Seeding sample ratings...');
    const ratingsToSeed = [
      // Store 1: Nexus Electronics
      { userEmail: 'john.doe@communityreviews.org', storeName: 'Nexus Electronics & Gadget Superstore', rating: 5 },
      { userEmail: 'samantha.taylor@shopperguide.net', storeName: 'Nexus Electronics & Gadget Superstore', rating: 4 },
      { userEmail: 'michael.miller@globalshopper.io', storeName: 'Nexus Electronics & Gadget Superstore', rating: 5 },
      { userEmail: 'eleanor.vance@qualityeval.com', storeName: 'Nexus Electronics & Gadget Superstore', rating: 4 },

      // Store 2: Green Leaf Organic
      { userEmail: 'john.doe@communityreviews.org', storeName: 'Green Leaf Organic Gourmet Market', rating: 5 },
      { userEmail: 'samantha.taylor@shopperguide.net', storeName: 'Green Leaf Organic Gourmet Market', rating: 5 },
      { userEmail: 'michael.miller@globalshopper.io', storeName: 'Green Leaf Organic Gourmet Market', rating: 4 },

      // Store 3: Apex Fitness
      { userEmail: 'john.doe@communityreviews.org', storeName: 'Apex Fitness & Sports Equipment Hub', rating: 3 },
      { userEmail: 'michael.miller@globalshopper.io', storeName: 'Apex Fitness & Sports Equipment Hub', rating: 4 },

      // Store 4: Artisan Roast Coffee
      { userEmail: 'samantha.taylor@shopperguide.net', storeName: 'Artisan Roast Specialty Coffee Roasters', rating: 5 },
      { userEmail: 'eleanor.vance@qualityeval.com', storeName: 'Artisan Roast Specialty Coffee Roasters', rating: 5 },

      // Store 5: Modern Living Furniture
      { userEmail: 'john.doe@communityreviews.org', storeName: 'Modern Living Furniture & Home Design Studio', rating: 4 }
    ];

    for (const r of ratingsToSeed) {
      const uId = userIdMap[r.userEmail];
      const sId = storeIdMap[r.storeName];
      if (uId && sId) {
        const [existing] = await connection.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [uId, sId]);
        if (existing.length === 0) {
          await connection.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [uId, sId, r.rating]);
          console.log(`  + Added rating ${r.rating}★ for "${r.storeName}" by user ${uId}`);
        } else {
          console.log(`  = Rating exists for user ${uId} on store ${sId}`);
        }
      }
    }

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Seeding error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed();
}
