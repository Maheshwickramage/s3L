-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN subscription_type ENUM('free', 'premium') DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN subscription_status ENUM('active', 'inactive', 'expired') DEFAULT 'active';

-- Add subscription fields to students table
ALTER TABLE students ADD COLUMN subscription_type ENUM('free', 'premium') DEFAULT 'free';
ALTER TABLE students ADD COLUMN quiz_attempts_used INT DEFAULT 0;
ALTER TABLE students ADD COLUMN max_quiz_attempts INT DEFAULT 5; -- Free users get 5 practice quizzes

-- Update existing users to have free subscription
UPDATE users SET subscription_type = 'free', subscription_status = 'active' WHERE subscription_type IS NULL;
UPDATE students SET subscription_type = 'free', quiz_attempts_used = 0, max_quiz_attempts = 5 WHERE subscription_type IS NULL;