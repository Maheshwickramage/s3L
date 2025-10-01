import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';


function AdminDashboard() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('https://52.23.173.216:5050/api/admin/teachers')
      .then(res => res.json())
      .then(data => setTeachers(data));
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const res = await fetch('https://52.23.173.216:5050/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (res.ok) {
      const newTeacher = await res.json();
      setTeachers([...teachers, newTeacher]);
      setName('');
      setEmail('');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      <Button onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }} variant="outlined" color="secondary" sx={{ float: 'right', mb: 2 }}>
        Logout
      </Button>
      <Typography variant="h4" align="center" gutterBottom>Super Admin Dashboard</Typography>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add Teacher</Typography>
        <form onSubmit={handleAddTeacher}>
          <TextField
            label="Teacher Name"
            variant="outlined"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Teacher Email"
            variant="outlined"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">Add Teacher</Button>
        </form>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Teachers</Typography>
        <List>
          {teachers.map(t => (
            <React.Fragment key={t.id}>
              <ListItem>
                <ListItemText primary={t.name} secondary={t.email} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default AdminDashboard;
