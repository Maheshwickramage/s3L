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
    fetch('http://localhost:5050/api/teacher/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data));
    fetch('http://localhost:5050/api/teacher/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data));
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
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>Student Dashboard</Typography>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Participate in Quiz</Typography>
        <Select
          value={selectedQuiz}
          onChange={e => setSelectedQuiz(e.target.value)}
          displayEmpty
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          <MenuItem value=""><em>Select Quiz</em></MenuItem>
          {quizzes.map(q => (
            <MenuItem key={q.id} value={q.id}>{q.title}</MenuItem>
          ))}
        </Select>
        {selectedQuiz && !started && (
          <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        )}
        {started && quizData && (
          <Box>
            <Typography variant="h5" gutterBottom>{quizData.title}</Typography>
            {quizData.questions.map(q => (
              <Box key={q.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1">{q.question_text} ({q.marks} marks)</Typography>
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
              </Box>
            ))}
            {!submitted ? (
              <Button variant="contained" color="success" onClick={handleSubmitQuiz}>Submit Answers</Button>
            ) : (
              <Typography variant="h6" color="success.main">Your Score: {result} / {quizData.questions.reduce((a, b) => a + b.marks, 0)}</Typography>
            )}
          </Box>
        )}
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Leaderboard</Typography>
        <List>
          {leaderboard.map((l, idx) => (
            <React.Fragment key={idx}>
              <ListItem>
                <ListItemText primary={`${l.name}: ${l.score}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      <Chat user={user} />
    </Box>
  );
}

export default StudentDashboard;
