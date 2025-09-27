import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Quiz,
  Lock,
  PlayArrow,
  CheckCircle
} from '@mui/icons-material';
import { isAuthenticated } from '../utils/auth';

const QuizPreviewPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const isLoggedIn = isAuthenticated();

  // Sample quiz data - will be fetched from backend later
  const categoryQuizzes = {
    'grade-5-scholarship': {
      title: 'Grade 5 Scholarship Quizzes',
      description: 'Practice quizzes to prepare for Grade 5 Scholarship examination',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      quizzes: [
        {
          id: 1,
          title: 'Mathematics - Basic Arithmetic',
          description: 'Test your knowledge of basic arithmetic operations',
          questions: 15,
          duration: '20 minutes',
          difficulty: 'Easy',
          attempts: isLoggedIn ? 3 : 0,
          bestScore: isLoggedIn ? 85 : null,
          completed: isLoggedIn ? true : false,
          subject: 'Mathematics'
        },
        {
          id: 2,
          title: 'English - Grammar Fundamentals',
          description: 'Practice essential grammar rules and sentence structure',
          questions: 12,
          duration: '15 minutes',
          difficulty: 'Easy',
          attempts: isLoggedIn ? 1 : 0,
          bestScore: isLoggedIn ? 92 : null,
          completed: isLoggedIn ? true : false,
          subject: 'English'
        },
        {
          id: 3,
          title: 'Environment Studies - Nature & Science',
          description: 'Explore basic environmental concepts and natural phenomena',
          questions: 10,
          duration: '15 minutes',
          difficulty: 'Medium',
          attempts: isLoggedIn ? 0 : 0,
          bestScore: null,
          completed: false,
          subject: 'Environment'
        },
        {
          id: 4,
          title: 'Mathematics - Problem Solving',
          description: 'Advanced arithmetic and logical reasoning problems',
          questions: 18,
          duration: '25 minutes',
          difficulty: 'Hard',
          attempts: isLoggedIn ? 0 : 0,
          bestScore: null,
          completed: false,
          subject: 'Mathematics'
        }
      ]
    },
    'gce-ol': {
      title: 'GCE O/L Quizzes',
      description: 'Comprehensive practice tests for GCE Ordinary Level subjects',
      color: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      quizzes: [
        {
          id: 5,
          title: 'Mathematics - Algebra Basics',
          description: 'Linear equations and algebraic expressions',
          questions: 20,
          duration: '30 minutes',
          difficulty: 'Medium',
          attempts: isLoggedIn ? 2 : 0,
          bestScore: isLoggedIn ? 78 : null,
          completed: isLoggedIn ? true : false,
          subject: 'Mathematics'
        },
        {
          id: 6,
          title: 'Science - Physics Fundamentals',
          description: 'Basic concepts of motion, force, and energy',
          questions: 25,
          duration: '35 minutes',
          difficulty: 'Medium',
          attempts: isLoggedIn ? 1 : 0,
          bestScore: isLoggedIn ? 88 : null,
          completed: isLoggedIn ? true : false,
          subject: 'Physics'
        },
        {
          id: 7,
          title: 'English - Literature Analysis',
          description: 'Understanding themes, characters, and literary devices',
          questions: 15,
          duration: '25 minutes',
          difficulty: 'Hard',
          attempts: isLoggedIn ? 0 : 0,
          bestScore: null,
          completed: false,
          subject: 'English'
        }
      ]
    },
    'gce-al': {
      title: 'GCE A/L Quizzes',
      description: 'Advanced level preparation quizzes for university entrance',
      color: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      quizzes: [
        {
          id: 8,
          title: 'Mathematics - Calculus',
          description: 'Differentiation and integration problems',
          questions: 30,
          duration: '45 minutes',
          difficulty: 'Hard',
          attempts: isLoggedIn ? 1 : 0,
          bestScore: isLoggedIn ? 72 : null,
          completed: isLoggedIn ? true : false,
          subject: 'Mathematics'
        },
        {
          id: 9,
          title: 'Physics - Mechanics',
          description: 'Advanced mechanics and motion analysis',
          questions: 25,
          duration: '40 minutes',
          difficulty: 'Hard',
          attempts: isLoggedIn ? 0 : 0,
          bestScore: null,
          completed: false,
          subject: 'Physics'
        }
      ]
    }
  };

  const category = categoryQuizzes[categoryId];

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, pt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Category Not Found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  const handleQuizStart = (quiz) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      return;
    }
    // Navigate to quiz taking page
    navigate(`/quiz/${quiz.id}`);
  };

  const handleLoginRedirect = () => {
    setLoginDialogOpen(false);
    navigate('/login', { state: { returnTo: `/category/${categoryId}` } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f1419', color: 'white' }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: category.color,
          pt: 8,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ color: 'white', mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">Back to Home</Typography>
          </Box>
          
          <Box textAlign="center">
            <Quiz sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              {category.title}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              {category.description}
            </Typography>
            {!isLoggedIn && (
              <Alert severity="info" sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
                Please log in to participate in quizzes and track your progress!
              </Alert>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Quiz Statistics (Only for logged-in users) */}
        {isLoggedIn && (
          <Paper 
            sx={{ 
              bgcolor: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.1)',
              p: 4,
              mb: 6,
              borderRadius: 3
            }}
          >
            <Typography variant="h5" mb={3} color="white">
              Your Progress
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="#4facfe" fontWeight="bold">
                    {category.quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Total Attempts
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="#4caf50" fontWeight="bold">
                    {category.quizzes.filter(quiz => quiz.completed).length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Completed Quizzes
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="#ff9800" fontWeight="bold">
                    {Math.round(category.quizzes.reduce((sum, quiz) => sum + (quiz.bestScore || 0), 0) / category.quizzes.filter(quiz => quiz.bestScore).length) || 0}%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Average Score
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="#e91e63" fontWeight="bold">
                    {Math.round((category.quizzes.filter(quiz => quiz.completed).length / category.quizzes.length) * 100)}%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Completion Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Quizzes Grid */}
        <Typography variant="h4" textAlign="center" mb={4}>
          Available Practice Quizzes
        </Typography>
        
        <Grid container spacing={4}>
          {category.quizzes.map((quiz) => (
            <Grid item xs={12} md={6} lg={4} key={quiz.id}>
              <Card 
                sx={{ 
                  bgcolor: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                {/* Status Badge */}
                {quiz.completed && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: '#4caf50',
                      color: 'white',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 20 }} />
                  </Box>
                )}
                
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Subject Tag */}
                  <Box 
                    sx={{ 
                      bgcolor: getDifficultyColor(quiz.difficulty),
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                      mb: 2
                    }}
                  >
                    {quiz.subject} • {quiz.difficulty}
                  </Box>

                  <Typography variant="h6" color="white" mb={1} fontWeight="bold">
                    {quiz.title}
                  </Typography>
                  
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2} flex={1}>
                    {quiz.description}
                  </Typography>

                  {/* Quiz Details */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Questions: {quiz.questions}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Duration: {quiz.duration}
                      </Typography>
                    </Box>
                    
                    {isLoggedIn && (
                      <Box>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          Attempts: {quiz.attempts}
                        </Typography>
                        {quiz.bestScore && (
                          <Typography variant="body2" color="#4caf50">
                            Best Score: {quiz.bestScore}%
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleQuizStart(quiz)}
                    startIcon={isLoggedIn ? <PlayArrow /> : <Lock />}
                    sx={{
                      bgcolor: isLoggedIn ? '#4facfe' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: isLoggedIn ? '#3182ce' : 'rgba(255,255,255,0.2)' 
                      },
                      mt: 'auto'
                    }}
                  >
                    {isLoggedIn ? 'Start Quiz' : 'Login to Participate'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Paper 
          sx={{ 
            background: category.color,
            p: 6,
            textAlign: 'center',
            mt: 6,
            borderRadius: 3
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Ready to Test Your Knowledge?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            {isLoggedIn 
              ? 'Continue your learning journey with our comprehensive quiz system'
              : 'Create an account to track your progress and compete with other students'
            }
          </Typography>
          {!isLoggedIn && (
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                px: 4,
                py: 1.5
              }}
              onClick={() => navigate('/login')}
            >
              Create Account / Login
            </Button>
          )}
        </Paper>
      </Container>

      {/* Login Required Dialog */}
      <Dialog 
        open={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1f2e',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Lock color="warning" />
            Login Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            You need to be logged in to participate in quizzes and track your progress.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            Benefits of creating an account:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="rgba(255,255,255,0.7)">
              Track your quiz scores and progress
            </Typography>
            <Typography component="li" variant="body2" color="rgba(255,255,255,0.7)">
              Compete with other students
            </Typography>
            <Typography component="li" variant="body2" color="rgba(255,255,255,0.7)">
              Access personalized learning recommendations
            </Typography>
            <Typography component="li" variant="body2" color="rgba(255,255,255,0.7)">
              Save your favorite quizzes
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLoginDialogOpen(false)}
            color="inherit"
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleLoginRedirect}
            variant="contained"
            sx={{
              bgcolor: '#4facfe',
              '&:hover': { bgcolor: '#3182ce' }
            }}
          >
            Login / Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizPreviewPage;