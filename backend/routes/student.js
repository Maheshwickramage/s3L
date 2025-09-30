const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { query, queryOne, execute } = require('../config/database');

// Apply authentication to all student routes
router.use(authenticateToken);

// Student Analytics Endpoint
router.get('/analytics', async (req, res) => {
  try {
    const user = req.user;
    console.log('Analytics request for user:', user);
    
    // Get student data - handle both direct student users and users with student data
    let studentId = null;
    let classId = null;
    
    if (user.role === 'student') {
      // For users registered as students
      const student = await queryOne(
        'SELECT * FROM students WHERE phone = ? OR email = ?',
        [user.username, user.username]
      );
      
      if (student) {
        studentId = student.id;
        classId = student.class_id;
      } else {
        // Create a student record if it doesn't exist
        const insertResult = await execute(
          'INSERT INTO students (name, phone, email, teacher_id, class_id) VALUES (?, ?, ?, 1, 1)',
          [user.student_name || user.username, user.username, user.student_email || null]
        );
        studentId = insertResult.insertId;
        classId = 1; // Default class
      }
    } else {
      // Fallback for testing - use user ID as student ID
      studentId = user.id;
      classId = user.class_id || 1;
    }

    console.log('Using studentId:', studentId, 'classId:', classId);

    // Get total available quizzes
    const totalQuizzesResult = await queryOne('SELECT COUNT(*) as count FROM quizzes');
    const totalQuizzes = totalQuizzesResult?.count || 0;

    // Get completed quizzes count
    const completedQuizzesResult = await queryOne(
      'SELECT COUNT(DISTINCT quiz_id) as count FROM quiz_attempts WHERE student_id = ?',
      [studentId]
    );
    const completedQuizzes = completedQuizzesResult?.count || 0;

    // Get average score percentage
    const avgScoreResult = await queryOne(
      'SELECT AVG((score/total_marks)*100) as avg_score FROM quiz_attempts WHERE student_id = ? AND total_marks > 0',
      [studentId]
    );
    const averageScore = Math.round(avgScoreResult?.avg_score || 0);

    // Get class rank (simplified - based on average score)
    let rank = 0;
    if (averageScore > 0) {
      const rankResult = await queryOne(`
        SELECT COUNT(*) + 1 as rank FROM (
          SELECT student_id, AVG((score/total_marks)*100) as avg_score 
          FROM quiz_attempts 
          WHERE student_id IN (SELECT id FROM students WHERE class_id = ?) AND total_marks > 0
          GROUP BY student_id
          HAVING avg_score > ?
        ) as higher_scores
      `, [classId, averageScore]);
      rank = rankResult?.rank || 0;
    }

    // Get enrolled classes count
    const totalClasses = 1; // For now, assuming 1 class per student

    // Get recent achievements (based on performance)
    const achievements = [];
    if (completedQuizzes >= 1) {
      achievements.push({
        title: 'First Steps',
        description: 'Completed your first quiz!'
      });
    }
    if (completedQuizzes >= 3) {
      achievements.push({
        title: 'Quiz Explorer',
        description: 'Completed 3 quizzes'
      });
    }
    if (completedQuizzes >= 5) {
      achievements.push({
        title: 'Quiz Master',
        description: 'Completed 5 or more quizzes'
      });
    }
    if (averageScore >= 70) {
      achievements.push({
        title: 'Good Student',
        description: 'Maintained 70%+ average score'
      });
    }
    if (averageScore >= 80) {
      achievements.push({
        title: 'High Achiever',
        description: 'Maintained 80%+ average score'
      });
    }
    if (completedQuizzes >= 10) {
      achievements.push({
        title: 'Dedicated Learner',
        description: 'Completed 10+ quizzes'
      });
    }

    const analyticsData = {
      totalQuizzes,
      completedQuizzes,
      averageScore,
      totalClasses,
      rank: rank > 100 ? 0 : rank, // If rank is too high, show as unranked
      achievements
    };

    console.log('Sending analytics data:', analyticsData);
    res.json(analyticsData);

  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Student Quiz History Endpoint
router.get('/quiz-history', async (req, res) => {
  try {
    const user = req.user;
    console.log('Quiz history request for user:', user);
    
    // Get student data - handle both direct student users and users with student data
    let studentId = null;
    
    if (user.role === 'student') {
      const student = await queryOne(
        'SELECT * FROM students WHERE phone = ? OR email = ?',
        [user.username, user.username]
      );
      
      if (student) {
        studentId = student.id;
      } else {
        studentId = user.id; // Fallback to user ID
      }
    } else {
      studentId = user.id; // Fallback for testing
    }

    console.log('Fetching quiz history for studentId:', studentId);

    // Get quiz history with quiz details
    const quizHistory = await query(`
      SELECT 
        qa.id,
        qa.score,
        qa.total_marks,
        qa.submitted_at,
        COALESCE(q.title, 'Sample Quiz') as quiz_name,
        COALESCE(q.subject, 'General') as subject,
        COALESCE(q.difficulty, 'Medium') as difficulty
      FROM quiz_attempts qa
      LEFT JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.student_id = ?
      ORDER BY qa.submitted_at DESC
      LIMIT 20
    `, [studentId]);

    console.log('Found quiz history:', quizHistory?.length || 0, 'records');
    res.json(quizHistory || []);

  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

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
