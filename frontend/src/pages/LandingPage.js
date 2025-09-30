import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Avatar,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Fade,
  Grow,
  Box
} from '@mui/material';
import {
  School,
  CheckCircle,
  RocketLaunch,
  Menu as MenuIcon,
  Close as CloseIcon,
  Science,
  Calculate,
  Language,
  Sports,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import TeacherCarousel from '../components/TeacherCarousel';
import UserProfileDropdown from '../components/UserProfileDropdown';
import './LandingPage.css';

const LandingPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  
  // Use theme and language context
  const { language, toggleTheme, changeLanguage, t, isDark } = useThemeLanguage();

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
    { label: t('home'), href: '#home', active: true },
    { label: t('grades'), href: '#grades' },
    { label: t('subjects'), href: '#subjects' },
    { label: t('pastPapers'), href: '#features' },
    { label: t('about'), href: '#about' },
    { label: t('contact'), href: '#contact' }
  ];

  // Educational categories with subjects
  const educationalCategories = [
    {
      title: t('grade5Scholarship'),
      icon: <Calculate />,
      subjects: `${t('mathematics')}, ${t('english')}, ${t('environment')}, ${t('buddhism')}`,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: 'grade-5-scholarship'
    },
    {
      title: t('gceOL'),
      icon: <Science />,
      subjects: `${t('mathematics')}, ${t('science')}, ${t('english')}, ${t('sinhala')}, ${t('history')}`,
      gradient: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      route: 'gce-ol'
    },
    {
      title: t('gceAL'),
      icon: <Language />,
      subjects: `${t('mathematics')}, ${t('physics')}, ${t('chemistry')}, ${t('biology')}, ${t('commerce')}`,
      gradient: 'linear-gradient(135deg, #dd6b20 0%, #f56500 100%)',
      route: 'gce-al'
    }
  ];
 // Past paper categories with subjects
  const pastPaperCategories = [
    {
      title: t('grade5Scholarship'),
      icon: <Calculate />,
      subjects: `${t('mathematics')}, ${t('english')}, ${t('environment')}, ${t('buddhism')}`,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: 'past-papers/grade-5-scholarship'
    },
    {
      title: t('gceOL'),
      icon: <Science />,
      subjects: `${t('mathematics')}, ${t('science')}, ${t('english')}, ${t('sinhala')}, ${t('history')}`,
      gradient: 'linear-gradient(135deg, #38a169 0%, #4fd1c7 100%)',
      route: 'past-papers/gce-ol'
    },
    {
      title: t('gceAL'),
      icon: <Language />,
      subjects: `${t('mathematics')}, ${t('physics')}, ${t('chemistry')}, ${t('biology')}, ${t('commerce')}`,
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
              
              {/* Theme and Language Controls */}
              <div className="nav-controls">
                {/* Language Dropdown */}
                <div className="language-dropdown">
                  <select 
                    className="language-select"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    aria-label={t('language')}
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                  </select>
                </div>
                
                {/* Theme Toggle */}
                <button 
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={isDark ? t('lightMode') : t('darkMode')}
                  title={isDark ? t('lightMode') : t('darkMode')}
                >
                  {isDark ? <LightMode /> : <DarkMode />}
                </button>
              </div>
              
              {/* Show User Profile or Login Button */}
              {user ? (
                <UserProfileDropdown user={user} onLogout={onLogout} />
              ) : (
                <Button 
                  // className="nav-cta"
                  // onClick={handleLogin}
                  // disableRipple
                >
                  {/* {t('getStarted')} */}
                </Button>
              )}
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
            
            {/* Mobile Theme and Language Controls */}
            <div className="nav-controls" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              <div className="language-dropdown">
                <select 
                  className="language-select"
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  aria-label={t('language')}
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල</option>
                </select>
              </div>
              
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={isDark ? t('lightMode') : t('darkMode')}
                title={isDark ? t('lightMode') : t('darkMode')}
              >
                {isDark ? <LightMode /> : <DarkMode />}
              </button>
            </div>
            
            {/* Show User Profile or Login Button in Mobile */}
            {user ? (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <UserProfileDropdown user={user} onLogout={onLogout} />
              </Box>
            ) : (
              <Button 
                className="nav-cta"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogin();
                }}
                fullWidth
                sx={{ mt: 2 }}
              >
                {t('getStarted')}
              </Button>
            )}
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
                {t('welcomeTo')} <span className="hero-brand-text">S3Learn</span>
              </Typography>
              
              <Typography variant="h4" className="hero-subtitle">
                {t('empoweringEducation')}
              </Typography>
              
              <Typography variant="h4" className="hero-brand-text">
                {t('studySolveSucceed')}
              </Typography>
              
              <div className="hero-buttons">
                <Button
                  className="get-started-btn"
                  onClick={handleLogin}
                  size="large"
                  startIcon={<RocketLaunch />}
                >
                  {t('startLearning')}
                </Button>
                <Button
                  className="learn-more-btn"
                  size="large"
                  startIcon={<School />}
                >
                  {t('learnMore')}
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
            {t('featuredTeachers')}
          </Typography>
          
          {/* <Typography variant="body1" className="section-description">
            {t('teachersDescription')}
          </Typography>
           */}
          <TeacherCarousel 
            teachers={featuredTeachers} 
            animationTrigger={animationTrigger}
          />
          
          {/* View All Teachers Button */}
          <Box textAlign="center" mt={6}>
            <Button
              variant="contained"
              size="large"
              className="view-all-teachers-btn"
              onClick={() => navigate('/teachers')}
            >
              {t('viewAllTeachers')}
            </Button>
          </Box>
        </Container>
      </section>

      {/* Educational Categories Section */}
      <section id="subjects" className="categories-section">
        <Container maxWidth="lg" className="container-padding">
          <Typography variant="h2" className="section-title fade-in-up">
            {t('exploreCategories')}
          </Typography>
          
          <Typography variant="body1" className="section-description">
            {t('categoriesDescription')}
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
            {t('pastPapersSection')}
          </Typography>
          
          <Typography variant="body1" className="section-description">
            {t('categoriesDescription')}
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
                  {t('whyChoose')}
                </Typography>
                
                <Typography variant="body1" className="benefits-subtitle">
                  {t('benefitsDescription')}
                </Typography>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    {t('personalizedLearning')}
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    {t('realTimeTracking')}
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    {t('collaborativeLearning')}
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    {t('mobileResponsive')}
                  </Typography>
                </div>
                
                <div className="benefit-item">
                  <CheckCircle className="benefit-icon" />
                  <Typography className="benefit-text">
                    {t('comprehensiveCurriculum')}
                  </Typography>
                </div>
              </div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grow in={animationTrigger} timeout={1500}>
                <Paper className="cta-paper fade-in-right">
                  <School className="cta-icon" />
                  
                  <Typography variant="h4" className="cta-title">
                    {t('readyToTransform')}
                  </Typography>
                  
                  <Typography variant="body1" className="cta-description">
                    {t('ctaDescription')}
                  </Typography>
                  
                  <Button
                    className="cta-button"
                    onClick={handleLogin}
                    size="large"
                    startIcon={<RocketLaunch />}
                  >
                    {t('getStartedToday')}
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
            © 2024 S3Learn. {t('footerDescription')}
          </Typography>
        </Container>
      </footer>
    </>
  );
};

export default LandingPage;