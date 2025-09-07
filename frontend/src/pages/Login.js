import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { login } from '../utils/auth';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        console.log('Login successful:', result.user);
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(
          rgba(74, 85, 130, 0.7),
          rgba(93, 157, 162, 0.7)
        ), url('/background.jpg')`, // 👉 replace with your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 350,
          maxWidth: 400,
          width: '100%',
          boxShadow: 8,
          bgcolor: 'rgba(255,255,255,0.9)', // semi-transparent for better readability
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          {/* <img
            src="/logo.png"
            alt="S3Learning Logo"
            style={{ width: 64, height: 64, marginBottom: 8 }}
          /> */}
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}
          >
            S3Learning
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#636e72', mb: 2 }}>
            Study. Solve. Succeed.
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: 1,
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        {error && (
          <Typography
            color="error"
            align="center"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            {error}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 3, color: '#b2bec3' }}>
          &copy; {new Date().getFullYear()} S3Learning. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
