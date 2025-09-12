const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 's3learn',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  reconnect: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Could not connect to MySQL database:', error);
    return false;
  }
}

// Execute a query with parameters
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute a query and return the first row
async function queryOne(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute an insert/update/delete query and return the result
async function execute(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Get a connection from the pool
async function getConnection() {
  return await pool.getConnection();
}

// Close the connection pool
async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  queryOne,
  execute,
  getConnection,
  closePool,
  testConnection
};
