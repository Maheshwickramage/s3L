const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { query, queryOne, execute } = require('../config/database');

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
        SELECT u.*, s.name as student_name, s.email as student_email, s.phone as student_phone, s.class_id
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
          class_id: user.class_id
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
