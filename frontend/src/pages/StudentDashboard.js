
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider, Radio, RadioGroup, FormControlLabel, TextField, IconButton, Card, CardContent, CardActions, Avatar, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import { Send as SendIcon, Download as DownloadIcon, AttachFile as AttachFileIcon, Chat as ChatIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { authenticatedFetch } from '../utils/auth';

function StudentDashboard({ user, onLogout }) {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadData = async () => {
    console.log('Loading student data for user:', user);
    
    try {
      // Load quizzes
      const quizzesRes = await authenticatedFetch('http://localhost:5050/api/student/quizzes');
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        console.log('Quizzes data:', quizzesData);
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      } else {
        console.error('Error loading quizzes:', quizzesRes.status);
        showSnackbar('Error loading quizzes', 'error');
      }
      
      // Load leaderboard
      const leaderboardRes = await authenticatedFetch('http://localhost:5050/api/student/leaderboard');
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        console.log('Leaderboard data:', leaderboardData);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      } else {
        console.error('Error loading leaderboard:', leaderboardRes.status);
        showSnackbar('Error loading leaderboard', 'error');
      }

      // Load chat messages
      const chatRes = await authenticatedFetch('http://localhost:5050/api/student/chat');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        console.log('Chat data:', chatData);
        setChatMessages(Array.isArray(chatData) ? chatData : []);
      } else {
        console.error('Error loading chat:', chatRes.status);
        showSnackbar('Error loading chat', 'error');
      }

      // Load files
      const filesRes = await authenticatedFetch('http://localhost:5050/api/student/files');
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        console.log('Files data:', filesData);
        setFiles(Array.isArray(filesData) ? filesData : []);
      } else {
        console.error('Error loading files:', filesRes.status);
        showSnackbar('Error loading files', 'error');
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      showSnackbar('Error loading data', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [user.class_id]);


  const handleStartQuiz = async () => {
    const res = await authenticatedFetch(`http://localhost:5050/api/student/quizzes/${selectedQuiz}/full`);
    if (res.ok) {
      const data = await res.json();
      setQuizData(data);
      setStarted(true);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmitQuiz = async () => {
    const res = await authenticatedFetch(`http://localhost:5050/api/student/quizzes/${quizData.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    
    if (res.ok) {
      const data = await res.json();
      setResult(data.score);
      setSubmitted(true);
      
      // Refresh leaderboard
      loadData();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const res = await authenticatedFetch('http://localhost:5050/api/student/chat', {
      method: 'POST',
      body: JSON.stringify({ message: newMessage.trim() })
    });
    
    if (res.ok) {
      setNewMessage('');
      loadData(); // Refresh chat messages
      showSnackbar('Message sent successfully!');
    } else {
      showSnackbar('Failed to send message', 'error');
    }
  };

  const handleDownloadFile = (file) => {
    // In a real application, this would download the actual file
    showSnackbar(`Downloading ${file.original_name}...`);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#2d3436' }}>Student Dashboard</Typography>
        <Button variant="outlined" color="error" onClick={onLogout}>
          Logout
        </Button>
      </Box>
      
      <Paper elevation={4} sx={{ padding: 2, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
          <Tab label="Quizzes" icon={<DescriptionIcon />} />
          <Tab label="Leaderboard" icon={<ChatIcon />} />
          <Tab label="Chat with Teacher" icon={<ChatIcon />} />
          <Tab label="Class Files" icon={<AttachFileIcon />} />
        </Tabs>
      </Paper>

      {/* Quizzes Tab */}
      {tabValue === 0 && (
        <Paper elevation={4} sx={{ padding: 4, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#0984e3' }}>Available Quizzes</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {(Array.isArray(quizzes) && quizzes.length > 0) ? quizzes.map(q => (
            <Paper key={q.id} elevation={2} sx={{ p: 2, minWidth: 200, flex: '1 1 220px', bgcolor: selectedQuiz === q.id ? '#dfe6e9' : '#f1f2f6', cursor: 'pointer', border: selectedQuiz === q.id ? '2px solid #0984e3' : 'none' }} onClick={() => { setSelectedQuiz(q.id); setStarted(false); setQuizData(null); }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{q.title}</Typography>
              <Button variant={selectedQuiz === q.id ? 'contained' : 'outlined'} color="primary" size="small" sx={{ mt: 1 }} onClick={e => { e.stopPropagation(); setSelectedQuiz(q.id); setStarted(false); setQuizData(null); }}>
                {selectedQuiz === q.id ? 'Selected' : 'Select'}
              </Button>
            </Paper>
          )) : (
            <Typography variant="body1" color="text.secondary">No quizzes available yet.</Typography>
          )}
        </Box>
        {selectedQuiz && !started && (
          <Button variant="contained" color="primary" fullWidth sx={{ mb: 2, fontWeight: 600 }} onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        )}
        {started && quizData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#00b894', fontWeight: 600 }}>{quizData.title}</Typography>
            {quizData.questions.map(q => (
              <Paper key={q.id} elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f9fbe7' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{q.question_text} <span style={{ color: '#636e72' }}>({q.marks} marks)</span></Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswerChange(q.id, parseInt(e.target.value))}
                >
                  {q.options.map(opt => (
                    <FormControlLabel
                      key={opt.id}
                      value={opt.id}
                      control={<Radio />}
                      label={opt.option_text}
                      disabled={submitted}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            ))}
            {!submitted ? (
              <Button variant="contained" color="success" sx={{ fontWeight: 600 }} onClick={handleSubmitQuiz}>Submit Answers</Button>
            ) : (
              <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>Your Score: {result} / {quizData.questions.reduce((a, b) => a + b.marks, 0)}</Typography>
            )}
          </Box>
        )}
        </Paper>
      )}

      {/* Leaderboard Tab */}
      {tabValue === 1 && (
        <Paper elevation={4} sx={{ padding: 4, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#6c5ce7' }}>Class Leaderboard</Typography>
          <List>
            {(Array.isArray(leaderboard) ? leaderboard : []).map((l, idx) => (
              <React.Fragment key={idx}>
                <ListItem sx={{ bgcolor: idx === 0 ? '#ffeaa7' : '#f1f2f6', borderRadius: 2, mb: 1 }}>
                  <ListItemText 
                    primary={<span style={{ fontWeight: 600 }}>{l.name}</span>} 
                    secondary={`Score: ${l.score} • Quiz: ${l.quiz_name} • ${new Date(l.submitted_at).toLocaleDateString()}`} 
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Chat Tab */}
      {tabValue === 2 && (
        <Paper elevation={4} sx={{ padding: 4, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#00b894' }}>Chat with Teacher</Typography>
          <Box sx={{ height: 400, overflowY: 'auto', mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2 }}>
            {chatMessages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 2, display: 'flex', justifyContent: msg.sender_type === 'student' ? 'flex-end' : 'flex-start' }}>
                <Card sx={{ 
                  maxWidth: '70%', 
                  bgcolor: msg.sender_type === 'student' ? '#0984e3' : '#f1f2f6',
                  color: msg.sender_type === 'student' ? 'white' : 'black'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {msg.sender_type === 'student' ? 'You' : 'Teacher'}
                    </Typography>
                    <Typography variant="body1">{msg.message}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Files Tab */}
      {tabValue === 3 && (
        <Paper elevation={4} sx={{ padding: 4, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#e17055' }}>Class Files</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {files.map((file) => (
              <Card key={file.id} sx={{ maxWidth: 345 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#e17055', mr: 2 }}>
                      <AttachFileIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" noWrap>
                        {file.original_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.file_size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Box>
                  {file.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {file.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {new Date(file.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownloadFile(file)}>
                    Download
                  </Button>
                </CardActions>
              </Card>
            ))}
            {files.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No files available yet.
              </Typography>
            )}
          </Box>
        </Paper>
      )}

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
