const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../config/database');

// CRUD for teachers
router.get('/teachers', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/teachers', async (req, res) => {
  const { name, email } = req.body;
  const defaultPassword = 'changeme123';
  
  try {
    const teacherResult = await execute('INSERT INTO teachers (name, email) VALUES (?, ?)', [name, email]);
    const teacherId = teacherResult.insertId;
    
    // Also create a user entry for login
    await execute('INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)', 
      [email, defaultPassword, 'teacher', 1]);
    
    res.json({ id: teacherId, name, email, defaultPassword });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.put('/teachers/:id', async (req, res) => {
  const { name, email } = req.body;
  const teacherId = req.params.id;
  
  try {
    await execute('UPDATE teachers SET name = ?, email = ? WHERE id = ?', [name, email, teacherId]);
    res.json({ id: teacherId, name, email });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  const teacherId = req.params.id;
  
  try {
    await execute('DELETE FROM teachers WHERE id = ?', [teacherId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
