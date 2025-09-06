
import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, Divider, Select, MenuItem, Radio, RadioGroup, FormControlLabel } from '@mui/material';

function StudentDashboard({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [score, setScore] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Students should only see quizzes from their assigned teacher
    fetch('http://localhost:5050/api/teacher/student-quizzes', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setQuizzes(Array.isArray(data) ? data : []));
    fetch('http://localhost:5050/api/teacher/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    // For demo, student_id is hardcoded as 1
    const res = await fetch('http://localhost:5050/api/teacher/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 1, quiz_id: selectedQuiz, score: parseInt(score) })
    });
    if (res.ok) {
      setScore('');
      setSelectedQuiz('');
      // Optionally refresh leaderboard
    }
  };

  const handleStartQuiz = async () => {
    const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${selectedQuiz}/full`);
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
    let total = 0;
    quizData.questions.forEach(q => {
      const selected = answers[q.id];
      const correct = q.options.find(o => o.is_correct);
      if (correct && selected === correct.id) {
        total += q.marks;
      }
    });
    setResult(total);
    setSubmitted(true);
  
    // Save result to backend
    await fetch('http://localhost:5050/api/teacher/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user.id, quiz_id: quizData.id, score: total })
    });
  };

  return (
    <Box sx={{ maxWidth: 700, margin: 'auto', padding: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, color: '#2d3436' }}>Student Dashboard</Typography>
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
      <Paper elevation={4} sx={{ padding: 4, mb: 4, borderRadius: 3, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#6c5ce7' }}>Leaderboard</Typography>
        <List>
          {(Array.isArray(leaderboard) ? leaderboard : []).map((l, idx) => (
            <React.Fragment key={idx}>
              <ListItem sx={{ bgcolor: idx === 0 ? '#ffeaa7' : '#f1f2f6', borderRadius: 2, mb: 1 }}>
                <ListItemText primary={<span style={{ fontWeight: 600 }}>{l.name}</span>} secondary={`Score: ${l.score}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      <Paper elevation={2} sx={{ padding: 3, borderRadius: 3, bgcolor: '#fff' }}>
        <Chat user={user} />
      </Paper>
    </Box>
  );
}

export default StudentDashboard;
