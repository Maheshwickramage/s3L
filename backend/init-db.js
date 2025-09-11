const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create database connection
const db = new sqlite3.Database('../database/s3learn.db');

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating tables:', err);
  } else {
    console.log('Database tables created successfully');
    
    // Insert some sample data
    db.serialize(() => {
      // Insert sample teacher
      db.run(`INSERT OR IGNORE INTO teachers (id, name, email) VALUES (1, 'John Doe', 'john@example.com')`);
      
      // Insert sample class
      db.run(`INSERT OR IGNORE INTO classes (id, name, description, teacher_id) VALUES (1, 'Mathematics 101', 'Basic Mathematics Course', 1)`);
      
      // Insert sample admin user
      db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')`);
      
      // Insert sample teacher user
      db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('teacher1', 'teacher123', 'teacher')`);
      
      // Insert sample student user
      db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('student1', 'student123', 'student')`);
      
      console.log('Sample data inserted successfully');
    });
  }
});

db.close();
