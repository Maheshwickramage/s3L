const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const db = new sqlite3.Database('./database/s3learn.db');

// Apply authentication to all teacher routes
router.use(authenticateToken);
router.use(authorizeRole(['teacher', 'admin']));




// Get full quiz details (quiz, questions, options)
router.get('/quizzes/:id/full', (req, res) => {
  const quizId = req.params.id;
  db.get('SELECT * FROM quizzes WHERE id = ?', [quizId], (err, quiz) => {
    if (err) return res.status(500).json({ error: 'Database error (quiz)' });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
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


// Delete a quiz
router.delete('/quizzes/:id', (req, res) => {
  const quizId = req.params.id;
  // First get all question IDs for this quiz
  db.all('SELECT id FROM quiz_questions WHERE quiz_id = ?', [quizId], (err, questions) => {
    if (err) return res.status(500).json({ error: 'Database error (getting questions)' });
    
    // Delete all options for these questions
    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      const placeholders = questionIds.map(() => '?').join(',');
      db.run(`DELETE FROM quiz_options WHERE question_id IN (${placeholders})`, questionIds, (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error (deleting options)' });
        
        // Delete all questions
        db.run('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId], (err3) => {
          if (err3) return res.status(500).json({ error: 'Database error (deleting questions)' });
          
          // Delete leaderboard entries
          db.run('DELETE FROM leaderboard WHERE quiz_id = ?', [quizId], (err4) => {
            if (err4) return res.status(500).json({ error: 'Database error (deleting leaderboard)' });
            
            // Finally delete the quiz
            db.run('DELETE FROM quizzes WHERE id = ?', [quizId], function(err5) {
              if (err5) return res.status(500).json({ error: 'Database error (deleting quiz)' });
              if (this.changes === 0) return res.status(404).json({ error: 'Quiz not found' });
              res.json({ success: true });
            });
          });
        });
      });
    } else {
      // No questions, just delete the quiz
      db.run('DELETE FROM quizzes WHERE id = ?', [quizId], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Quiz not found' });
        res.json({ success: true });
      });
    }
  });
});

// Get all quizzes
// Get all quizzes for the logged-in teacher
router.get('/quizzes', (req, res) => {
  // If teacher, filter by teacher_id; if admin, show all
  const user = req.user;
  if (user.role === 'teacher') {
    db.all('SELECT * FROM quizzes WHERE teacher_id = ?', [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM quizzes', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});

// Add a student
router.post('/students', (req, res) => {
  console.log(req.body);
  const { name, email, class: studentClass, teacher_id } = req.body;
  // Default password for new student
  const defaultPassword = 'changeme123';
  db.run('INSERT INTO students (name, email, class, teacher_id) VALUES (?, ?, ?, ?)', [name, email, studentClass, teacher_id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    const studentId = this.lastID;
    // Also create a user entry for login, using studentId as username
    db.run('INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)', [studentId, defaultPassword, 'student', 1], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error (user creation)', details: err2.message });
      res.json({ id: studentId, name, email, class: studentClass, teacher_id, defaultPassword });
    });
  });
});

// Create a quiz
router.post('/quizzes', (req, res) => {
  console.log(req.body);
  const { title, teacher_id } = req.body;
  db.run('INSERT INTO quizzes (title, teacher_id) VALUES (?, ?)', [title, teacher_id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, title, teacher_id });
  });
});

// Update a quiz title
router.put('/quizzes/:id', (req, res) => {
  const { title } = req.body;
  const quizId = req.params.id;
  db.run('UPDATE quizzes SET title = ? WHERE id = ?', [title, quizId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ success: true, id: quizId, title });
  });
});

// Add questions and options to a quiz
router.post('/quizzes/:quizId/questions', (req, res) => {
  console.log(req.body);
  const { questions } = req.body; // [{question_text, marks, options: [{option_text, is_correct}]}]
  const quizId = req.params.quizId;
  if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions must be an array' });
  let insertedQuestions = [];
  let errorOccurred = false;
  let pending = questions.length;
  if (pending === 0) return res.json({ success: true, questions: [] });
  questions.forEach(q => {
    db.run('INSERT INTO quiz_questions (quiz_id, question_text, marks) VALUES (?, ?, ?)', [quizId, q.question_text, q.marks], function(err) {
      if (err) {
        errorOccurred = true;
        return res.status(500).json({ error: 'Database error (question)' });
      }
      const questionId = this.lastID;
      insertedQuestions.push({ id: questionId, ...q });
      // Insert options
      let optionsPending = q.options.length;
      if (optionsPending === 0) {
        if (--pending === 0 && !errorOccurred) res.json({ success: true, questions: insertedQuestions });
        return;
      }
      q.options.forEach(opt => {
        db.run('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, opt.option_text, opt.is_correct ? 1 : 0], function(err2) {
          if (err2) {
            errorOccurred = true;
            return res.status(500).json({ error: 'Database error (option)' });
          }
          if (--optionsPending === 0) {
            if (--pending === 0 && !errorOccurred) res.json({ success: true, questions: insertedQuestions });
          }
        });
      });
    });
  });
});

// Get quiz questions and options
router.get('/quizzes/:quizId/questions', (req, res) => {
  const quizId = req.params.quizId;
  db.all('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId], (err, questions) => {
    if (err) return res.status(500).json({ error: 'Database error (questions)' });
    if (!questions.length) return res.json([]);
    let pending = questions.length;
    questions.forEach((q, idx) => {
      db.all('SELECT id, option_text, is_correct FROM quiz_options WHERE question_id = ?', [q.id], (err2, options) => {
        if (err2) return res.status(500).json({ error: 'Database error (options)' });
        questions[idx].options = options;
        if (--pending === 0) res.json(questions);
      });
    });
  });
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  db.all('SELECT students.name, leaderboard.score FROM leaderboard JOIN students ON leaderboard.student_id = students.id ORDER BY leaderboard.score DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get number of attendees
router.get('/attendees', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM students', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ count: row.count });
  });
});

// Monitor students
// Get all students for the logged-in teacher
router.get('/students', (req, res) => {
  const user = req.user;
  if (user.role === 'teacher') {
    db.all('SELECT * FROM students WHERE teacher_id = ?', [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});
// Student: Get quizzes for their assigned teacher
router.get('/student-quizzes', authorizeRole(['student']), (req, res) => {
  const user = req.user;
  // Find student's teacher_id
  db.get('SELECT teacher_id FROM students WHERE id = ?', [user.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Database error or student not found' });
    db.all('SELECT * FROM quizzes WHERE teacher_id = ?', [row.teacher_id], (err2, quizzes) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json(quizzes);
    });
  });
});

// Delete a student
router.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;
  // First delete the user record
  db.run('DELETE FROM users WHERE username = ? AND role = ?', [studentId, 'student'], function(err) {
    if (err) return res.status(500).json({ error: 'Database error (user deletion)' });
    // Then delete the student record
    db.run('DELETE FROM students WHERE id = ?', [studentId], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error (student deletion)' });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      res.json({ success: true });
    });
  });
});

// Update a quiz question and its options
router.put('/quizzes/:quizId/questions/:questionId', (req, res) => {
  const { question_text, marks, options } = req.body;
  const { quizId, questionId } = req.params;
  db.run('UPDATE quiz_questions SET question_text = ?, marks = ? WHERE id = ? AND quiz_id = ?', [question_text, marks, questionId, quizId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error (question update)' });
    // Remove old options
    db.run('DELETE FROM quiz_options WHERE question_id = ?', [questionId], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error (option delete)' });
      let pending = options.length;
      if (pending === 0) return res.json({ success: true });
      options.forEach(opt => {
        db.run('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, opt.option_text, opt.is_correct ? 1 : 0], function(err3) {
          if (err3) return res.status(500).json({ error: 'Database error (option insert)' });
          if (--pending === 0) res.json({ success: true });
        });
      });
    });
  });
});

// Get quiz results with student names
router.get('/results', (req, res) => {
  db.all(`
    SELECT 
      l.id,
      s.name as student_name,
      q.title as quiz_name,
      l.score
    FROM leaderboard l
    JOIN students s ON l.student_id = s.id
    JOIN quizzes q ON l.quiz_id = q.id
    ORDER BY l.score DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Save student quiz result
router.post('/results', (req, res) => {
  console.log(req.body);
  const { student_id, quiz_id, score } = req.body;
  if (!student_id || !quiz_id || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO leaderboard (student_id, quiz_id, score) VALUES (?, ?, ?)',
    [student_id, quiz_id, score],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error', details: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

module.exports = router;
