-- Add missing tables for student analytics

-- Create quiz_attempts table for detailed tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total_marks INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken INT DEFAULT NULL, -- in seconds
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_student_quiz (student_id, quiz_id),
  INDEX idx_submitted_at (submitted_at)
);

-- Create questions table (standardized naming)
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  marks INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create options table (standardized naming)
CREATE TABLE IF NOT EXISTS options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Add sample data if tables are empty
INSERT IGNORE INTO quizzes (id, title, subject, difficulty, teacher_id, class_id, created_at) VALUES
(1, 'Mathematics Basics', 'Mathematics', 'Easy', 1, 1, NOW()),
(2, 'Science Fundamentals', 'Science', 'Medium', 1, 1, NOW()),
(3, 'English Grammar', 'English', 'Easy', 1, 1, NOW()),
(4, 'History Quiz', 'History', 'Medium', 1, 1, NOW()),
(5, 'Physics Introduction', 'Physics', 'Hard', 1, 1, NOW());

-- Add sample questions for Mathematics Basics quiz
INSERT IGNORE INTO questions (id, quiz_id, question_text, marks) VALUES
(1, 1, 'What is 2 + 2?', 1),
(2, 1, 'What is 5 x 3?', 1),
(3, 1, 'What is 10 ÷ 2?', 1),
(4, 1, 'What is 7 - 3?', 1),
(5, 1, 'What is 6 x 6?', 2);

-- Add sample options
INSERT IGNORE INTO options (id, question_id, option_text, is_correct) VALUES
-- Question 1: What is 2 + 2?
(1, 1, '3', FALSE),
(2, 1, '4', TRUE),
(3, 1, '5', FALSE),
(4, 1, '6', FALSE),
-- Question 2: What is 5 x 3?
(5, 2, '12', FALSE),
(6, 2, '15', TRUE),
(7, 2, '18', FALSE),
(8, 2, '20', FALSE),
-- Question 3: What is 10 ÷ 2?
(9, 3, '4', FALSE),
(10, 3, '5', TRUE),
(11, 3, '6', FALSE),
(12, 3, '3', FALSE),
-- Question 4: What is 7 - 3?
(13, 4, '3', FALSE),
(14, 4, '4', TRUE),
(15, 4, '5', FALSE),
(16, 4, '6', FALSE),
-- Question 5: What is 6 x 6?
(17, 5, '32', FALSE),
(18, 5, '36', TRUE),
(19, 5, '42', FALSE),
(20, 5, '30', FALSE);

-- Add sample quiz attempts for analytics
INSERT IGNORE INTO quiz_attempts (id, student_id, quiz_id, score, total_marks, submitted_at) VALUES
(1, 1, 1, 4, 6, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, 2, 7, 10, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 1, 3, 8, 10, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 1, 1, 5, 6, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 1, 4, 6, 8, NOW());