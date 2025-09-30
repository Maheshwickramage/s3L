import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Edit,
  Save,
  Cancel,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.student_name || user?.username || '',
    email: user?.student_email || '',
    phone: user?.student_phone || user?.username || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    navigate('/');
    return null;
  }

  const getInitials = (name) => {
    if (!name) return user.username?.charAt(0)?.toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    return user.student_name || user.username || 'User';
  };

  const getUserRole = () => {
    return user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1) || 'Student';
  };

  const getSubscriptionStatus = () => {
    return user.subscription_type || 'Free';
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.student_name || user?.username || '',
      email: user?.student_email || '',
      phone: user?.student_phone || user?.username || ''
    });
    setMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Here you would call an API to update user profile
      // For now, we'll just simulate the update
      setTimeout(() => {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
        // In real implementation, call onUserUpdate with new data
      }, 1000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            My Profile
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Manage your account information and preferences
          </Typography>
        </Box>

        {/* Profile Card */}
        <Paper elevation={10} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Profile Header */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.3)',
                mx: 'auto',
                mb: 2
              }}
            >
              {getInitials(getDisplayName())}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {getDisplayName()}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={getUserRole()}
                sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                icon={<School sx={{ color: 'white !important' }} />}
              />
              <Chip
                label={getSubscriptionStatus()}
                sx={{ 
                  background: getSubscriptionStatus() === 'Premium' 
                    ? 'rgba(255,215,0,0.3)' 
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                icon={getSubscriptionStatus() === 'Premium' 
                  ? <Star sx={{ color: 'white !important' }} />
                  : <Star sx={{ color: 'white !important' }} />
                }
              />
            </Box>
          </Box>

          {/* Profile Content */}
          <Box sx={{ p: 4 }}>
            {message && (
              <Alert 
                severity={message.includes('success') ? 'success' : 'error'} 
                sx={{ mb: 3 }}
              >
                {message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Personal Information
              </Typography>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)',
                      },
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  disabled={!isEditing}
                  fullWidth
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={!isEditing}
                  fullWidth
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  fullWidth
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Account Statistics */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Account Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {user.role === 'student' ? '0' : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role === 'student' ? 'Quizzes Completed' : 'Students Managed'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      0%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role === 'student' ? 'Hours Studied' : 'Quizzes Created'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Achievements
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                size="large"
              >
                Back to Home
              </Button>
              {user.role === 'student' && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/studentDashboard')}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              )}
              {user.role === 'teacher' && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/teacherDashboard')}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Teacher Dashboard
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;