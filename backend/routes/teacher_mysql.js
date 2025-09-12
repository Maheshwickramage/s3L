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
router.put('/classes/:id', async (req, res) => {
  const { name, description } = req.body;
  const classId = req.params.id;
  const user = req.user;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await execute('UPDATE classes SET name = ?, description = ? WHERE id = ?', 
      [name, description, classId]);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ success: true, id: classId, name, description });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Delete a class
router.delete('/classes/:id', async (req, res) => {
  const classId = req.params.id;
  const user = req.user;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete related data first
    await execute('DELETE FROM students WHERE class_id = ?', [classId]);
    await execute('DELETE FROM quizzes WHERE class_id = ?', [classId]);
    const result = await execute('DELETE FROM classes WHERE id = ?', [classId]);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get full quiz details (quiz, questions, options)
router.get('/quizzes/:id/full', async (req, res) => {
  const quizId = req.params.id;
  try {
    const quiz = await queryOne('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
    const questions = await query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    
    if (!questions.length) return res.json({ ...quiz, questions: [] });
    
    // Get options for each question
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

// Delete a quiz
router.delete('/quizzes/:id', async (req, res) => {
  const quizId = req.params.id;
  try {
    // Get all question IDs for this quiz
    const questions = await query('SELECT id FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    
    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      // Delete all options for these questions
      await execute(`DELETE FROM quiz_options WHERE question_id IN (${questionIds.map(() => '?').join(',')})`, questionIds);
      // Delete all questions
      await execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    }
    
    // Delete leaderboard entries
    await execute('DELETE FROM leaderboard WHERE quiz_id = ?', [quizId]);
    
    // Finally delete the quiz
    const result = await execute('DELETE FROM quizzes WHERE id = ?', [quizId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get all quizzes for the logged-in teacher
router.get('/quizzes', async (req, res) => {
  const user = req.user;
  try {
    let rows;
    if (user.role === 'teacher') {
      rows = await query('SELECT * FROM quizzes WHERE teacher_id = ?', [user.id]);
    } else {
      rows = await query('SELECT * FROM quizzes');
    }
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Add a student
router.post('/students', async (req, res) => {
  console.log(req.body);
  const { name, email, phone, class_id, teacher_id } = req.body;
  const defaultPassword = 'changeme123';
  
  try {
    const studentResult = await execute('INSERT INTO students (name, email, phone, class_id, teacher_id) VALUES (?, ?, ?, ?, ?)', 
      [name, email, phone, class_id, teacher_id]);
    const studentId = studentResult.insertId;
    
    // Also create a user entry for login, using phone as username
    await execute('INSERT INTO users (username, password, role, must_change_password) VALUES (?, ?, ?, ?)', 
      [phone, defaultPassword, 'student', 1]);
    
    res.json({ id: studentId, name, email, phone, class_id, teacher_id, defaultPassword });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create a quiz
router.post('/quizzes', async (req, res) => {
  console.log(req.body);
  const { title, class_id, teacher_id } = req.body;
  try {
    const result = await execute('INSERT INTO quizzes (title, class_id, teacher_id) VALUES (?, ?, ?)', 
      [title, class_id, teacher_id]);
    res.json({ id: result.insertId, title, class_id, teacher_id });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update a quiz title
router.put('/quizzes/:id', async (req, res) => {
  const { title } = req.body;
  const quizId = req.params.id;
  try {
    const result = await execute('UPDATE quizzes SET title = ? WHERE id = ?', [title, quizId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ success: true, id: quizId, title });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Add questions and options to a quiz
router.post('/quizzes/:quizId/questions', async (req, res) => {
  console.log(req.body);
  const { questions } = req.body;
  const quizId = req.params.quizId;
  
  if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions must be an array' });
  if (questions.length === 0) return res.json({ success: true, questions: [] });
  
  try {
    const insertedQuestions = [];
    
    for (const q of questions) {
      const questionResult = await execute('INSERT INTO quiz_questions (quiz_id, question_text, marks) VALUES (?, ?, ?)', 
        [quizId, q.question_text, q.marks]);
      const questionId = questionResult.insertId;
      
      // Insert options
      for (const opt of q.options) {
        await execute('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', 
          [questionId, opt.option_text, opt.is_correct ? 1 : 0]);
      }
      
      insertedQuestions.push({ id: questionId, ...q });
    }
    
    res.json({ success: true, questions: insertedQuestions });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get quiz questions and options
router.get('/quizzes/:quizId/questions', async (req, res) => {
  const quizId = req.params.quizId;
  try {
    const questions = await query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    
    if (!questions.length) return res.json([]);
    
    // Get options for each question
    for (let i = 0; i < questions.length; i++) {
      const options = await query('SELECT id, option_text, is_correct FROM quiz_options WHERE question_id = ?', [questions[i].id]);
      questions[i].options = options;
    }
    
    res.json(questions);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const rows = await query('SELECT students.name, leaderboard.score FROM leaderboard JOIN students ON leaderboard.student_id = students.id ORDER BY leaderboard.score DESC');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get number of attendees
router.get('/attendees', async (req, res) => {
  try {
    const result = await queryOne('SELECT COUNT(*) as count FROM students');
    res.json({ count: result.count });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get all students for the logged-in teacher
router.get('/students', async (req, res) => {
  const user = req.user;
  try {
    let rows;
    if (user.role === 'teacher') {
      rows = await query('SELECT * FROM students WHERE teacher_id = ?', [user.id]);
    } else {
      rows = await query('SELECT * FROM students');
    }
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get students for a specific class
router.get('/classes/:classId/students', async (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const rows = await query('SELECT * FROM students WHERE class_id = ?', [classId]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get quizzes for a specific class
router.get('/classes/:classId/quizzes', async (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const rows = await query('SELECT * FROM quizzes WHERE class_id = ?', [classId]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Student: Get quizzes for their assigned teacher
router.get('/student-quizzes', authorizeRole(['student']), async (req, res) => {
  const user = req.user;
  try {
    // Find student's teacher_id
    const student = await queryOne('SELECT teacher_id FROM students WHERE id = ?', [user.id]);
    if (!student) return res.status(500).json({ error: 'Student not found' });
    
    const quizzes = await query('SELECT * FROM quizzes WHERE teacher_id = ?', [student.teacher_id]);
    res.json(quizzes);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    // First delete the user record
    await execute('DELETE FROM users WHERE username = ? AND role = ?', [studentId, 'student']);
    
    // Then delete the student record
    const result = await execute('DELETE FROM students WHERE id = ?', [studentId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update a quiz question and its options
router.put('/quizzes/:quizId/questions/:questionId', async (req, res) => {
  const { question_text, marks, options } = req.body;
  const { quizId, questionId } = req.params;
  
  try {
    await execute('UPDATE quiz_questions SET question_text = ?, marks = ? WHERE id = ? AND quiz_id = ?', 
      [question_text, marks, questionId, quizId]);
    
    // Remove old options
    await execute('DELETE FROM quiz_options WHERE question_id = ?', [questionId]);
    
    // Insert new options
    for (const opt of options) {
      await execute('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', 
        [questionId, opt.option_text, opt.is_correct ? 1 : 0]);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get quiz results with student names and class information
router.get('/results', async (req, res) => {
  const user = req.user;
  
  try {
    let rows;
    if (user.role === 'teacher') {
      rows = await query(`
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
      `, [user.id]);
    } else {
      rows = await query(`
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
      `);
    }
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Save student quiz result
router.post('/results', async (req, res) => {
  console.log(req.body);
  const { student_id, quiz_id, score } = req.body;
  
  if (!student_id || !quiz_id || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const result = await execute('INSERT INTO leaderboard (student_id, quiz_id, score) VALUES (?, ?, ?)', 
      [student_id, quiz_id, score]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Chat routes
// Get chat messages for teacher
router.get('/chat', async (req, res) => {
  const user = req.user;
  try {
    const rows = await query(`
      SELECT c.*, s.name as student_name, s.phone as student_phone, s.email as student_email
      FROM chat_messages c
      JOIN students s ON c.student_id = s.id
      WHERE c.teacher_id = ?
      ORDER BY c.created_at ASC
    `, [user.id]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Send chat message as teacher
router.post('/chat', async (req, res) => {
  const { student_id, message } = req.body;
  const user = req.user;
  
  if (!student_id || !message || message.trim() === '') {
    return res.status(400).json({ error: 'Student ID and message are required' });
  }
  
  try {
    const result = await execute('INSERT INTO chat_messages (student_id, teacher_id, message, sender_type) VALUES (?, ?, ?, ?)', 
      [student_id, user.id, message.trim(), 'teacher']);
    res.json({ success: true, messageId: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// File management routes
// Upload file for class
router.post('/classes/:classId/files', async (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  const { filename, original_name, file_path, file_size, file_type, description } = req.body;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await execute('INSERT INTO class_files (class_id, teacher_id, filename, original_name, file_path, file_size, file_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [classId, user.id, filename, original_name, file_path, file_size, file_type, description]);
    res.json({ success: true, fileId: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get files for class
router.get('/classes/:classId/files', async (req, res) => {
  const classId = req.params.classId;
  const user = req.user;
  
  try {
    // Check if teacher owns this class
    if (user.role === 'teacher') {
      const classData = await queryOne('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!classData) return res.status(404).json({ error: 'Class not found' });
      if (classData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const rows = await query('SELECT * FROM class_files WHERE class_id = ? ORDER BY created_at DESC', [classId]);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Delete file
router.delete('/files/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const user = req.user;
  
  try {
    if (user.role === 'teacher') {
      const fileData = await queryOne('SELECT teacher_id FROM class_files WHERE id = ?', [fileId]);
      if (!fileData) return res.status(404).json({ error: 'File not found' });
      if (fileData.teacher_id !== user.id) return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await execute('DELETE FROM class_files WHERE id = ?', [fileId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
