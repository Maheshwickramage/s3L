const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { query, queryOne, execute, getConnection } = require('../config/database');

// Login route with JWT
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database - for students, check both phone and email
    let sql = 'SELECT * FROM users WHERE username = ?';
    let params = [username];
    
    // If it looks like an email or phone, also check students table
    if (username.includes('@') || /^\d+$/.test(username)) {
      sql = `
        SELECT u.*, s.name as student_name, s.email as student_email, s.phone as student_phone, 
               s.class_id, s.subscription_type as student_subscription, s.quiz_attempts_used, s.max_quiz_attempts
        FROM users u 
        LEFT JOIN students s ON u.username = s.phone OR u.username = s.email
        WHERE u.username = ? OR s.phone = ? OR s.email = ?
      `;
      params = [username, username, username];
    }
    
    try {
      const user = await queryOne(sql, params);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // For now, we'll use simple password comparison since existing passwords aren't hashed
      // In production, you should hash all passwords
      const isValidPassword = user.password === password; // Simple comparison for existing data
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user);
      
      console.log('Login successful for user:', user.username);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          must_change_password: user.must_change_password,
          student_name: user.student_name,
          student_email: user.student_email,
          student_phone: user.student_phone,
          class_id: user.class_id,
          subscription_type: user.subscription_type || user.student_subscription || 'free',
          subscription_status: user.subscription_status || 'active',
          quiz_attempts_used: user.quiz_attempts_used || 0,
          max_quiz_attempts: user.max_quiz_attempts || 5
        }
      });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student Registration route
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    // Validate phone format (basic validation)
    if (!/^\d{10}$/.test(phone.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    try {
      // Check if phone number already exists in users or students table
      const existingUser = await queryOne(
        'SELECT id FROM users WHERE username = ? UNION SELECT id FROM students WHERE phone = ?',
        [phone, phone]
      );
      
      if (existingUser) {
        return res.status(409).json({ error: 'This phone number is already registered' });
      }

      // Check if email already exists if provided
      if (email) {
        const existingEmail = await queryOne(
          'SELECT id FROM students WHERE email = ?',
          [email]
        );
        
        if (existingEmail) {
          return res.status(409).json({ error: 'This email is already registered' });
        }
      }

      // Use a connection for transaction instead of prepared statements
      const connection = await getConnection();
      
      try {
        // Start transaction
        await connection.beginTransaction();

        // First, ensure we have a default teacher
        const [teacherRows] = await connection.execute('SELECT id FROM users WHERE role = ? LIMIT 1', ['teacher']);
        let defaultTeacherId;
        
        if (teacherRows.length === 0) {
          // Create a default teacher if none exists
          const [defaultTeacherResult] = await connection.execute(
            'INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)',
            ['default_teacher', 'temp_password', 'teacher', true]
          );
          defaultTeacherId = defaultTeacherResult.insertId;
          console.log('Created default teacher with ID:', defaultTeacherId);
        } else {
          defaultTeacherId = teacherRows[0].id;
        }

        // Create user account (using phone as username)
        const [userResult] = await connection.execute(
          'INSERT INTO users (username, password, role, must_change_password, subscription_type, subscription_status) VALUES (?, ?, ?, ?, ?, ?)',
          [phone, password, 'student', false, 'free', 'active']
        );

        const userId = userResult.insertId;

        // Create student record
        await connection.execute(
          'INSERT INTO students (name, email, phone, teacher_id, subscription_type, quiz_attempts_used, max_quiz_attempts) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, email || null, phone, defaultTeacherId, 'free', 0, 5]
        );

        // Commit transaction
        await connection.commit();
        connection.release();

        // Generate JWT token for immediate login
        const newUser = {
          id: userId,
          username: phone,
          role: 'student',
          must_change_password: false,
          student_name: name,
          student_email: email,
          student_phone: phone,
          subscription_type: 'free',
          subscription_status: 'active',
          quiz_attempts_used: 0,
          max_quiz_attempts: 5
        };

        const token = generateToken(newUser);

        console.log('Registration successful for user:', phone);
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          token,
          user: newUser
        });

      } catch (err) {
        // Rollback transaction on error
        await connection.rollback();
        connection.release();
        throw err;
      }

    } catch (err) {
      console.error('Registration DB error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('SQL State:', err.sqlState);
      return res.status(500).json({ error: 'Database error during registration', details: err.message });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Change password endpoint (protected)
router.post('/change-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;
  
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const result = await execute(
      'UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?', 
      [newPassword, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
