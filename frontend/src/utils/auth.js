// Authentication utility functions

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Token management
export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// User data management
export const setUserData = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

// Get authorization header for API calls
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper with authentication
export const authenticatedFetch = async (url, options = {}) => {
  const authHeader = getAuthHeader();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  });

  // If token is invalid, clear auth data
  if (response.status === 401 || response.status === 403) {
    removeAuthToken();
    removeUserData();
    window.location.href = '/';
  }

  return response;
};

// Verify token with backend
export const verifyToken = async () => {
  try {
    const response = await authenticatedFetch('http://52.23.173.216:5050/api/auth/verify');
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Login function
export const login = async (username, password) => {
  try {
    const response = await fetch('http://52.23.173.216:5050/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setAuthToken(data.token);
      setUserData(data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
};

// Register function for students
export const register = async (userData) => {
  try {
    const response = await fetch('http://52.23.173.216:5050/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setAuthToken(data.token);
      setUserData(data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error' };
  }
};

// Logout function
export const logout = async () => {
  try {
    await authenticatedFetch('http://52.23.173.216:5050/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeAuthToken();
    removeUserData();
    window.location.href = '/';
  }
};
