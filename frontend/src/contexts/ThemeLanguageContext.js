import React, { createContext, useContext, useState, useEffect } from 'react';

// Create contexts
const ThemeLanguageContext = createContext();

// Custom hook to use the context
export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};

// Language translations
const translations = {
  en: {
    // Navigation
    home: 'Home',
    grades: 'Grades',
    subjects: 'Subjects',
    pastPapers: 'PP',
    about: 'About',
    contact: 'Contact',
    // getStarted: 'Get Started',
    
    // Hero Section
    welcomeTo: 'Welcome to',
    empoweringEducation: 'Empowering Education Through Technology',
    studySolveSucceed: 'Study-Solve-Succeed',
    startLearning: 'Start Learning',
    learnMore: 'Learn More',
    
    // Teachers Section
    featuredTeachers: 'Featured Teachers',
    teachersDescription: '',
    teacher: 'Teacher',
    reviews: 'reviews',
    call: 'Call',
    email: 'Email',
    viewAllTeachers: 'View All Teachers',
    
    // Categories Section
    exploreCategories: 'Explore Our Academic Categories',
    categoriesDescription: 'Comprehensive curriculum coverage across all major academic disciplines',
    
    // Past Papers Section
    pastPapersSection: 'Past Papers',
    
    // Benefits Section
    whyChoose: 'Why Choose S3Learn?',
    benefitsDescription: 'Our platform is designed with educators and learners in mind, providing the tools needed for academic success.',
    personalizedLearning: 'Personalized learning paths adapted to individual needs',
    realTimeTracking: 'Real-time progress tracking and detailed performance analytics',
    collaborativeLearning: 'Collaborative learning environment for students and teachers',
    mobileResponsive: 'Mobile-responsive design for learning anywhere, anytime',
    comprehensiveCurriculum: 'Comprehensive curriculum aligned with educational standards',
    
    // CTA Section
    readyToTransform: 'Ready to Transform Learning?',
    ctaDescription: 'Join thousands of students and educators who are already experiencing the future of education with S3Learn.',
    getStartedToday: 'Get Started Today',
    
    // Footer
    footerDescription: 'Empowering minds, transforming futures through innovative education technology.',
    
    // Categories
    grade5Scholarship: 'Grade 5 Scholarship',
    gceOL: 'GCE O/L',
    gceAL: 'GCE A/L',
    
    // Subjects
    mathematics: 'Mathematics',
    english: 'English',
    environment: 'Environment',
    buddhism: 'Buddhism',
    science: 'Science',
    sinhala: 'Sinhala',
    history: 'History',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    commerce: 'Commerce',
    
    // Theme & Language
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode'
  },
  si: {
    // Navigation
    home: 'මුල් පිටුව',
    grades: 'ශ්‍රේණි',
    subjects: 'විෂයයන්',
    pastPapers: 'පැරණි ප්‍රශ්න පත්‍ර',
    about: 'අප ගැන',
    contact: 'සම්බන්ධ වන්න',
    getStarted: 'ආරම්භ කරන්න',
    
    // Hero Section
    welcomeTo: 'සාදරයෙන් පිළිගන්නවා',
    empoweringEducation: 'තාක්ෂණය හරහා අධ්‍යාපනය සවිබල ගැන්වීම',
    studySolveSucceed: 'අධ්‍යයනය-විසඳුම්-සාර්ථකත්වය',
    startLearning: 'ඉගෙනීම ආරම්භ කරන්න',
    learnMore: 'තව දැනගන්න',
    
    // Teachers Section
    featuredTeachers: 'විශේෂ ගුරුවරු',
    teachersDescription: 'පුද්ගලික අධ්‍යාපනය සඳහා පළපුරුදු සහ සුදුසුකම් ලත් ගුරුවරුන් සමඟ සම්බන්ධ වන්න',
    teacher: 'ගුරුවරයා',
    reviews: 'සමාලෝචන',
    call: 'අමතන්න',
    email: 'ඊමේල්',
    viewAllTeachers: 'සියලුම ගුරුවරුන් බලන්න',
    
    // Categories Section
    exploreCategories: 'අපගේ ශාස්ත්‍රීය කාණ්ඩ ගවේෂණය කරන්න',
    categoriesDescription: 'සියලුම ප්‍රධාන ශාස්ත්‍රීය විෂයයන් සඳහා පුළුල් විෂය කුසලතා ආවරණය',
    
    // Past Papers Section
    pastPapersSection: 'පැරණි ප්‍රශ්න පත්‍ර',
    
    // Benefits Section
    whyChoose: 'ඇයි S3Learn තෝරා ගන්නේ?',
    benefitsDescription: 'අපගේ වේදිකාව අධ්‍යාපකයින් සහ ඉගෙනුම්කරුවන් මනසේ තබාගෙන නිර්මාණය කර ඇති අතර, ශාස්ත්‍රීය සාර්ථකත්වය සඳහා අවශ්‍ය මෙවලම් සපයයි.',
    personalizedLearning: 'පුද්ගලික අවශ්‍යතාවන්ට අනුකූල පුද්ගලික ඉගෙනුම් මාර්ග',
    realTimeTracking: 'තත්‍ය කාලීන ප්‍රගති ඉලක්ක කිරීම සහ සවිස්තරාත්මක කාර්ය සාධන විශ්ලේෂණ',
    collaborativeLearning: 'සිසුන් සහ ගුරුවරුන් සඳහා සහයෝගිතා ඉගෙනුම් පරිසරය',
    mobileResponsive: 'ඕනෑම තැනක, ඕනෑම වේලාවක ඉගෙනීම සඳහා ජංගම-ප්‍රතිචාරාත්මක නිර්මාණය',
    comprehensiveCurriculum: 'අධ්‍යාපන ප්‍රමිතීන් සමඟ සම්බන්ධ කර ඇති පුළුල් විෂය මාලාව',
    
    // CTA Section
    readyToTransform: 'ඉගෙනීම පරිවර්තනය කිරීමට සූදානම්ද?',
    ctaDescription: 'S3Learn සමඟ අධ්‍යාපනයේ අනාගතය දැනටමත් අත්විඳින සිසුන් සහ අධ්‍යාපකයින් දහස් ගණනකට එකතු වන්න.',
    getStartedToday: 'අදම ආරම්භ කරන්න',
    
    // Footer
    footerDescription: 'නව්‍ය අධ්‍යාපන තාක්ෂණය හරහා මනස් සවිබල ගැන්වීම, අනාගතය පරිවර්තනය කිරීම.',
    
    // Categories
    grade5Scholarship: '5 ශ්‍රේණිය ශිෂ්‍යත්වය',
    gceOL: 'සා.පෙ.ස. (සාමාන්‍ය)',
    gceAL: 'සා.පෙ.ස. (උසස්)',
    
    // Subjects
    mathematics: 'ගණිතය',
    english: 'ඉංග්‍රීසි',
    environment: 'පරිසරය',
    buddhism: 'බුද්ධ ධර්මය',
    science: 'විද්‍යාව',
    sinhala: 'සිංහල',
    history: 'ඉතිහාසය',
    physics: 'භෞතික විද්‍යාව',
    chemistry: 'රසායන විද්‍යාව',
    biology: 'ජීව විද්‍යාව',
    commerce: 'වාණිජ්‍ය',
    
    // Theme & Language
    language: 'භාෂාව',
    theme: 'තේමාව',
    lightMode: 'ආලෝක ප්‍රකාරය',
    darkMode: 'අඳුරු ප්‍රකාරය'
  }
};

// Theme and Language Provider Component
export const ThemeLanguageProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Change language
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Get translated text
  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    theme,
    language,
    toggleTheme,
    changeLanguage,
    t,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeLanguageContext.Provider value={value}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export default ThemeLanguageContext;