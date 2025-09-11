
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';
import ClassManagement from './pages/ClassManagement';
import TeacherDashboard from './pages/TeacherDashboard';
import { isAuthenticated, getUserData, verifyToken, logout } from './utils/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is already logged in
        if (isAuthenticated()) {
          const userData = getUserData();
          if (userData) {
            // Verify token with backend
            const verifiedUser = await verifyToken();
            if (verifiedUser) {
              setUser(verifiedUser);
              setMustChangePassword(!!userData.must_change_password);
            } else {
              // Token is invalid, clear auth data
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setMustChangePassword(!!userData.must_change_password);
    // Redirect to dashboard based on role
    if (userData.role === 'teacher') {
      navigate('/classManagement');
    } else if (userData.role === 'student') {
      navigate('/studentDashboard');
    } else if (userData.role === 'admin') {
      navigate('/adminDashboard');
    }
  };

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMustChangePassword(false);
    setSelectedClass(null);
    navigate('/login');
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    navigate('/teacherDashboard');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    navigate('/classManagement');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/changePassword" element={mustChangePassword && user ? <ChangePassword user={user} onPasswordChanged={handlePasswordChanged} /> : <Navigate to="/login" />} />
        <Route path="/classManagement" element={user && user.role === 'teacher' ? <ClassManagement user={user} onLogout={handleLogout} onClassSelect={handleClassSelect} /> : <Navigate to="/login" />} />
        <Route path="/teacherDashboard" element={user && user.role === 'teacher' && selectedClass ? <TeacherDashboard user={user} onLogout={handleLogout} selectedClass={selectedClass} onBackToClasses={handleBackToClasses} /> : <Navigate to="/classManagement" />} />
        <Route path="/studentDashboard" element={user && user.role === 'student' ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/adminDashboard" element={user && user.role === 'admin' ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? (user.role === 'teacher' ? '/classManagement' : user.role === 'student' ? '/studentDashboard' : '/adminDashboard') : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;
