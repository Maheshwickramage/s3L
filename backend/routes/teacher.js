const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/s3learn.db');




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
  db.run('DELETE FROM quizzes WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Get all quizzes
router.get('/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
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
router.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Delete a student
router.delete('/students/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
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
