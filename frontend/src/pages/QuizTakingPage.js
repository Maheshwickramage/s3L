import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  NavigateNext,
  NavigateBefore,
  Quiz as QuizIcon,
  EmojiEvents,
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { isAuthenticated } from '../utils/auth';

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sample quiz data - will be fetched from backend later
  const quizData = useMemo(() => ({
    1: {
      id: 1,
      title: 'Mathematics - Basic Arithmetic',
      description: 'Test your knowledge of basic arithmetic operations',
      duration: 20 * 60, // 20 minutes in seconds
      category: 'grade-5-scholarship',
      subject: 'Mathematics',
      difficulty: 'Easy',
      questions: [
        {
          id: 1,
          question: 'What is 25 + 37?',
          options: ['52', '62', '72', '82'],
          correctAnswer: 1,
          explanation: '25 + 37 = 62. Add the units: 5 + 7 = 12 (write 2, carry 1). Add the tens: 2 + 3 + 1 = 6.'
        },
        {
          id: 2,
          question: 'Which number comes next in the sequence: 2, 4, 6, 8, ___?',
          options: ['9', '10', '11', '12'],
          correctAnswer: 1,
          explanation: 'This is a sequence of even numbers. Each number increases by 2, so 8 + 2 = 10.'
        },
        {
          id: 3,
          question: 'What is 144 ÷ 12?',
          options: ['10', '11', '12', '13'],
          correctAnswer: 2,
          explanation: '144 ÷ 12 = 12. You can think of it as "12 times what equals 144?" The answer is 12.'
        },
        {
          id: 4,
          question: 'If Sarah has 3 boxes with 8 chocolates in each box, how many chocolates does she have in total?',
          options: ['21', '24', '27', '32'],
          correctAnswer: 1,
          explanation: '3 boxes × 8 chocolates = 24 chocolates in total.'
        },
        {
          id: 5,
          question: 'What fraction is equivalent to 0.5?',
          options: ['1/4', '1/2', '1/3', '2/3'],
          correctAnswer: 1,
          explanation: '0.5 means 5 out of 10, which simplifies to 1/2 when you divide both numerator and denominator by 5.'
        }
      ]
    },
    2: {
      id: 2,
      title: 'English - Grammar Fundamentals',
      description: 'Practice essential grammar rules and sentence structure',
      duration: 15 * 60, // 15 minutes in seconds
      category: 'grade-5-scholarship',
      subject: 'English',
      difficulty: 'Easy',
      questions: [
        {
          id: 1,
          question: 'Which sentence is grammatically correct?',
          options: [
            'The cat are sleeping on the mat.',
            'The cat is sleeping on the mat.',
            'The cat am sleeping on the mat.',
            'The cat were sleeping on the mat.'
          ],
          correctAnswer: 1,
          explanation: '"Cat" is singular, so we use the singular verb "is". The correct sentence is "The cat is sleeping on the mat."'
        },
        {
          id: 2,
          question: 'What type of word is "quickly" in the sentence: "She ran quickly to school"?',
          options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          correctAnswer: 3,
          explanation: '"Quickly" describes how she ran, making it an adverb. Adverbs often end in -ly and describe verbs.'
        },
        {
          id: 3,
          question: 'Choose the correct plural form of "child":',
          options: ['childs', 'childes', 'children', 'childrens'],
          correctAnswer: 2,
          explanation: '"Children" is the irregular plural form of "child". Not all nouns follow the standard -s or -es rule.'
        }
      ]
    }
    // Add more quizzes as needed
  }), []);

  // Initialize quiz
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }

    const selectedQuiz = quizData[quizId];
    if (selectedQuiz) {
      setQuiz(selectedQuiz);
      setTimeRemaining(selectedQuiz.duration);
    }
    setLoading(false);
  }, [quizId, isLoggedIn, navigate, location.pathname, quizData]);

  // Handle quiz submission and calculate score
  const handleQuizSubmit = React.useCallback(() => {
    setQuizCompleted(true);
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(percentage);
    setShowResults(true);
    
    // Save quiz attempt to localStorage (temporary - will use backend later)
    const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
    const attemptKey = `quiz_${quizId}`;
    if (!quizAttempts[attemptKey]) {
      quizAttempts[attemptKey] = [];
    }
    quizAttempts[attemptKey].push({
      date: new Date().toISOString(),
      score: percentage,
      answers: answers,
      timeSpent: quiz.duration - timeRemaining
    });
    localStorage.setItem('quizAttempts', JSON.stringify(quizAttempts));
  }, [answers, quiz, quizId, timeRemaining]);

  // Timer
  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeRemaining, handleQuizSubmit]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent! Outstanding performance!';
    if (score >= 80) return 'Great job! Very good understanding!';
    if (score >= 70) return 'Good work! You\'re on the right track!';
    if (score >= 60) return 'Fair performance. Keep practicing!';
    return 'Keep studying and try again. You can do better!';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0f1419">
        <CircularProgress />
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, pt: 4, bgcolor: '#0f1419', minHeight: '100vh' }}>
        <Box textAlign="center">
          <Typography variant="h4" color="white" gutterBottom>
            Quiz Not Found
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f1419', color: 'white' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: 'white' }}
          >
            Back
          </Button>
          
          {quizStarted && !quizCompleted && (
            <Paper 
              sx={{ 
                bgcolor: '#1a1f2e',
                border: '1px solid rgba(255,255,255,0.1)',
                px: 3,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AccessTime color={timeRemaining < 300 ? 'error' : 'inherit'} />
              <Typography 
                variant="h6" 
                color={timeRemaining < 300 ? '#f44336' : 'white'}
                fontWeight="bold"
              >
                {formatTime(timeRemaining)}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Quiz Start Screen */}
        {!quizStarted && (
          <Paper 
            sx={{ 
              bgcolor: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.1)',
              p: 6,
              textAlign: 'center',
              borderRadius: 3
            }}
          >
            <QuizIcon sx={{ fontSize: 80, color: '#4facfe', mb: 3 }} />
            
            <Typography variant="h3" fontWeight="bold" mb={2}>
              {quiz.title}
            </Typography>
            
            <Typography variant="h6" color="rgba(255,255,255,0.7)" mb={4}>
              {quiz.description}
            </Typography>

            <Grid container spacing={4} justifyContent="center" mb={4}>
              <Grid item>
                <Box textAlign="center">
                  <Typography variant="h4" color="#4facfe" fontWeight="bold">
                    {quiz.questions.length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Questions
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item>
                <Box textAlign="center">
                  <Typography variant="h4" color="#ff9800" fontWeight="bold">
                    {Math.floor(quiz.duration / 60)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Minutes
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item>
                <Box textAlign="center">
                  <Chip 
                    label={quiz.difficulty}
                    sx={{
                      bgcolor: quiz.difficulty === 'Easy' ? '#4caf50' : 
                               quiz.difficulty === 'Medium' ? '#ff9800' : '#f44336',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body1" fontWeight="bold" mb={1}>
                Quiz Instructions:
              </Typography>
              <Typography component="ul" sx={{ pl: 2, textAlign: 'left' }}>
                <li>Read each question carefully</li>
                <li>Select the best answer from the given options</li>
                <li>You can navigate between questions using the navigation buttons</li>
                <li>Submit your quiz before time runs out</li>
                <li>You will see your results immediately after submission</li>
              </Typography>
            </Alert>

            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
              sx={{
                bgcolor: '#4facfe',
                '&:hover': { bgcolor: '#3182ce' },
                px: 6,
                py: 2,
                fontSize: '1.2rem'
              }}
            >
              Start Quiz
            </Button>
          </Paper>
        )}

        {/* Quiz Taking Screen */}
        {quizStarted && !showResults && (
          <>
            {/* Progress Bar */}
            <Paper 
              sx={{ 
                bgcolor: '#1a1f2e',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 3,
                mb: 4,
                borderRadius: 3
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}% Complete
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={((currentQuestion + 1) / quiz.questions.length) * 100}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#4facfe'
                  }
                }}
              />
            </Paper>

            {/* Current Question */}
            <Paper 
              sx={{ 
                bgcolor: '#1a1f2e',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 4,
                mb: 4,
                borderRadius: 3
              }}
            >
              <Typography variant="h5" mb={4} fontWeight="bold">
                {quiz.questions[currentQuestion].question}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[quiz.questions[currentQuestion].id] ?? ''}
                  onChange={(e) => handleAnswerChange(
                    quiz.questions[currentQuestion].id, 
                    parseInt(e.target.value)
                  )}
                >
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={
                        <Radio 
                          sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            '&.Mui-checked': { color: '#4facfe' }
                          }} 
                        />
                      }
                      label={
                        <Typography variant="body1" sx={{ py: 1 }}>
                          {option}
                        </Typography>
                      }
                      sx={{
                        bgcolor: answers[quiz.questions[currentQuestion].id] === index 
                          ? 'rgba(79, 172, 254, 0.1)' 
                          : 'transparent',
                        borderRadius: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: answers[quiz.questions[currentQuestion].id] === index 
                          ? '#4facfe' 
                          : 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(79, 172, 254, 0.05)'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                startIcon={<NavigateBefore />}
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': { borderColor: '#4facfe' }
                }}
              >
                Previous
              </Button>

              <Box display="flex" gap={2}>
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleQuizSubmit}
                    sx={{
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' },
                      px: 4
                    }}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    endIcon={<NavigateNext />}
                    sx={{
                      bgcolor: '#4facfe',
                      '&:hover': { bgcolor: '#3182ce' }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Results Screen */}
        {showResults && (
          <Paper 
            sx={{ 
              bgcolor: '#1a1f2e',
              border: '1px solid rgba(255,255,255,0.1)',
              p: 6,
              textAlign: 'center',
              borderRadius: 3
            }}
          >
            <EmojiEvents 
              sx={{ 
                fontSize: 80, 
                color: getScoreColor(score), 
                mb: 3 
              }} 
            />
            
            <Typography variant="h3" fontWeight="bold" mb={2}>
              Quiz Completed!
            </Typography>
            
            <Typography 
              variant="h2" 
              color={getScoreColor(score)}
              fontWeight="bold"
              mb={2}
            >
              {score}%
            </Typography>
            
            <Typography variant="h5" color="rgba(255,255,255,0.8)" mb={4}>
              {getScoreMessage(score)}
            </Typography>

            {/* Detailed Results */}
            <Grid container spacing={4} justifyContent="center" mb={6}>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="h4" color="#4caf50" fontWeight="bold">
                    {quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Correct
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="h4" color="#f44336" fontWeight="bold">
                    {quiz.questions.filter(q => answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined).length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Incorrect
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="h4" color="#ff9800" fontWeight="bold">
                    {quiz.questions.filter(q => answers[q.id] === undefined).length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Unanswered
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="h4" color="#9c27b0" fontWeight="bold">
                    {formatTime(quiz.duration - timeRemaining)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Time Taken
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': { borderColor: '#4facfe' }
                }}
              >
                Back to Quizzes
              </Button>
              
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                startIcon={<Refresh />}
                sx={{
                  bgcolor: '#4facfe',
                  '&:hover': { bgcolor: '#3182ce' }
                }}
              >
                Take Again
              </Button>
              
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                startIcon={<TrendingUp />}
                sx={{
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' }
                }}
              >
                View Dashboard
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default QuizTakingPage;