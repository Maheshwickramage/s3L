import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Person,
  AccountCircle,
  Settings,
  Logout,
  Star,
  School,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserProfileDropdown = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    onLogout();
    handleClose();
  };

  const getInitials = (name) => {
    if (!name) return user.username?.charAt(0)?.toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    return user.student_name || user.username || 'User';
  };

  const getUserRole = () => {
    return user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1) || 'Student';
  };

  const getSubscriptionStatus = () => {
    return user.subscription_type || 'Free';
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'white',
          textTransform: 'none',
          padding: '8px 12px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '14px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {getInitials(getDisplayName())}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {getDisplayName()}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>
            {getUserRole()}
          </Typography>
        </Box>
        <KeyboardArrowDown sx={{ fontSize: 16, opacity: 0.7 }} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 250,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {getInitials(getDisplayName())}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {getDisplayName()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={getUserRole()}
                  size="small"
                  color={user.role === 'teacher' ? 'primary' : 'secondary'}
                  sx={{ fontSize: '10px', height: 18 }}
                />
                <Chip
                  label={getSubscriptionStatus()}
                  size="small"
                  color={getSubscriptionStatus() === 'Premium' ? 'success' : 'default'}
                  sx={{ fontSize: '10px', height: 18 }}
                  icon={getSubscriptionStatus() === 'Premium' ? <Star sx={{ fontSize: '12px' }} /> : undefined}
                />
              </Box>
              {user.student_email && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {user.student_email}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Menu Items */}
        <MenuItem onClick={handleViewProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="View Profile" 
            secondary="Manage your account settings"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        {user.role === 'teacher' && (
          <MenuItem onClick={() => navigate('/teacherDashboard')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <School fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Teacher Dashboard" 
              secondary="Manage classes and students"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        )}

        {user.role === 'student' && (
          <MenuItem onClick={() => navigate('/studentDashboard')} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Student Dashboard" 
              secondary="View your progress"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        )}

        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            secondary="Preferences and privacy"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Sign Out" 
            secondary="Log out of your account"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfileDropdown;