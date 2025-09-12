const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { query, queryOne, execute } = require('../config/database');

// Apply authentication to all teacher routes
router.use(authenticateToken);
router.use(authorizeRole(['teacher', 'admin']));

// Class management routes
// Get all classes for the logged-in teacher
router.get('/classes', async (req, res) => {
  console.log("get classes");
  const user = req.user;
  try {
    let rows;
    if (user.role === 'teacher') {
      rows = await query(`
        SELECT c.*, 
               COUNT(DISTINCT s.id) as student_count,
               COUNT(DISTINCT q.id) as quiz_count
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        LEFT JOIN quizzes q ON c.id = q.class_id
        WHERE c.teacher_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [user.id]);
    } else {
      rows = await query(`
        SELECT c.*, 
               COUNT(DISTINCT s.id) as student_count,
               COUNT(DISTINCT q.id) as quiz_count
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        LEFT JOIN quizzes q ON c.id = q.class_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);
    }
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Create a new class
router.post('/classes', async (req, res) => {
  const { name, description, teacher_id } = req.body;
  try {
    const result = await execute('INSERT INTO classes (name, description, teacher_id) VALUES (?, ?, ?)', 
      [name, description, teacher_id]);
    res.json({ 
      id: result.insertId, 
      name, 
      description, 
      teacher_id,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update a class
router.put('/classes/:id', (req, res) => {
  const { name, description } = req.body;
  const classId = req.params.id;
  const user = req.user;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.run('UPDATE classes SET name = ?, description = ? WHERE id = ?', 
        [name, description, classId], function(err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Class not found' });
        res.json({ success: true, id: classId, name, description });
      });
    });
  } else {
    db.run('UPDATE classes SET name = ?, description = ? WHERE id = ?', 
      [name, description, classId], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Class not found' });
      res.json({ success: true, id: classId, name, description });
    });
  }
});

// Delete a class
router.delete('/classes/:id', (req, res) => {
  const classId = req.params.id;
  const user = req.user;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      // Delete related data first
      db.serialize(() => {
        // Delete students in this class
        db.run('DELETE FROM students WHERE class_id = ?', [classId]);
        // Delete quizzes in this class
        db.run('DELETE FROM quizzes WHERE class_id = ?', [classId]);
        // Delete the class
        db.run('DELETE FROM classes WHERE id = ?', [classId], function(err2) {
          if (err2) return res.status(500).json({ error: 'Database error' });
          if (this.changes === 0) return res.status(404).json({ error: 'Class not found' });
          res.json({ success: true });
        });
      });
    });
  } else {
    // Admin can delete any class
    db.serialize(() => {
      db.run('DELETE FROM students WHERE class_id = ?', [classId]);
      db.run('DELETE FROM quizzes WHERE class_id = ?', [classId]);
      db.run('DELETE FROM classes WHERE id = ?', [classId], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Class not found' });
        res.json({ success: true });
      });
    });
  }
});




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
  const { name, email, phone, class_id, teacher_id } = req.body;
  // Default password for new student
  const defaultPassword = 'changeme123';
  db.run('INSERT INTO students (name, email, phone, class_id, teacher_id) VALUES (?, ?, ?, ?, ?)', [name, email, phone, class_id, teacher_id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    const studentId = this.lastID;
    // Also create a user entry for login, using phone as username
    db.run('INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)', [phone, defaultPassword, 'student', 1], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error (user creation)', details: err2.message });
      res.json({ id: studentId, name, email, phone, class_id, teacher_id, defaultPassword });
    });
  });
});

// Create a quiz
router.post('/quizzes', (req, res) => {
  console.log(req.body);
  const { title, class_id, teacher_id } = req.body;
  db.run('INSERT INTO quizzes (title, class_id, teacher_id) VALUES (?, ?, ?)', [title, class_id, teacher_id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, title, class_id, teacher_id });
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

// Get students for a specific class
router.get('/classes/:classId/students', (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.all('SELECT * FROM students WHERE class_id = ?', [classId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
      });
    });
  } else {
    db.all('SELECT * FROM students WHERE class_id = ?', [classId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});

// Get quizzes for a specific class
router.get('/classes/:classId/quizzes', (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.all('SELECT * FROM quizzes WHERE class_id = ?', [classId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
      });
    });
  } else {
    db.all('SELECT * FROM quizzes WHERE class_id = ?', [classId], (err, rows) => {
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

// Get quiz results with student names and class information
router.get('/results', (req, res) => {
  const user = req.user;
  
  if (user.role === 'teacher') {
    // Get results for quizzes created by this teacher
    db.all(`
      SELECT 
        l.id,
        s.name as student_name,
        s.phone as student_phone,
        s.email as student_email,
        q.title as quiz_name,
        c.name as class_name,
        l.score,
        l.created_at as submitted_at
      FROM leaderboard l
      JOIN students s ON l.student_id = s.id
      JOIN quizzes q ON l.quiz_id = q.id
      JOIN classes c ON s.class_id = c.id
      WHERE q.teacher_id = ?
      ORDER BY l.created_at DESC
    `, [user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    // Admin can see all results
    db.all(`
      SELECT 
        l.id,
        s.name as student_name,
        s.phone as student_phone,
        s.email as student_email,
        q.title as quiz_name,
        c.name as class_name,
        l.score,
        l.created_at as submitted_at
      FROM leaderboard l
      JOIN students s ON l.student_id = s.id
      JOIN quizzes q ON l.quiz_id = q.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY l.created_at DESC
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
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

// Chat routes
// Get chat messages for teacher
router.get('/chat', (req, res) => {
  const user = req.user;
  db.all(`
    SELECT c.*, s.name as student_name, s.phone as student_phone, s.email as student_email
    FROM chat_messages c
    JOIN students s ON c.student_id = s.id
    WHERE c.teacher_id = ?
    ORDER BY c.created_at ASC
  `, [user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Send chat message as teacher
router.post('/chat', (req, res) => {
  const { student_id, message } = req.body;
  const user = req.user;
  
  if (!student_id || !message || message.trim() === '') {
    return res.status(400).json({ error: 'Student ID and message are required' });
  }
  
  db.run('INSERT INTO chat_messages (student_id, teacher_id, message, sender_type) VALUES (?, ?, ?, ?)', 
    [student_id, user.id, message.trim(), 'teacher'], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true, messageId: this.lastID });
  });
});

// File management routes
// Upload file for class
router.post('/classes/:classId/files', (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  const { filename, original_name, file_path, file_size, file_type, description } = req.body;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.run('INSERT INTO class_files (class_id, teacher_id, filename, original_name, file_path, file_size, file_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [classId, user.id, filename, original_name, file_path, file_size, file_type, description], function(err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, fileId: this.lastID });
      });
    });
  } else {
    db.run('INSERT INTO class_files (class_id, teacher_id, filename, original_name, file_path, file_size, file_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [classId, user.id, filename, original_name, file_path, file_size, file_type, description], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, fileId: this.lastID });
    });
  }
});

// Get files for class
router.get('/classes/:classId/files', (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  // Check if teacher owns this class
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.all('SELECT * FROM class_files WHERE class_id = ? ORDER BY created_at DESC', [classId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
      });
    });
  } else {
    db.all('SELECT * FROM class_files WHERE class_id = ? ORDER BY created_at DESC', [classId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});

// Delete file
router.delete('/files/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const user = req.user;
  
  if (user.role === 'teacher') {
    db.get('SELECT teacher_id FROM class_files WHERE id = ?', [fileId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'File not found' });
      if (row.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
      
      db.run('DELETE FROM class_files WHERE id = ?', [fileId], function(err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
      });
    });
  } else {
    db.run('DELETE FROM class_files WHERE id = ?', [fileId], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  }
});

module.exports = router;
