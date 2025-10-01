import React, { useEffect, useState, useCallback } from 'react';
import { authenticatedFetch } from '../utils/auth';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Container,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

function ClassManagement({ user, onLogout, onClassSelect }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [createClassModal, setCreateClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', description: '' });
  const [editingClass, setEditingClass] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch('http://52.23.173.216:5050/api/teacher/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      } else {
        showSnackbar('Error loading classes', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading classes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authenticatedFetch('http://52.23.173.216:5050/api/teacher/classes', {
        method: 'POST',
        body: JSON.stringify({ ...classForm, teacher_id: user.id })
      });
      
      if (res.ok) {
        const newClass = await res.json();
        setClasses([...classes, newClass]);
        setClassForm({ name: '', description: '' });
        setCreateClassModal(false);
        showSnackbar('Class created successfully!');
      } else {
        showSnackbar('Error creating class', 'error');
      }
    } catch (error) {
      showSnackbar('Error creating class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authenticatedFetch(`http://52.23.173.216:5050/api/teacher/classes/${editingClass.id}`, {
        method: 'PUT',
        body: JSON.stringify(classForm)
      });
      
      if (res.ok) {
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...classForm } : c));
        setClassForm({ name: '', description: '' });
        setEditingClass(null);
        setEditClassModal(false);
        showSnackbar('Class updated successfully!');
      } else {
        showSnackbar('Error updating class', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`http://52.23.173.216:5050/api/teacher/classes/${classId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setClasses(classes.filter(c => c.id !== classId));
        showSnackbar('Class deleted successfully!');
      } else {
        showSnackbar('Error deleting class', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    setClassForm({ name: classItem.name, description: classItem.description || '' });
    setEditClassModal(true);
  };

  const handleClassClick = (classItem) => {
    onClassSelect(classItem);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Class Management - Welcome, {user?.username}
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setCreateClassModal(true)}
            sx={{ mr: 1 }}
          >
            Create Class
          </Button>
          <Button
            color="inherit"
            onClick={onLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            py: 4,
            px: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            borderRadius: 3,
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.8rem" },
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Manage Your Classes
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.95,
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.3rem" },
              fontWeight: 500,
            }}
          >
            Create and manage your teaching classes
          </Typography>
        </Paper>

        {/* Classes Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={60} />
          </Box>
        ) : classes.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <ClassIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Classes Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Create your first class to start managing students and quizzes.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateClassModal(true)}
              size="large"
            >
              Create Your First Class
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {classes.map((classItem, index) => (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleClassClick(classItem)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <ClassIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          {classItem.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {classItem.description || 'No description provided'}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${classItem.student_count || 0} Students`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<QuizIcon />}
                          label={`${classItem.quiz_count || 0} Quizzes`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(classItem);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(classItem.id);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClassClick(classItem);
                        }}
                      >
                        Enter Class
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Class Modal */}
        <Dialog
          open={createClassModal}
          onClose={() => setCreateClassModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <AddIcon sx={{ mr: 1 }} />
              Create New Class
            </Box>
          </DialogTitle>
          <form onSubmit={handleCreateClass}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Class Name"
                fullWidth
                variant="outlined"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description (Optional)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={classForm.description}
                onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateClassModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Create Class'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Class Modal */}
        <Dialog
          open={editClassModal}
          onClose={() => setEditClassModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 1 }} />
              Edit Class
            </Box>
          </DialogTitle>
          <form onSubmit={handleEditClass}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Class Name"
                fullWidth
                variant="outlined"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description (Optional)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={classForm.description}
                onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditClassModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Update Class'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
      </Container>
    </Box>
  );
}

export default ClassManagement;
