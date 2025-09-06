import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, IconButton, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


function TeacherDashboard() {
  // State for editing quiz
  const [editQuizModal, setEditQuizModal] = useState(false);
  const [editQuizData, setEditQuizData] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editQuestions, setEditQuestions] = useState([]);

  useEffect(() => {
    if (editQuizData) {
      setEditTitle(editQuizData.title || '');
      setEditQuestions(editQuizData.questions || []);
    }
  }, [editQuizData]);

  const handleSaveQuizEdit = async () => {
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
    // Refresh quizzes list
    fetch('http://localhost:5050/api/teacher/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data));
    fetchResults();
  };
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuizId, setNewQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ question_text: '', marks: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
  const [results, setResults] = useState([]);
  // Removed studentId state
  const [studentClass, setStudentClass] = useState('');
  const fetchResults = () => {
    fetch('http://localhost:5050/api/teacher/results')
      .then(res => res.json())
      .then(data => setResults(data));
  };
  useEffect(() => {
    fetch('http://localhost:5050/api/teacher/students')
      .then(res => res.json())
      .then(data => setStudents(data));
    fetch('http://localhost:5050/api/teacher/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data));
    fetch('http://localhost:5050/api/teacher/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data));
    fetchResults();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    // For demo, teacher_id is hardcoded as 1
      const res = await fetch('http://localhost:5050/api/teacher/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, class: studentClass, teacher_id: 1 })
      });
    if (res.ok) {
      const newStudent = await res.json();
        setStudents([...students, newStudent]);
        setName('');
        setEmail('');
        setStudentClass('');
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    // For demo, teacher_id is hardcoded as 1
    const res = await fetch('http://localhost:5050/api/teacher/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: quizTitle, teacher_id: 1 })
    });
    if (res.ok) {
      const quiz = await res.json();
      setQuizTitle('');
      setNewQuizId(quiz.id);
      setShowQuestionModal(true);
      setQuestions([]);
      setCurrentQuestion({ question_text: '', marks: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
      // Refresh quizzes list
      fetch('http://localhost:5050/api/teacher/quizzes')
        .then(res => res.json())
        .then(data => setQuizzes(data));
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      {/* Modal for adding questions to quiz */}
      {showQuestionModal && (
        <Paper elevation={6} sx={{ position: 'fixed', top: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 500, padding: 3 }}>
          <Typography variant="h6" gutterBottom>Add Question to Quiz</Typography>
          <TextField
            label="Question Text"
            variant="outlined"
            fullWidth
            value={currentQuestion.question_text}
            onChange={e => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Marks"
            type="number"
            variant="outlined"
            value={currentQuestion.marks}
            onChange={e => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1">Options</Typography>
          {currentQuestion.options.map((opt, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                label={`Option ${idx + 1}`}
                variant="outlined"
                value={opt.option_text}
                onChange={e => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[idx].option_text = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant={opt.is_correct ? "contained" : "outlined"}
                color={opt.is_correct ? "success" : "primary"}
                onClick={() => {
                  const newOptions = currentQuestion.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                }}
              >Correct</Button>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => {
              setQuestions([...questions, currentQuestion]);
              setCurrentQuestion({ question_text: '', marks: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
            }}>Add Another Question</Button>
            <Button variant="contained" color="success" onClick={async () => {
              // Add last question if not empty
              if (currentQuestion.question_text.trim()) {
                setQuestions([...questions, currentQuestion]);
              }
              // Send all questions to backend
              const allQuestions = currentQuestion.question_text.trim() ? [...questions, currentQuestion] : questions;
              const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${newQuizId}/questions`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ questions: allQuestions })
                });
              if (res.ok) {
                setShowQuestionModal(false);
                setNewQuizId(null);
                setQuestions([]);
                setCurrentQuestion({ question_text: '', marks: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
              }
            }}>Finish & Save Quiz</Button>
            <Button variant="outlined" color="error" onClick={() => {
              setShowQuestionModal(false);
              setNewQuizId(null);
              setQuestions([]);
              setCurrentQuestion({ question_text: '', marks: 1, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
            }}>Cancel</Button>
          </Box>
        </Paper>
      )}
      <Typography variant="h4" align="center" gutterBottom>Teacher Dashboard</Typography>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add Student</Typography>
        <form onSubmit={handleAddStudent}>
          {/* Removed Student ID field */}
          <TextField
            label="Student Name"
            variant="outlined"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Student Email"
            variant="outlined"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Class"
            variant="outlined"
            value={studentClass}
            onChange={e => setStudentClass(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">Add Student</Button>
        </form>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Create Quiz</Typography>
        <form onSubmit={handleCreateQuiz}>
          <TextField
            label="Quiz Title"
            variant="outlined"
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">Create Quiz</Button>
        </form>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Students</Typography>
        <List>
          {students.map(s => (
            <React.Fragment key={s.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={async () => {
                    const res = await fetch(`http://localhost:5050/api/teacher/students/${s.id}`, {
                      method: 'DELETE'
                    });
                    if (res.ok) {
                      setStudents(students.filter(student => student.id !== s.id));
                    }
                  }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={s.name} secondary={s.email} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Quizzes</Typography>
        <List>
          {quizzes.map(q => (
            <React.Fragment key={q.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={async () => {
                      // Fetch full quiz details
                      const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${q.id}/full`);
                      if (res.ok) {
                        const quizData = await res.json();
                        setEditQuizData(quizData);
                        setEditQuizModal(true);
                      }
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={async () => {
                      const res = await fetch(`http://localhost:5050/api/teacher/quizzes/${q.id}`, {
                        method: 'DELETE'
                      });
                      if (res.ok) {
                        setQuizzes(quizzes.filter(quiz => quiz.id !== q.id));
                      }
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText primary={q.title} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
        {/* Modal for editing quiz */}
        {editQuizModal && editQuizData && (
          <Paper elevation={6} sx={{ position: 'fixed', top: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 600, padding: 3, maxHeight: '80vh', overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Typography variant="h6" gutterBottom>Edit Quiz</Typography>
            <TextField
              label="Quiz Title"
              variant="outlined"
              fullWidth
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1">Questions</Typography>
            {editQuestions.map((q, idx) => (
              <Box key={q.id} sx={{ mb: 2, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                <TextField
                  label={`Question ${idx + 1}`}
                  variant="outlined"
                  fullWidth
                  value={q.question_text}
                  onChange={e => {
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
                  onChange={e => {
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
                      onChange={e => {
                        const newQuestions = [...editQuestions];
                        newQuestions[idx].options[oidx].option_text = e.target.value;
                        setEditQuestions(newQuestions);
                      }}
                      sx={{ mr: 2 }}
                    />
                    <Button
                      variant={opt.is_correct ? "contained" : "outlined"}
                      color={opt.is_correct ? "success" : "primary"}
                      onClick={() => {
                        const newQuestions = [...editQuestions];
                        newQuestions[idx].options = newQuestions[idx].options.map((o, i) => ({ ...o, is_correct: i === oidx }));
                        setEditQuestions(newQuestions);
                      }}
                    >Correct</Button>
                  </Box>
                ))}
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="contained" color="success" onClick={handleSaveQuizEdit}>Save Changes</Button>
              <Button variant="outlined" color="error" onClick={() => {
                setEditQuizModal(false);
                setEditQuizData(null);
              }}>Cancel</Button>
            </Box>
          </Paper>
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
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Student Quiz Results</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Quiz Name</TableCell>
                <TableCell>Marks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.student_name}</TableCell>
                  <TableCell>{r.quiz_name}</TableCell>
                  <TableCell>{r.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Chat user={{ username: 'teacher1' }} />
    </Box>
  );
}

export default TeacherDashboard;
