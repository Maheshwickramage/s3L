const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const db = new sqlite3.Database('./database/s3learn.db');

// Apply authentication to all student routes
router.use(authenticateToken);
router.use(authorizeRole(['student']));

// Get quizzes for student's class
router.get('/quizzes', (req, res) => {
  const user = req.user;
  if (user.class_id) {
    db.all(`
      SELECT q.*, c.name as class_name
      FROM quizzes q
      JOIN classes c ON q.class_id = c.id
      WHERE q.class_id = ?
      ORDER BY q.id DESC
    `, [user.class_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    res.json([]);
  }
});

// Get leaderboard for student's class
router.get('/leaderboard', (req, res) => {
  const user = req.user;
  if (user.class_id) {
    db.all(`
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
    `, [user.class_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    res.json([]);
  }
});

// Get full quiz details for taking quiz
router.get('/quizzes/:id/full', (req, res) => {
  const quizId = req.params.id;
  const user = req.user;
  
  // First check if quiz belongs to student's class
  db.get('SELECT * FROM quizzes WHERE id = ? AND class_id = ?', [quizId, user.class_id], (err, quiz) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found or not accessible' });
    
    db.all('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId], (err2, questions) => {
      if (err2) return res.status(500).json({ error: 'Database error (questions)' });
      if (!questions.length) return res.json({ ...quiz, questions: [] });
      
      let pending = questions.length;
      questions.forEach((q, idx) => {
        db.all('SELECT id, option_text, is_correct FROM quiz_options WHERE question_id = ?', [q.id], (err3, options) => {
          if (err3) return res.status(500).json({ error: 'Database error (options)' });
          questions[idx].options = options;
          if (--pending === 0) {
            res.json({ ...quiz, questions });
          }
        });
      });
    });
  });
});

// Submit quiz result
router.post('/quizzes/:id/submit', (req, res) => {
  const quizId = req.params.id;
  const { answers } = req.body;
  const user = req.user;
  
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers are required' });
  }
  
  // First check if quiz belongs to student's class
  db.get('SELECT * FROM quizzes WHERE id = ? AND class_id = ?', [quizId, user.class_id], (err, quiz) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found or not accessible' });
    
    // Get student ID from users table
    db.get('SELECT id FROM students WHERE phone = ? OR email = ?', [user.username, user.username], (err2, student) => {
      if (err2) return res.status(500).json({ error: 'Database error (student lookup)' });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      
      // Calculate score
      db.all('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId], (err3, questions) => {
        if (err3) return res.status(500).json({ error: 'Database error (questions)' });
        
        let totalScore = 0;
        let pending = questions.length;
        
        if (pending === 0) {
          return res.json({ score: 0, total: 0 });
        }
        
        questions.forEach((q, idx) => {
          db.all('SELECT id, is_correct FROM quiz_options WHERE question_id = ?', [q.id], (err4, options) => {
            if (err4) return res.status(500).json({ error: 'Database error (options)' });
            
            const selectedOptionId = answers[q.id];
            const correctOption = options.find(opt => opt.is_correct);
            
            if (correctOption && selectedOptionId == correctOption.id) {
              totalScore += q.marks;
            }
            
            if (--pending === 0) {
              // Save result to leaderboard
              db.run('INSERT INTO leaderboard (student_id, quiz_id, score) VALUES (?, ?, ?)', 
                [student.id, quizId, totalScore], function(err5) {
                if (err5) return res.status(500).json({ error: 'Database error (saving result)' });
                res.json({ 
                  score: totalScore, 
                  total: questions.reduce((sum, q) => sum + q.marks, 0),
                  resultId: this.lastID
                });
              });
            }
          });
        });
      });
    });
  });
});

// Get class files
router.get('/files', (req, res) => {
  const user = req.user;
  if (user.class_id) {
    db.all(`
      SELECT f.*, c.name as class_name
      FROM class_files f
      JOIN classes c ON f.class_id = c.id
      WHERE f.class_id = ?
      ORDER BY f.created_at DESC
    `, [user.class_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    res.json([]);
  }
});

// Get chat messages for student
router.get('/chat', (req, res) => {
  const user = req.user;
  db.all(`
    SELECT c.*, s.name as student_name, t.name as teacher_name
    FROM chat_messages c
    LEFT JOIN students s ON c.student_id = s.id
    LEFT JOIN users t ON c.teacher_id = t.id
    WHERE c.student_id = (SELECT id FROM students WHERE phone = ? OR email = ?)
    ORDER BY c.created_at ASC
  `, [user.username, user.username], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Send chat message
router.post('/chat', (req, res) => {
  const { message } = req.body;
  const user = req.user;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Get student ID
  db.get('SELECT id, class_id FROM students WHERE phone = ? OR email = ?', [user.username, user.username], (err, student) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    // Get teacher ID from class
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [student.class_id], (err2, classData) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      
      db.run('INSERT INTO chat_messages (student_id, teacher_id, message, sender_type) VALUES (?, ?, ?, ?)', 
        [student.id, classData.teacher_id, message.trim(), 'student'], function(err3) {
        if (err3) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, messageId: this.lastID });
      });
    });
  });
});

module.exports = router;
