const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/s3learn.db');

// CRUD for teachers
router.get('/teachers', (req, res) => {
  db.all('SELECT * FROM teachers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

router.post('/teachers', (req, res) => {
  const { name, email } = req.body;
  // Default password for new teacher
  const defaultPassword = 'changeme123';
  db.run('INSERT INTO teachers (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    const teacherId = this.lastID;
    // Also create a user entry for login
    db.run('INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)', [email, defaultPassword, 'teacher', 1], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error (user creation)' });
      res.json({ id: teacherId, name, email, defaultPassword });
    });
  });
});

router.put('/teachers/:id', (req, res) => {
  const { name, email } = req.body;
  db.run('UPDATE teachers SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: req.params.id, name, email });
  });
});

router.delete('/teachers/:id', (req, res) => {
  db.run('DELETE FROM teachers WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

module.exports = router;
