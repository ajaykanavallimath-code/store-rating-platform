import app from './app.js';
import { testConnection } from './config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test Database Connection
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('\n⚠️ [Server Warning] Could not connect to MySQL database.');
    console.warn('👉 Please ensure MySQL is running, configure backend/.env with your MySQL credentials, and run `npm run db:init` & `npm run db:seed`.\n');
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Store Rating Platform Backend running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
};

startServer();
