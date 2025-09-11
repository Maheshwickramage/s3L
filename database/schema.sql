-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('student', 'teacher', 'admin')) NOT NULL
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  class_id INTEGER,
  teacher_id INTEGER,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  class_id INTEGER,
  teacher_id INTEGER,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  quiz_id INTEGER,
  score INTEGER,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER,
  question_text TEXT NOT NULL,
  marks INTEGER NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Quiz Options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER,
  option_text TEXT NOT NULL,
  is_correct INTEGER DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
);
