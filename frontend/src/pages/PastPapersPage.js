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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  GetApp,
  Visibility,
  CheckCircle,
  PictureAsPdf
} from '@mui/icons-material';

const PastPapersPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Past papers data mapping
  const pastPapersData = {
    'grade-5-scholarship': {
      title: 'Grade 5 Scholarship Past Papers',
      description: 'Complete collection of past papers for Grade 5 Scholarship examination',
      years: ['2023', '2022', '2021', '2020', '2019', '2018'],
      subjects: ['Mathematics', 'English', 'Environment Studies', 'Buddhism'],
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      papers: [
        { year: '2023', subject: 'Mathematics', type: 'Question Paper', size: '2.1 MB' },
        { year: '2023', subject: 'Mathematics', type: 'Marking Scheme', size: '1.8 MB' },
        { year: '2023', subject: 'English', type: 'Question Paper', size: '1.9 MB' },
        { year: '2023', subject: 'English', type: 'Marking Scheme', size: '1.5 MB' },
        { year: '2022', subject: 'Mathematics', type: 'Question Paper', size: '2.0 MB' },
        { year: '2022', subject: 'Environment Studies', type: 'Question Paper', size: '2.3 MB' }
      ]
    },
    'gce-ol': {
      title: 'GCE O/L Past Papers',
      description: 'Comprehensive collection of GCE Ordinary Level past papers',
      years: ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'],
      subjects: ['Mathematics', 'Science', 'English', 'Sinhala', 'History', 'Geography'],
      color: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      papers: [
        { year: '2023', subject: 'Mathematics', type: 'Question Paper', size: '2.5 MB' },
        { year: '2023', subject: 'Mathematics', type: 'Marking Scheme', size: '2.1 MB' },
        { year: '2023', subject: 'Science', type: 'Question Paper', size: '3.2 MB' },
        { year: '2023', subject: 'Science', type: 'Marking Scheme', size: '2.8 MB' },
        { year: '2022', subject: 'English', type: 'Question Paper', size: '2.0 MB' },
        { year: '2022', subject: 'Sinhala', type: 'Question Paper', size: '2.4 MB' }
      ]
    },
    'gce-al': {
      title: 'GCE A/L Past Papers',
      description: 'Advanced Level past papers for university entrance preparation',
      years: ['2023', '2022', '2021', '2020', '2019', '2018'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Commerce', 'Economics'],
      color: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      papers: [
        { year: '2023', subject: 'Mathematics', type: 'Question Paper', size: '3.1 MB' },
        { year: '2023', subject: 'Mathematics', type: 'Marking Scheme', size: '2.7 MB' },
        { year: '2023', subject: 'Physics', type: 'Question Paper', size: '3.5 MB' },
        { year: '2023', subject: 'Chemistry', type: 'Question Paper', size: '3.3 MB' },
        { year: '2022', subject: 'Biology', type: 'Question Paper', size: '3.8 MB' },
        { year: '2022', subject: 'Commerce', type: 'Question Paper', size: '2.9 MB' }
      ]
    },
    'physical-education': {
      title: 'Physical Education Past Papers',
      description: 'Past papers and study materials for Physical Education',
      years: ['2023', '2022', '2021', '2020'],
      subjects: ['Sports Theory', 'Health Education', 'Fitness Training'],
      color: 'linear-gradient(135deg, #38a169 0%, #68d391 100%)',
      papers: [
        { year: '2023', subject: 'Sports Theory', type: 'Question Paper', size: '2.2 MB' },
        { year: '2023', subject: 'Health Education', type: 'Question Paper', size: '2.0 MB' },
        { year: '2022', subject: 'Fitness Training', type: 'Question Paper', size: '1.8 MB' }
      ]
    }
  };

  const category = pastPapersData[categoryId];

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, pt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Past Papers Not Found
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

  const handleDownload = (paper) => {
    // In a real application, this would trigger the actual download
    alert(`Downloading ${paper.subject} ${paper.type} (${paper.year}) - ${paper.size}`);
  };

  const handlePreview = (paper) => {
    // In a real application, this would open a preview modal
    alert(`Previewing ${paper.subject} ${paper.type} (${paper.year})`);
  };

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
            <Assignment sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              {category.title}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              {category.description}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Available Years */}
        <Typography variant="h4" textAlign="center" mb={2}>
          Available Years
        </Typography>
        
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mb={6}>
          {category.years.map((year, index) => (
            <Chip
              key={index}
              label={year}
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

        {/* Subjects */}
        <Typography variant="h4" textAlign="center" mb={2}>
          Subjects Available
        </Typography>
        
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mb={6}>
          {category.subjects.map((subject, index) => (
            <Chip
              key={index}
              label={subject}
              variant="filled"
              sx={{ 
                bgcolor: '#2d3748',
                color: 'white',
                fontSize: '1rem',
                py: 2
              }}
            />
          ))}
        </Box>

        {/* Past Papers List */}
        <Typography variant="h4" textAlign="center" mb={4}>
          Download Past Papers
        </Typography>
        
        <Grid container spacing={3}>
          {category.papers.map((paper, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  bgcolor: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PictureAsPdf sx={{ color: '#ff6b6b', mr: 1 }} />
                    <Typography variant="h6" color="white">
                      {paper.subject}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={1}>
                    <strong>Year:</strong> {paper.year}
                  </Typography>
                  
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={1}>
                    <strong>Type:</strong> {paper.type}
                  </Typography>
                  
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={3}>
                    <strong>Size:</strong> {paper.size}
                  </Typography>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<GetApp />}
                      onClick={() => handleDownload(paper)}
                      sx={{
                        bgcolor: '#4facfe',
                        '&:hover': { bgcolor: '#3182ce' },
                        flex: 1
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handlePreview(paper)}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': { 
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                    >
                      Preview
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Information Section */}
        <Paper 
          sx={{ 
            bgcolor: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.1)',
            p: 4,
            mt: 6,
            borderRadius: 3
          }}
        >
          <Typography variant="h5" mb={3} color="white">
            How to Use Past Papers Effectively
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: '#4facfe' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Time yourself when attempting papers"
                primaryTypographyProps={{ color: 'white' }}
                secondary="Practice under exam conditions to improve speed and accuracy"
                secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: '#4facfe' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Review marking schemes carefully"
                primaryTypographyProps={{ color: 'white' }}
                secondary="Understand how marks are allocated for different types of answers"
                secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircle sx={{ color: '#4facfe' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Identify patterns and frequently asked topics"
                primaryTypographyProps={{ color: 'white' }}
                secondary="Focus your revision on topics that appear regularly in exams"
                secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
              />
            </ListItem>
          </List>
        </Paper>

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
            Need More Study Resources?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Access our complete learning platform with interactive lessons and practice tests
          </Typography>
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
            Explore Full Platform
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PastPapersPage;