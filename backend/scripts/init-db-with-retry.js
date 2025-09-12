const { query, execute, testConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  console.log('Waiting for database connection...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        console.log('Database connection successful!');
        return true;
      }
    } catch (error) {
      console.log(`Attempt ${i + 1}/${maxRetries}: Database not ready yet...`);
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('Failed to connect to database after maximum retries');
  return false;
}

async function initializeDatabase() {
  try {
    // Wait for database to be ready
    const isConnected = await waitForDatabase();
    if (!isConnected) {
      process.exit(1);
    }

    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠ Table already exists, skipping...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✓ Database tables created successfully');

    // Insert sample data
    try {
      // Insert sample admin user
      await execute(
        `INSERT IGNORE INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin123', 'admin', false]
      );

      // Insert sample teacher user
      await execute(
        `INSERT IGNORE INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)`,
        ['teacher1', 'teacher123', 'teacher', false]
      );

      // Insert sample student user
      await execute(
        `INSERT IGNORE INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)`,
        ['student1', 'student123', 'student', true]
      );

      // Insert sample teacher
      await execute(
        `INSERT IGNORE INTO teachers (name, email) VALUES (?, ?)`,
        ['John Doe', 'john@example.com']
      );

      // Insert sample class
      await execute(
        `INSERT IGNORE INTO classes (name, description, teacher_id) VALUES (?, ?, ?)`,
        ['Mathematics 101', 'Basic Mathematics Course', 1]
      );

      console.log('✓ Sample data inserted successfully');
    } catch (error) {
      console.log('⚠ Sample data may already exist or there was an error:', error.message);
    }

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
