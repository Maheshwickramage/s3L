const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Port:', process.env.DB_PORT);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if RDS instance is publicly accessible');
      console.log('2. Verify security group allows inbound connections on port 3306');
      console.log('3. Ensure RDS instance is in "Available" state');
      console.log('4. Check if your IP is allowed in security group');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Verify username and password');
      console.log('2. Check if user has proper permissions');
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
