const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/s3learn.db');

// Change password endpoint
router.post('/change-password', (req, res) => {
  const { username, newPassword } = req.body;
  db.run('UPDATE users SET password = ?, must_change_password = 0 WHERE username = ?', [newPassword, username], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// Simple login route (no hashing for MVP)
router.post('/login', (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('DB user result:', user);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ username: user.username, role: user.role, must_change_password: user.must_change_password });
  });
});

module.exports = router;
