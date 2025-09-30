import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useParams } from 'react-router-dom';

function StudentQuiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`http://98.84.104.233:5050/api/teacher/quizzes/${quizId}/full`)
      .then(res => res.json())
      .then(data => setQuiz(data));
  }, [quizId]);

  const handleChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = () => {
    let total = 0;
    quiz.questions.forEach(q => {
      const selected = answers[q.id];
      const correct = q.options.find(o => o.is_correct);
      if (correct && selected === correct.id) {
        total += q.marks;
      }
    });
    setScore(total);
    setSubmitted(true);
  };

  if (!quiz) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>{quiz.title}</Typography>
        {quiz.questions.map(q => (
          <Box key={q.id} sx={{ mb: 3 }}>
            <Typography variant="subtitle1">{q.question_text} ({q.marks} marks)</Typography>
            <RadioGroup
              value={answers[q.id] || ''}
              onChange={e => handleChange(q.id, parseInt(e.target.value))}
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
          <Button variant="contained" color="primary" onClick={handleSubmit}>Submit Answers</Button>
        ) : (
          <Typography variant="h6" color="success.main">Your Score: {score} / {quiz.questions.reduce((a, b) => a + b.marks, 0)}</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default StudentQuiz;
