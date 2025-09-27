import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  Paper,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  School,
  Quiz,
  Assignment,
  VideoLibrary,
  Download,
  Star
} from '@mui/icons-material';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Category data mapping
  const categoryData = {
    'grade-5-scholarship': {
      title: 'Grade 5 Scholarship',
      description: 'Comprehensive preparation materials for Grade 5 Scholarship examination',
      subjects: ['Mathematics', 'English', 'Environment Studies', 'Buddhism/Christianity/Islam/Hinduism'],
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: [
        { icon: <Quiz />, title: 'Practice Quizzes', description: '200+ practice questions with detailed explanations' },
        { icon: <Assignment />, title: 'Past Papers', description: 'Previous years papers with marking schemes' },
        { icon: <VideoLibrary />, title: 'Video Lessons', description: 'Interactive video tutorials by expert teachers' },
        { icon: <Download />, title: 'Study Materials', description: 'Downloadable notes and worksheets' }
      ]
    },
    'gce-ol': {
      title: 'GCE O/L',
      description: 'Complete study resources for GCE Ordinary Level examination',
      subjects: ['Mathematics', 'Science', 'English', 'Sinhala', 'History', 'Geography', 'Commerce', 'ICT'],
      color: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      features: [
        { icon: <Quiz />, title: 'Subject Quizzes', description: 'Practice tests for all O/L subjects' },
        { icon: <Assignment />, title: 'Past Papers', description: '10+ years of past papers with answers' },
        { icon: <VideoLibrary />, title: 'Expert Tutorials', description: 'Subject-wise video explanations' },
        { icon: <Star />, title: 'Revision Notes', description: 'Concise notes for quick revision' }
      ]
    },
    'gce-al': {
      title: 'GCE A/L',
      description: 'Advanced Level preparation materials for university entrance',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Commerce', 'Economics', 'Accounting'],
      color: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      features: [
        { icon: <Quiz />, title: 'Advanced Quizzes', description: 'Complex problem-solving practice tests' },
        { icon: <Assignment />, title: 'Model Papers', description: 'University standard question papers' },
        { icon: <VideoLibrary />, title: 'University Prep', description: 'Advanced concept video lectures' },
        { icon: <Download />, title: 'Reference Materials', description: 'Comprehensive study guides and formulas' }
      ]
    }
  };

  const category = categoryData[categoryId];

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, pt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Category Not Found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f1419', color: 'white' }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: category.color,
          pt: 8,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ color: 'white', mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">Back to Home</Typography>
          </Box>
          
          <Box textAlign="center">
            <School sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              {category.title}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              {category.description}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Subjects */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" mb={4}>
          Available Subjects
        </Typography>
        
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mb={6}>
          {category.subjects.map((subject, index) => (
            <Chip
              key={index}
              label={subject}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                fontSize: '1rem',
                py: 2
              }}
            />
          ))}
        </Box>

        {/* Features */}
        <Typography variant="h4" textAlign="center" mb={4}>
          What You'll Get
        </Typography>
        
        <Grid container spacing={4}>
          {category.features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  bgcolor: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: feature.title.includes('Quiz') ? 'pointer' : 'default',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }
                }}
                onClick={() => {
                  if (feature.title.includes('Quiz')) {
                    navigate(`/quiz-preview/${categoryId}`);
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box 
                      sx={{
                        bgcolor: '#2d3748',
                        borderRadius: '50%',
                        p: 1.5,
                        mr: 2,
                        color: feature.title.includes('Quiz') ? '#4facfe' : '#4facfe'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" color="white">
                      {feature.title}
                      {feature.title.includes('Quiz') && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', color: '#4facfe' }}>
                          (Click to start)
                        </Box>
                      )}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Paper 
          sx={{ 
            background: category.color,
            p: 6,
            textAlign: 'center',
            mt: 6,
            borderRadius: 3
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Ready to Start Learning?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Join thousands of students who have successfully prepared with S3Learn
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                px: 4,
                py: 1.5
              }}
              onClick={() => navigate('/login')}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5
              }}
            >
              View Sample Content
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CategoryPage;