import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { authenticatedFetch } from '../utils/auth';

function ChangePassword({ user, onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await authenticatedFetch('http://localhost:5050/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        onPasswordChanged();
      } else {
        setError(data.error || 'Password change failed');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>Change Password</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </form>
        {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
}

export default ChangePassword;
