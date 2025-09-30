import React from 'react';
import Slider from 'react-slick';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Chip,
  Grow
} from '@mui/material';
import {
  Person,
  Star,
  AccessTime,
  LocationOn,
  Phone,
  Email,
  Verified
} from '@mui/icons-material';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './TeacherCarousel.css';

const TeacherCarousel = ({ teachers, animationTrigger }) => {
  const { t } = useThemeLanguage();

  // Custom arrow components
  const CustomPrevArrow = ({ onClick }) => (
    <button className="carousel-arrow carousel-prev" onClick={onClick}>
      <span>‹</span>
    </button>
  );

  const CustomNextArrow = ({ onClick }) => (
    <button className="carousel-arrow carousel-next" onClick={onClick}>
      <span>›</span>
    </button>
  );

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="teacher-carousel-container">
      <Slider {...settings}>
        {teachers.map((teacher, index) => (
          <div key={teacher.id} className="carousel-slide">
            <Grow in={animationTrigger} timeout={800 + index * 100}>
              <Card className="teacher-card compact">
                <CardContent className="teacher-content compact">
                  {/* Teacher Avatar and Verification */}
                  <Box className="teacher-header compact">
                    <Avatar 
                      className="teacher-avatar compact"
                      sx={{ background: teacher.gradient }}
                    >
                      <Person sx={{ fontSize: '1.5rem', color: 'white' }} />
                    </Avatar>
                    {teacher.verified && (
                      <Verified className="verification-badge compact" />
                    )}
                  </Box>
                  
                  {/* Teacher Info */}
                  <Typography variant="h6" className="teacher-name compact">
                    {teacher.name}
                  </Typography>
                  
                  <Typography variant="body2" className="teacher-subject compact">
                    {teacher.subject} {t('teacher')}
                  </Typography>
                  
                  {/* Rating */}
                  <Box className="rating-section compact">
                    <Box className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`star ${i < Math.floor(teacher.rating) ? 'filled' : ''}`}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" className="rating-text">
                      {teacher.rating} ({teacher.reviews} {t('reviews')})
                    </Typography>
                  </Box>
                  
                  {/* Experience and Location */}
                  <Box className="teacher-details compact">
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
                  <Box className="specialties compact">
                    {teacher.specialties.slice(0, 2).map((specialty, idx) => (
                      <Chip 
                        key={idx}
                        label={specialty}
                        size="small"
                        className="specialty-chip compact"
                      />
                    ))}
                  </Box>
                  
                  {/* Price */}
                  <Typography variant="h6" className="teacher-price compact">
                    {teacher.price}
                  </Typography>
                  
                  {/* Action Buttons */}
                  <Box className="teacher-actions compact">
                    <Button 
                      variant="contained" 
                      size="small"
                      className="contact-btn compact"
                      startIcon={<Phone />}
                      onClick={() => window.open(`tel:${teacher.contact.phone}`)}
                    >
                      {t('call')}
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      className="email-btn compact"
                      startIcon={<Email />}
                      onClick={() => window.open(`mailto:${teacher.contact.email}`)}
                    >
                      {t('email')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TeacherCarousel;