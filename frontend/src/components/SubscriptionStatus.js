import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Quiz,
  CheckCircle,
  Star,
  Upgrade
} from '@mui/icons-material';

const SubscriptionStatus = ({ user, onUpgrade }) => {
  const isFreePlan = user?.subscription_type === 'free';
  const isPremium = user?.subscription_type === 'premium';
  const quizAttemptsUsed = user?.quiz_attempts_used || 0;
  const maxQuizAttempts = user?.max_quiz_attempts || 5;
  const remainingAttempts = Math.max(0, maxQuizAttempts - quizAttemptsUsed);
  const usagePercentage = (quizAttemptsUsed / maxQuizAttempts) * 100;

  const freeFeatures = [
    'Access to 5 practice quizzes',
    'Basic progress tracking',
    'Community support',
    'Mobile app access'
  ];

  const premiumFeatures = [
    'Unlimited quiz attempts',
    'Advanced analytics',
    'Priority support',
    'Offline mode',
    'Custom study plans',
    'Progress reports',
    'Certificate generation'
  ];

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      {/* Current Plan Status */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPremium ? (
                <Star sx={{ color: '#FFD700', fontSize: 28 }} />
              ) : (
                <Star sx={{ color: '#757575', fontSize: 28 }} />
              )}
              <Typography variant="h5" fontWeight="bold">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Typography>
            </Box>
            <Chip
              label={user?.subscription_status || 'Active'}
              color={user?.subscription_status === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Box>

          {isFreePlan && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quiz Usage Limit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: usagePercentage > 80 ? '#f44336' : usagePercentage > 60 ? '#ff9800' : '#4caf50',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 80 }}>
                  {quizAttemptsUsed}/{maxQuizAttempts}
                </Typography>
              </Box>
              
              {remainingAttempts === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You've used all your free quiz attempts. Upgrade to Premium for unlimited access!
                </Alert>
              ) : remainingAttempts <= 2 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Only {remainingAttempts} quiz attempts remaining. Consider upgrading to Premium!
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {remainingAttempts} quiz attempts remaining
                </Typography>
              )}
            </>
          )}

          {isPremium && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <Typography variant="body1" color="success.main" fontWeight="bold">
                Unlimited quiz access activated!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Grid container spacing={2}>
        {/* Free Plan */}
        <Grid item xs={12} md={6}>
          <Card 
            variant={isFreePlan ? "elevation" : "outlined"} 
            elevation={isFreePlan ? 3 : 0}
            sx={{ 
              height: '100%',
              border: isFreePlan ? '2px solid #2196f3' : undefined 
            }}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Star sx={{ fontSize: 40, color: '#757575', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Free Plan
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  $0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Forever
                </Typography>
              </Box>

              <List dense>
                {freeFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>

              {isPremium && (
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  sx={{ mt: 2 }}
                >
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Premium Plan */}
        <Grid item xs={12} md={6}>
          <Card 
            variant={isPremium ? "elevation" : "outlined"} 
            elevation={isPremium ? 3 : 0}
            sx={{ 
              height: '100%',
              border: isPremium ? '2px solid #FFD700' : undefined,
              background: isPremium ? 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)' : undefined
            }}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Star sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Premium Plan
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  $9.99
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per month
                </Typography>
              </Box>

              <List dense>
                {premiumFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>

              {isFreePlan && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Upgrade />}
                  onClick={onUpgrade}
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Upgrade to Premium
                </Button>
              )}
              {isPremium && (
                <Button
                  variant="contained"
                  fullWidth
                  disabled
                  sx={{ mt: 2 }}
                >
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quiz Access Status */}
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quiz Access Status
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Quiz sx={{ fontSize: 40, color: isPremium ? 'success.main' : 'warning.main' }} />
            </Grid>
            <Grid item xs>
              {isPremium ? (
                <Typography variant="body1">
                  🎉 You have <strong>unlimited access</strong> to all quizzes and practice tests!
                </Typography>
              ) : remainingAttempts > 0 ? (
                <Typography variant="body1">
                  You have <strong>{remainingAttempts} quiz attempts</strong> remaining in your free plan.
                </Typography>
              ) : (
                <Typography variant="body1" color="error">
                  You've reached your free quiz limit. Upgrade to continue learning!
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubscriptionStatus;