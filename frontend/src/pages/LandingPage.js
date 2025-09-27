import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Slide,
  Fade,
  Grow,
  Box,
  Chip
} from '@mui/material';
import {
  School,
  Quiz,
  Analytics,
  CheckCircle,
  RocketLaunch,
  Menu as MenuIcon,
  Close as CloseIcon,
  Grade,
  Subject,
  Science,
  Calculate,
  Language,
  History,
  Palette,
  Sports,
  Computer,
  Engineering,
  Star,
  Person,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  AttachMoney,
  Verified
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);

  // Handle scroll effect for navigation bar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger animations on component mount
  useEffect(() => {
    setAnimationTrigger(true);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Navigation items
  const navItems = [
    { label: 'Home', href: '#home', active: true },
    { label: 'Grades', href: '#grades' },
    { label: 'Subjects', href: '#subjects' },
    { label: 'Past Papers', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];

  // Educational categories with subjects
  const educationalCategories = [
    {
      title: 'Grade 5 Scholarship',
      icon: <Calculate />,
      subjects: 'Mathematics, English, Environment, Buddhism',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: 'grade-5-scholarship'
    },
    {
      title: 'GCE O/L',
      icon: <Science />,
      subjects: 'Mathematics, Science, English, Sinhala, History',
      gradient: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      route: 'gce-ol'
    },
    {
      title: 'GCE A/L',
      icon: <Language />,
      subjects: 'Mathematics, Physics, Chemistry, Biology, Commerce',
      gradient: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      route: 'gce-al'
    },
    // {
    //   title: 'History & Social Studies',
    //   icon: <History />,
    //   subjects: 'World History, Geography, Civics, Economics',
    //   gradient: 'linear-gradient(135deg, #805ad5 0%, #d53f8c 100%)'
    // },
    // {
    //   title: 'Arts & Creative',
    //   icon: <Palette />,
    //   subjects: 'Visual Arts, Music, Drama, Creative Writing',
    //   gradient: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)'
    // },
    // {
    //   title: 'Technology',
    //   icon: <Computer />,
    //   subjects: 'Programming, Digital Literacy, Robotics',
    //   gradient: 'linear-gradient(135deg, #d69e2e 0%, #f6e05e 100%)'
    // },
    // {
    //   title: 'Physical Education',
    //   icon: <Sports />,
    //   subjects: 'Sports, Health, Fitness, Team Building',
    //   gradient: 'linear-gradient(135deg, #38a169 0%, #68d391 100%)'
    // },
    // {
    //   title: 'Engineering & STEM',
    //   icon: <Engineering />,
    //   subjects: 'Engineering Design, Applied Sciences, Innovation',
    //   gradient: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
    // }
  ];
 // Educational categories with subjects
  const pastPaperCategories = [
    {
      title: 'Grade 5 Scholarship',
      icon: <Calculate />,
      subjects: 'Mathematics, English, Environment, Buddhism',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: 'past-papers/grade-5-scholarship'
    },
    {
      title: 'GCE O/L',
      icon: <Science />,
      subjects: 'Mathematics, Science, English, Sinhala, History',
      gradient: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      route: 'past-papers/gce-ol'
    },
    {
      title: 'GCE A/L',
      icon: <Language />,
      subjects: 'Mathematics, Physics, Chemistry, Biology, Commerce',
      gradient: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      route: 'past-papers/gce-al'
    },
    {
      title: 'Physical Education',
      icon: <Sports />,
      subjects: 'Sports Theory, Health Education, Fitness Training',
      gradient: 'linear-gradient(135deg, #38a169 0%, #68d391 100%)',
      route: 'past-papers/physical-education'
    }
  ];

  // Featured Teachers Data
  const featuredTeachers = [
    {
      id: 1,
      name: 'Mr. Sunil Perera',
      subject: 'Mathematics',
      qualification: 'MSc Mathematics, B.Ed',
      experience: '15 years',
      rating: 4.9,
      reviews: 245,
      location: 'Colombo',
      price: 'Rs. 2,500/hour',
      description: 'Expert in O/L & A/L Mathematics with proven track record of student success',
      avatar: '/api/placeholder/150/150',
      specialties: ['Algebra', 'Calculus', 'Statistics'],
      verified: true,
      contact: {
        phone: '077-123-4567',
        email: 'sunil.perera@example.com'
      },
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      name: 'Ms. Priya Fernando',
      subject: 'Science',
      qualification: 'BSc Physics, PGDE',
      experience: '12 years',
      rating: 4.8,
      reviews: 189,
      location: 'Kandy',
      price: 'Rs. 2,200/hour',
      description: 'Passionate science teacher specializing in Physics and Chemistry',
      avatar: '/api/placeholder/150/150',
      specialties: ['Physics', 'Chemistry', 'Biology'],
      verified: true,
      contact: {
        phone: '076-987-6543',
        email: 'priya.fernando@example.com'
      },
      gradient: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)'
    },
    {
      id: 3,
      name: 'Mr. Roshan Silva',
      subject: 'English',
      qualification: 'BA English Literature, TEFL',
      experience: '10 years',
      rating: 4.7,
      reviews: 156,
      location: 'Galle',
      price: 'Rs. 2,000/hour',
      description: 'Native-level English proficiency with international teaching experience',
      avatar: '/api/placeholder/150/150',
      specialties: ['Grammar', 'Literature', 'Essay Writing'],
      verified: true,
      contact: {
        phone: '075-456-7890',
        email: 'roshan.silva@example.com'
      },
      gradient: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)'
    },
    {
      id: 4,
      name: 'Dr. Kumari Jayasinghe',
      subject: 'Chemistry',
      qualification: 'PhD Chemistry, B.Ed',
      experience: '20 years',
      rating: 5.0,
      reviews: 312,
      location: 'Negombo',
      price: 'Rs. 3,000/hour',
      description: 'University lecturer with extensive A/L Chemistry teaching experience',
      avatar: '/api/placeholder/150/150',
      specialties: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
      verified: true,
      contact: {
        phone: '074-321-9876',
        email: 'kumari.jayasinghe@example.com'
      },
      gradient: 'linear-gradient(135deg, #805ad5 0%, #d53f8c 100%)'
    }
  ];
  return (
    <>
      {/* Navigation Toolbar */}
      <div className={`navigation-toolbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#home" className="nav-logo">
            <School className="nav-logo-icon" />
            <span>S3Learn</span>
          </a>

          {!isMobile ? (
            <>
              <nav className="nav-menu">
                <ul className="nav-links">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      <a 
                        href={item.href} 
                        className={`nav-link ${item.active ? 'active' : ''}`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <Button 
                className="nav-cta"
                onClick={handleLogin}
                disableRipple
              >
                Get Started
              </Button>
            </>
          ) : (
            <IconButton
              className="nav-mobile"
              onClick={handleMobileMenuToggle}
              color="inherit"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="nav-menu active">
            {navItems.map((item, index) => (
              <a 
                key={index}
                href={item.href} 
                className={`nav-link ${item.active ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button 
              className="nav-cta"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogin();
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <Container maxWidth="lg" className="container-padding">
          <Fade in={animationTrigger} timeout={1000}>
            <div className="hero-content fade-in-up">
              <Avatar className="hero-avatar">
                <School sx={{ fontSize: '3rem', color: 'white' }} />
              </Avatar>
              
              <Typography variant="h1" className="hero-title">
                Welcome to <span className="hero-brand-text">S3Learn</span>
              </Typography>
              
              <Typography variant="h4" className="hero-subtitle">
                Empowering Education Through Technology
              </Typography>
              
              <Typography variant="h4" className="hero-brand-text">
                Study-Solve-Succeed
              </Typography>
              
              <div className="hero-buttons">
                <Button
                  className="get-started-btn"
                  onClick={handleLogin}
                  size="large"
                  startIcon={<RocketLaunch />}
                >
                  Start Learning
                </Button>
                <Button
                  className="learn-more-btn"
                  size="large"
                  startIcon={<School />}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Fade>
        </Container>
      </section>

      {/* Features Section
      <section id="features" className="features-section">
        <Container maxWidth="lg" className="container-padding">
          <Slide direction="up" in={animationTrigger} timeout={1200}>
            <div>
              <Typography variant="h2" className="section-title fade-in-up">
                Powerful Learning Features
              </Typography>
              
              <Typography variant="body1" className="section-description">
                Discover the tools and features that make learning engaging, 
                efficient, and effective for all users.
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in={animationTrigger} timeout={800}>
                    <Card className="feature-card grades">
                      <CardContent>
                        <Avatar className="feature-avatar grades">
                          <Grade sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        <Typography variant="h6" className="feature-title">
                          Grade Management
                        </Typography>
                        <Typography variant="body2" className="feature-description">
                          Comprehensive grade tracking and performance analytics for 
                          all academic levels from K-12 to higher education.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in={animationTrigger} timeout={1000}>
                    <Card className="feature-card subjects">
                      <CardContent>
                        <Avatar className="feature-avatar subjects">
                          <Subject sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        <Typography variant="h6" className="feature-title">
                          Subject Library
                        </Typography>
                        <Typography variant="body2" className="feature-description">
                          Extensive collection of subjects and courses with 
                          interactive content, assessments, and learning resources.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in={animationTrigger} timeout={1200}>
                    <Card className="feature-card quizzes">
                      <CardContent>
                        <Avatar className="feature-avatar quizzes">
                          <Quiz sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        <Typography variant="h6" className="feature-title">
                          Interactive Quizzes
                        </Typography>
                        <Typography variant="body2" className="feature-description">
                          Engaging quizzes and assessments with instant feedback, 
                          detailed explanations, and progress tracking.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in={animationTrigger} timeout={1400}>
                    <Card className="feature-card analytics">
                      <CardContent>
                        <Avatar className="feature-avatar analytics">
                          <Analytics sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        <Typography variant="h6" className="feature-title">
                          Learning Analytics
                        </Typography>
                        <Typography variant="body2" className="feature-description">
                          Advanced analytics and insights to track learning progress, 
                          identify areas for improvement, and optimize outcomes.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>
            </div>
          </Slide>
        </Container>
      </section> */}

      {/* Featured Teachers Section */}
      <section className="teachers-section">
        <Container maxWidth="lg" className="container-padding">
          <Typography variant="h2" className="section-title fade-in-up">
            Featured Teachers
          </Typography>
          
          <Typography variant="body1" className="section-description">
            Connect with experienced and qualified teachers for personalized learning
          </Typography>
          
          <Grid container spacing={4}>
            {featuredTeachers.map((teacher, index) => (
              <Grid item xs={12} sm={6} md={3} key={teacher.id}>
                <Grow in={animationTrigger} timeout={800 + index * 100}>
                  <Card className="teacher-card">
                    <CardContent className="teacher-content">
                      {/* Teacher Avatar and Verification */}
                      <Box className="teacher-header">
                        <Avatar 
                          className="teacher-avatar"
                          sx={{ background: teacher.gradient }}
                        >
                          <Person sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        {teacher.verified && (
                          <Verified className="verification-badge" />
                        )}
                      </Box>
                      
                      {/* Teacher Info */}
                      <Typography variant="h6" className="teacher-name">
                        {teacher.name}
                      </Typography>
                      
                      <Typography variant="body2" className="teacher-subject">
                        {teacher.subject} Teacher
                      </Typography>
                      
                      {/* Rating */}
                      <Box className="rating-section">
                        <Box className="stars">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`star ${i < Math.floor(teacher.rating) ? 'filled' : ''}`}
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" className="rating-text">
                          {teacher.rating} ({teacher.reviews} reviews)
                        </Typography>
                      </Box>
                      
                      {/* Experience and Location */}
                      <Box className="teacher-details">
                        <Box className="detail-item">
                          <AccessTime className="detail-icon" />
                          <Typography variant="body2">{teacher.experience}</Typography>
                        </Box>
                        <Box className="detail-item">
                          <LocationOn className="detail-icon" />
                          <Typography variant="body2">{teacher.location}</Typography>
                        </Box>
                      </Box>
                      
                      {/* Specialties */}
                      <Box className="specialties">
                        {teacher.specialties.slice(0, 2).map((specialty, idx) => (
                          <Chip 
                            key={idx}
                            label={specialty}
                            size="small"
                            className="specialty-chip"
                          />
                        ))}
                      </Box>
                      
                      {/* Price */}
                      <Typography variant="h6" className="teacher-price">
                        {teacher.price}
                      </Typography>
                      
                      {/* Action Buttons */}
                      <Box className="teacher-actions">
                        <Button 
                          variant="contained" 
                          size="small"
                          className="contact-btn"
                          startIcon={<Phone />}
                          onClick={() => window.open(`tel:${teacher.contact.phone}`)}
                        >
                          Call
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          className="email-btn"
                          startIcon={<Email />}
                          onClick={() => window.open(`mailto:${teacher.contact.email}`)}
                        >
                          Email
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
          
          {/* View All Teachers Button */}
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              className="view-all-teachers-btn"
              onClick={() => navigate('/teachers')}
            >
              View All Teachers
            </Button>
          </Box>
        </Container>
      </section>

      {/* Educational Categories Section */}
      <section id="subjects" className="categories-section">
        <Container maxWidth="lg" className="container-padding">
          <Typography variant="h2" className="section-title fade-in-up">
            Explore Our Academic Categories
          </Typography>
          
          <Typography variant="body1" className="section-description">
            Comprehensive curriculum coverage across all major academic disciplines
          </Typography>
          
          <div className="categories-grid">
            {educationalCategories.map((category, index) => (
              <Fade in={animationTrigger} timeout={600 + index * 100} key={index}>
                <div 
                  className="category-card clickable"
                  onClick={() => navigate(`/category/${category.route}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/category/${category.route}`);
                    }
                  }}
                >
                  <div 
                    className="category-icon"
                    style={{ background: category.gradient }}
                  >
                    {category.icon}
                  </div>
                  <Typography variant="h6" className="category-title">
                    {category.title}
                  </Typography>
                  <Typography variant="body2" className="category-subjects">
                    {category.subjects}
                  </Typography>
                </div>
              </Fade>
            ))}
          </div>
        </Container>
      </section>
      {/* Educational Categories Section */}
      <section id="features" className="categories-section">
        <Container maxWidth="lg" className="container-padding">
          <Typography variant="h2" className="section-title fade-in-up">
            Past Papers
          </Typography>
          
          <Typography variant="body1" className="section-description">
            Comprehensive curriculum coverage across all major academic disciplines
          </Typography>
          
          <div className="categories-grid">
            {pastPaperCategories.map((category, index) => (
              <Fade in={animationTrigger} timeout={600 + index * 100} key={index}>
                <div 
                  className="category-card clickable"
                  onClick={() => navigate(`/${category.route}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/${category.route}`);
                    }
                  }}
                >
                  <div 
                    className="category-icon"
                    style={{ background: category.gradient }}
                  >
                    {category.icon}
                  </div>
                  <Typography variant="h6" className="category-title">
                    {category.title}
                  </Typography>
                  <Typography variant="body2" className="category-subjects">
                    {category.subjects}
                  </Typography>
                </div>
              </Fade>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section id="about" className="benefits-section">
        <Container maxWidth="lg" className="container-padding">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <div className="fade-in-left">
                <Typography variant="h2" className="benefits-title">
                  Why Choose S3Learn?
                </Typography>
                
                <Typography variant="body1" className="benefits-subtitle">
                  Our platform is designed with educators and learners in mind, 
                  providing the tools needed for academic success.
                </Typography>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    Personalized learning paths adapted to individual needs
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    Real-time progress tracking and detailed performance analytics
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    Collaborative learning environment for students and teachers
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    Mobile-responsive design for learning anywhere, anytime
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    Comprehensive curriculum aligned with educational standards
                  </Typography>
                </div>
              </div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grow in={animationTrigger} timeout={1500}>
                <Paper className="cta-paper fade-in-right">
                  <School className="cta-icon" />
                  
                  <Typography variant="h4" className="cta-title">
                    Ready to Transform Learning?
                  </Typography>
                  
                  <Typography variant="body1" className="cta-description">
                    Join thousands of students and educators who are already 
                    experiencing the future of education with S3Learn.
                  </Typography>
                  
                  <Button
                    className="cta-button"
                    onClick={handleLogin}
                    size="large"
                    startIcon={<RocketLaunch />}
                  >
                    Get Started Today
                  </Button>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <Container maxWidth="lg" className="container-padding">
          <Typography variant="h6" className="footer-title">
            <School sx={{ mr: 1 }} />
            S3Learn - Smart Student Success Learning
          </Typography>
          
          <Typography variant="body2" className="footer-text">
            © 2024 S3Learn. Empowering minds, transforming futures through innovative education technology.
          </Typography>
        </Container>
      </footer>
    </>
  );
};

export default LandingPage;