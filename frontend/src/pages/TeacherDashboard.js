import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import './TeacherDashboard.css';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  Container,
  Fade,
  Slide,
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Transition component for modals
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TeacherDashboard() {
  // State management
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal states
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [createQuizModal, setCreateQuizModal] = useState(false);
  const [editQuizModal, setEditQuizModal] = useState(false);
  const [viewStudentsModal, setViewStudentsModal] = useState(false);
  const [viewQuizzesModal, setViewQuizzesModal] = useState(false);
  const [viewLeaderboardModal, setViewLeaderboardModal] = useState(false);
  const [viewResultsModal, setViewResultsModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);

  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', email: '', class: '' });
  const [quizForm, setQuizForm] = useState({ title: '' });
  const [editQuizData, setEditQuizData] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editQuestions, setEditQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuizId, setNewQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    marks: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  // Snackbar handler
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, leaderboardRes, quizzesRes, resultsRes] = await Promise.all([
        fetch('http://localhost:5050/api/teacher/students'),
        fetch('http://localhost:5050/api/teacher/leaderboard'),
        fetch('http://localhost:5050/api/teacher/quizzes'),
        fetch('http://localhost:5050/api/teacher/results')
      ]);

      const [studentsData, leaderboardData, quizzesData, resultsData] = await Promise.all([
        studentsRes.json(),
        leaderboardRes.json(),
        quizzesRes.json(),
        resultsRes.json()
      ]);

      setStudents(studentsData);
      setLeaderboard(leaderboardData);
      setQuizzes(quizzesData);
      setResults(resultsData);
    } catch (error) {
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Student management
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentForm, teacher_id: 1 })
      });
      
      if (res.ok) {
        const newStudent = await res.json();
        setStudents([...students, newStudent]);
        setStudentForm({ name: '', email: '', class: '' });
        setAddStudentModal(false);
        showSnackbar('Student added successfully!');
      } else {
        showSnackbar('Error adding student', 'error');
      }
    } catch (error) {
      showSnackbar('Error adding student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5050/api/teacher/students/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setStudents(students.filter(student => student.id !== id));
        showSnackbar('Student deleted successfully!');
      } else {
        showSnackbar('Error deleting student', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting student', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quiz management
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/teacher/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: quizForm.title, teacher_id: 1 })
      });
      
      if (res.ok) {
        const quiz = await res.json();
        setQuizForm({ title: '' });
        setCreateQuizModal(false);
        setNewQuizId(quiz.id);
        setShowQuestionModal(true);
        setQuestions([]);
        setCurrentQuestion({
          question_text: '',
          marks: 1,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        });
        loadData();
        showSnackbar('Quiz created! Now add questions.');
      } else {
        showSnackbar('Error creating quiz', 'error');
      }
    } catch (error) {
      showSnackbar('Error creating quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        showSnackbar('Quiz deleted successfully!');
      } else {
        showSnackbar('Error deleting quiz', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quiz) => {
    try {
      const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${quiz.id}/full`);
      if (res.ok) {
        const quizData = await res.json();
        setEditQuizData(quizData);
        setEditTitle(quizData.title || '');
        setEditQuestions(quizData.questions || []);
        setEditQuizModal(true);
      }
    } catch (error) {
      showSnackbar('Error loading quiz details', 'error');
    }
  };

  const handleSaveQuizEdit = async () => {
    setLoading(true);
    try {
      // Update quiz title
      await fetch(`http://localhost:5050/api/teacher/quizzes/${editQuizData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      
      // Update each question
      for (const q of editQuestions) {
        await fetch(`http://localhost:5050/api/teacher/quizzes/${editQuizData.id}/questions/${q.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_text: q.question_text, marks: q.marks, options: q.options })
        });
      }
      
      setEditQuizModal(false);
      setEditQuizData(null);
      loadData();
      showSnackbar('Quiz updated successfully!');
    } catch (error) {
      showSnackbar('Error updating quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Question management
  const handleAddQuestion = () => {
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question_text: '',
      marks: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    });
  };

  const handleFinishQuiz = async () => {
    setLoading(true);
    try {
      const allQuestions = currentQuestion.question_text.trim() ? [...questions, currentQuestion] : questions;
      const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${newQuizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: allQuestions })
      });
      
      if (res.ok) {
        setShowQuestionModal(false);
        setNewQuizId(null);
        setQuestions([]);
        setCurrentQuestion({
          question_text: '',
          marks: 1,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        });
        loadData();
        showSnackbar('Quiz completed successfully!');
      } else {
        showSnackbar('Error saving quiz questions', 'error');
      }
    } catch (error) {
      showSnackbar('Error saving quiz questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Feature cards data
  const featureCards = [
    {
      title: 'Manage Students',
      description: 'Add, view, and manage your students',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      onClick: () => setViewStudentsModal(true),
      stats: students.length
    },
    {
      title: 'Create Quiz',
      description: 'Create interactive quizzes with questions',
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      onClick: () => setCreateQuizModal(true),
      stats: quizzes.length
    },
    {
      title: 'View Quizzes',
      description: 'Edit and manage existing quizzes',
      icon: <EditIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      onClick: () => setViewQuizzesModal(true),
      stats: quizzes.length
    },
    {
      title: 'Leaderboard',
      description: 'View student performance rankings',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      onClick: () => setViewLeaderboardModal(true),
      stats: leaderboard.length
    },
    {
      title: 'Quiz Results',
      description: 'Detailed analysis of quiz results',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      onClick: () => setViewResultsModal(true),
      stats: results.length
    },
    {
      title: 'Chat',
      description: 'Communicate with students',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      color: '#455a64',
      onClick: () => setChatModal(true),
      stats: 'Live'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teacher Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setAddStudentModal(true)}
            sx={{ mr: 1 }}
          >
            Add Student
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={0} className="welcome-section fade-in-up" sx={{ p: 3, mb: 4, color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Your Teaching Hub
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage students, create quizzes, and track progress all in one place
          </Typography>
        </Paper>

        {/* Feature Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {featureCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  className="feature-card interactive-card"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onClick={card.onClick}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        backgroundColor: card.color,
                        color: 'white'
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {card.description}
                    </Typography>
                    <Chip
                      label={`${card.stats} ${typeof card.stats === 'number' ? 'items' : ''}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} className="stats-card slide-in-right" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {students.length}
              </Typography>
              <Typography variant="h6">Total Students</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} className="stats-card slide-in-right" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary" gutterBottom>
                {quizzes.length}
              </Typography>
              <Typography variant="h6">Active Quizzes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} className="stats-card slide-in-right" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {results.length}
              </Typography>
              <Typography variant="h6">Quiz Attempts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} className="stats-card slide-in-right" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {leaderboard.length}
              </Typography>
              <Typography variant="h6">Leaderboard Entries</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Add Student Modal */}
      <Dialog
        open={addStudentModal}
        onClose={() => setAddStudentModal(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ mr: 1 }} />
            Add New Student
          </Box>
        </DialogTitle>
        <form onSubmit={handleAddStudent}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Student Name"
              fullWidth
              variant="outlined"
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Class"
              fullWidth
              variant="outlined"
              value={studentForm.class}
              onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddStudentModal(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading} className="action-button">
              {loading ? <CircularProgress size={20} /> : 'Add Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Quiz Modal */}
      <Dialog
        open={createQuizModal}
        onClose={() => setCreateQuizModal(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <QuizIcon sx={{ mr: 1 }} />
            Create New Quiz
          </Box>
        </DialogTitle>
        <form onSubmit={handleCreateQuiz}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Quiz Title"
              fullWidth
              variant="outlined"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateQuizModal(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Create Quiz'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Students Modal */}
      <Dialog
        open={viewStudentsModal}
        onClose={() => setViewStudentsModal(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PeopleIcon sx={{ mr: 1 }} />
              Manage Students ({students.length})
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setViewStudentsModal(false);
                setAddStudentModal(true);
              }}
            >
              Add Student
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {students.map((student, index) => (
              <React.Fragment key={student.id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteStudent(student.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={student.name}
                    secondary={`${student.email} • Class: ${student.class}`}
                  />
                </ListItem>
                {index < students.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewStudentsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Quizzes Modal */}
      <Dialog
        open={viewQuizzesModal}
        onClose={() => setViewQuizzesModal(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <QuizIcon sx={{ mr: 1 }} />
              Manage Quizzes ({quizzes.length})
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setViewQuizzesModal(false);
                setCreateQuizModal(true);
              }}
            >
              Create Quiz
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {quizzes.map((quiz, index) => (
              <React.Fragment key={quiz.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditQuiz(quiz)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={quiz.title} />
                </ListItem>
                {index < quizzes.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewQuizzesModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Leaderboard Modal */}
      <Dialog
        open={viewLeaderboardModal}
        onClose={() => setViewLeaderboardModal(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Leaderboard ({leaderboard.length} entries)
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {leaderboard.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`${index + 1}. ${entry.name}`}
                    secondary={`Score: ${entry.score}`}
                  />
                </ListItem>
                {index < leaderboard.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLeaderboardModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Results Modal */}
      <Dialog
        open={viewResultsModal}
        onClose={() => setViewResultsModal(false)}
        TransitionComponent={Transition}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AssessmentIcon sx={{ mr: 1 }} />
            Quiz Results ({results.length} attempts)
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Quiz Name</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.student_name}</TableCell>
                    <TableCell>{result.quiz_name}</TableCell>
                    <TableCell>{result.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewResultsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Chat Modal */}
      <Dialog
        open={chatModal}
        onClose={() => setChatModal(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <ChatIcon sx={{ mr: 1 }} />
              Chat
            </Box>
            <IconButton onClick={() => setChatModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Chat user={{ username: 'teacher1' }} />
        </DialogContent>
      </Dialog>

      {/* Question Modal */}
      <Dialog
        open={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Questions to Quiz</DialogTitle>
        <DialogContent>
          <TextField
            label="Question Text"
            variant="outlined"
            fullWidth
            value={currentQuestion.question_text}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Marks"
            type="number"
            variant="outlined"
            value={currentQuestion.marks}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>Options</Typography>
          {currentQuestion.options.map((opt, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                label={`Option ${idx + 1}`}
                variant="outlined"
                value={opt.option_text}
                onChange={(e) => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[idx].option_text = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                }}
                sx={{ mr: 2, flexGrow: 1 }}
              />
              <Button
                variant={opt.is_correct ? "contained" : "outlined"}
                color={opt.is_correct ? "success" : "primary"}
                onClick={() => {
                  const newOptions = currentQuestion.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                }}
              >
                Correct
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionModal(false)}>Cancel</Button>
          <Button onClick={handleAddQuestion} variant="outlined">
            Add Another Question
          </Button>
          <Button onClick={handleFinishQuiz} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Finish & Save Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Quiz Modal */}
      <Dialog
        open={editQuizModal}
        onClose={() => setEditQuizModal(false)}
        TransitionComponent={Transition}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Quiz</DialogTitle>
        <DialogContent>
          <TextField
            label="Quiz Title"
            variant="outlined"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>Questions</Typography>
          {editQuestions.map((q, idx) => (
            <Box key={q.id} sx={{ mb: 2, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
              <TextField
                label={`Question ${idx + 1}`}
                variant="outlined"
                fullWidth
                value={q.question_text}
                onChange={(e) => {
                  const newQuestions = [...editQuestions];
                  newQuestions[idx].question_text = e.target.value;
                  setEditQuestions(newQuestions);
                }}
                sx={{ mb: 1 }}
              />
              <TextField
                label="Marks"
                type="number"
                variant="outlined"
                value={q.marks}
                onChange={(e) => {
                  const newQuestions = [...editQuestions];
                  newQuestions[idx].marks = parseInt(e.target.value);
                  setEditQuestions(newQuestions);
                }}
                sx={{ mb: 1 }}
              />
              <Typography variant="subtitle2">Options</Typography>
              {q.options.map((opt, oidx) => (
                <Box key={opt.id || oidx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label={`Option ${oidx + 1}`}
                    variant="outlined"
                    value={opt.option_text}
                    onChange={(e) => {
                      const newQuestions = [...editQuestions];
                      newQuestions[idx].options[oidx].option_text = e.target.value;
                      setEditQuestions(newQuestions);
                    }}
                    sx={{ mr: 2, flexGrow: 1 }}
                  />
                  <Button
                    variant={opt.is_correct ? "contained" : "outlined"}
                    color={opt.is_correct ? "success" : "primary"}
                    onClick={() => {
                      const newQuestions = [...editQuestions];
                      newQuestions[idx].options = newQuestions[idx].options.map((o, i) => ({ ...o, is_correct: i === oidx }));
                      setEditQuestions(newQuestions);
                    }}
                  >
                    Correct
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditQuizModal(false)}>Cancel</Button>
          <Button onClick={handleSaveQuizEdit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        className="loading-overlay"
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Processing...
          </Typography>
        </Box>
      </Backdrop>

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

export default TeacherDashboard;
