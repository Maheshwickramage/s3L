const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
  console.log('Creating database...');
  
  try {
    // Connect without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create the database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' created successfully`);
    
    // Test connection to the new database
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    console.log(`✅ Successfully connected to database '${process.env.DB_NAME}'`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

createDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database setup complete! Now you can run: npm run init-db-retry');
  }
  process.exit(success ? 0 : 1);
});
