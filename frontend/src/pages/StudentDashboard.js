
import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Typography, Paper, Card, CardContent, Avatar, Grid, 
  Alert, Snackbar, LinearProgress, Chip, Stack
} from '@mui/material';
import { 
  Quiz as QuizIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  PersonOutline as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { authenticatedFetch } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalClasses: 0,
    rank: 0,
    recentQuizzes: [],
    weeklyProgress: [],
    achievements: [],
    enrolledClasses: []
  });
  const [quizHistory, setQuizHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading student analytics for user:', user);
        
        // Load student analytics
        const analyticsRes = await authenticatedFetch('http://98.84.104.233:5050/api/student/analytics');
        console.log('Analytics response status:', analyticsRes.status);
        
        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          console.log('Analytics data received:', analytics);
          setStudentData(prev => ({ ...prev, ...analytics }));
        } else {
          const errorText = await analyticsRes.text();
          console.error('Analytics API error:', errorText);
        }

        // Load quiz history
        const historyRes = await authenticatedFetch('http://98.84.104.233:5050/api/student/quiz-history');
        console.log('Quiz history response status:', historyRes.status);
        
        if (historyRes.ok) {
          const history = await historyRes.json();
          console.log('Quiz history data received:', history);
          setQuizHistory(Array.isArray(history) ? history : []);
        } else {
          const errorText = await historyRes.text();
          console.error('Quiz history API error:', errorText);
        }

      } catch (error) {
        console.error('Error loading student analytics:', error);
        showSnackbar('Error loading analytics data', 'error');
      }
    };
    
    loadData();
  }, [user]);

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  const getPerformanceBadge = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { label: 'Excellent', color: 'success' };
    if (percentage >= 80) return { label: 'Very Good', color: 'info' };
    if (percentage >= 70) return { label: 'Good', color: 'warning' };
    if (percentage >= 60) return { label: 'Fair', color: 'default' };
    return { label: 'Needs Improvement', color: 'error' };
  };

  // Analytics Cards Component
  const AnalyticsCard = ({ title, value, subtitle, icon, color, progress }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        {progress !== undefined && (
          <Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': { bgcolor: color }
              }} 
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {progress.toFixed(1)}% Complete
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1400, margin: 'auto', padding: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#2d3436', mb: 1 }}>
            Welcome back, {user.name}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your learning journey continues here
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              height: 'fit-content',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Back to Home
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={onLogout}
            sx={{ height: 'fit-content' }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Analytics Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Quizzes Completed"
            value={studentData.completedQuizzes}
            subtitle={`out of ${studentData.totalQuizzes} available`}
            icon={<QuizIcon />}
            color="#6c5ce7"
            progress={(studentData.completedQuizzes / Math.max(studentData.totalQuizzes, 1)) * 100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Average Score"
            value={`${studentData.averageScore}%`}
            subtitle="Overall performance"
            icon={<TrendingUpIcon />}
            color="#00b894"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Class Rank"
            value={studentData.rank > 0 ? `#${studentData.rank}` : 'N/A'}
            subtitle="Current position"
            icon={<TrophyIcon />}
            color="#fdcb6e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Enrolled Classes"
            value={studentData.totalClasses}
            subtitle="Active enrollments"
            icon={<ClassIcon />}
            color="#e17055"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Quiz History */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ color: '#0984e3', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Quiz Performance
                </Typography>
              </Box>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {quizHistory.length > 0 ? (
                  <Stack spacing={2}>
                    {quizHistory.slice(0, 8).map((quiz, index) => {
                      const badge = getPerformanceBadge(quiz.score, quiz.total_marks);
                      return (
                        <Paper 
                          key={index} 
                          sx={{ 
                            p: 3, 
                            border: '1px solid #e0e6ed',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {quiz.quiz_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {quiz.subject} • {new Date(quiz.submitted_at).toLocaleDateString()}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700,
                                    color: getScoreColor(quiz.score, quiz.total_marks)
                                  }}
                                >
                                  {quiz.score}/{quiz.total_marks}
                                </Typography>
                                <Chip 
                                  label={badge.label} 
                                  color={badge.color} 
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'center', ml: 2 }}>
                              <Typography variant="h4" sx={{ 
                                fontWeight: 700,
                                color: getScoreColor(quiz.score, quiz.total_marks)
                              }}>
                                {Math.round((quiz.score / quiz.total_marks) * 100)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Score
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No quiz history yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start taking quizzes to see your performance here
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Summary & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Progress Summary */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SpeedIcon sx={{ color: '#6c5ce7', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Progress Summary
                  </Typography>
                </Box>
                
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Quiz Completion</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {Math.round((studentData.completedQuizzes / Math.max(studentData.totalQuizzes, 1)) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(studentData.completedQuizzes / Math.max(studentData.totalQuizzes, 1)) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Performance Goal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {studentData.averageScore}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={studentData.averageScore}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <StarIcon sx={{ color: '#fdcb6e', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Achievements
                  </Typography>
                </Box>
                
                {studentData.achievements?.length > 0 ? (
                  <Stack spacing={2}>
                    {studentData.achievements.map((achievement, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrophyIcon sx={{ color: '#fdcb6e', mr: 2 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {achievement.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {achievement.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <TrophyIcon sx={{ fontSize: 48, color: '#ddd', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Complete quizzes to earn achievements!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<HomeIcon />}
                    sx={{ 
                      justifyContent: 'flex-start',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                    onClick={() => navigate('/')}
                  >
                    Browse All Quizzes
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<QuizIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Quick Quiz
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<SchoolIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Browse Subjects
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<PersonIcon />}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    View Profile
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentDashboard;
