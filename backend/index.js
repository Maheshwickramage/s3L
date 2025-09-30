const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors()); // Enable CORS for http://localhost:5050/(cors());
app.use(express.json());

// Test MySQL database connection
testConnection().then((connected) => {
  if (connected) {
    console.log('Connected to MySQL database');
  } else {
    console.error('Failed to connect to MySQL database');
    process.exit(1);
  }
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Teacher routes
const teacherRoutes = require('./routes/teacher');
app.use('/api/teacher', teacherRoutes);
// Student routes
const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes);
// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'S3Learn Backend API'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Student Management System Backend');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
