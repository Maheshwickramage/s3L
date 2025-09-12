const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { query, queryOne, execute } = require('../config/database');

// Apply authentication to all student routes
router.use(authenticateToken);
router.use(authorizeRole(['student']));

// Get quizzes for student's class
router.get('/quizzes', async (req, res) => {
  const user = req.user;
  if (user.class_id) {
    try {
      const rows = await query(`
        SELECT q.*, c.name as class_name
        FROM quizzes q
        JOIN classes c ON q.class_id = c.id
        WHERE q.class_id = ?
        ORDER BY q.id DESC
      `, [user.class_id]);
      res.json(rows);
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.json([]);
  }
});

// Get leaderboard for student's class
router.get('/leaderboard', async (req, res) => {
  const user = req.user;
  if (user.class_id) {
    try {
      const rows = await query(`
        SELECT 
          s.name,
          l.score,
          q.title as quiz_name,
          l.created_at as submitted_at
        FROM leaderboard l
        JOIN students s ON l.student_id = s.id
        JOIN quizzes q ON l.quiz_id = q.id
        WHERE s.class_id = ?
        ORDER BY l.score DESC, l.created_at DESC
      `, [user.class_id]);
      res.json(rows);
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.json([]);
  }
});

// Get full quiz details for taking quiz
router.get('/quizzes/:id/full', async (req, res) => {
  const quizId = req.params.id;
  const user = req.user;
  
  try {
    // Verify student has access to this quiz
    const quiz = await queryOne(`
      SELECT q.*, c.name as class_name
      FROM quizzes q
      JOIN classes c ON q.class_id = c.id
      WHERE q.id = ? AND c.id = ?
    `, [quizId, user.class_id]);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    
    // Get questions and options
    const questions = await query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    
    for (let i = 0; i < questions.length; i++) {
      const options = await query('SELECT id, option_text, is_correct FROM quiz_options WHERE question_id = ?', [questions[i].id]);
      questions[i].options = options;
    }
    
    res.json({ ...quiz, questions });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Submit quiz answers
router.post('/quizzes/:id/submit', async (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body; // [{question_id, selected_option_id}]
  const user = req.user;
  
  try {
    // Verify student has access to this quiz
    const quiz = await queryOne(`
      SELECT q.*, c.name as class_name
      FROM quizzes q
      JOIN classes c ON q.class_id = c.id
      WHERE q.id = ? AND c.id = ?
    `, [quizId, user.class_id]);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or access denied' });
    }
    
    // Calculate score
    let score = 0;
    let totalMarks = 0;
    
    for (const answer of answers) {
      const question = await queryOne('SELECT marks FROM quiz_questions WHERE id = ? AND quiz_id = ?', [answer.question_id, quizId]);
      if (!question) continue;
      
      totalMarks += question.marks;
      
      const correctOption = await queryOne('SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = 1', [answer.question_id]);
      if (correctOption && correctOption.id == answer.selected_option_id) {
        score += question.marks;
      }
    }
    
    // Save result to leaderboard
    await execute('INSERT INTO leaderboard (student_id, quiz_id, score) VALUES (?, ?, ?)', [user.id, quizId, score]);
    
    res.json({ 
      success: true, 
      score, 
      totalMarks, 
      percentage: Math.round((score / totalMarks) * 100) 
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get chat messages for student
router.get('/chat', async (req, res) => {
  const user = req.user;
  try {
    const rows = await query(`
      SELECT c.*, u.username as teacher_name
      FROM chat_messages c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.student_id = ?
      ORDER BY c.created_at ASC
    `, [user.id]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Send chat message as student
router.post('/chat', async (req, res) => {
  const { teacher_id, message } = req.body;
  const user = req.user;
  
  if (!teacher_id || !message || message.trim() === '') {
    return res.status(400).json({ error: 'Teacher ID and message are required' });
  }
  
  try {
    const result = await execute('INSERT INTO chat_messages (student_id, teacher_id, message, sender_type) VALUES (?, ?, ?, ?)', 
      [user.id, teacher_id, message.trim(), 'student']);
    res.json({ success: true, messageId: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get class files
router.get('/files', async (req, res) => {
  const user = req.user;
  if (!user.class_id) {
    return res.json([]);
  }
  
  try {
    const rows = await query(`
      SELECT f.*, c.name as class_name
      FROM class_files f
      JOIN classes c ON f.class_id = c.id
      WHERE f.class_id = ?
      ORDER BY f.created_at DESC
    `, [user.class_id]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
