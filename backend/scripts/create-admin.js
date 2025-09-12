const { query, execute, testConnection } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await query('SELECT id FROM users WHERE username = ? AND role = ?', ['admin', 'admin']);
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('Admin credentials:');
      console.log('Username: admin');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    await execute(
      'INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)',
      ['admin', 'admin123', 'admin', false]
    );

    console.log('✅ Admin user created successfully!');
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
