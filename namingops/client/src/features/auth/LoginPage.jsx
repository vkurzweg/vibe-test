import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper, Avatar, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { authAPI } from '../../services/api';
import { loginStart, loginSuccess, loginFailure, clearError } from './authSlice';
import { User } from './authSlice';
import { RootState } from '../../app/store';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleGoogleLogin = () => {
    dispatch(loginStart());
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // Define types for API responses and errors
  
  
  ;
    };
    message;
  }

  const handleDemoLogin = async (role: 'submitter' | 'reviewer' | 'admin') => {
    try {
      dispatch(loginStart());
      const demoCredentials = {
        submitter: { email: 'submitter@example.com', password: 'demo123' },
        reviewer: { email: 'reviewer@example.com', password: 'demo123' },
        admin: { email: 'admin@example.com', password: 'demo123' },
      }[role];

      const response = await authAPI.login({
        email: demoCredentials.email,
        password: demoCredentials.password,
      }) data };
      
      if (response?.data) {
        const { user, token } = response.data;
        dispatch(loginSuccess({ user, token }));
        navigate(from, { replace });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error && typeof error === 'object') {
        const apiError = error<ApiError>;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in to NamingOps
        </Typography>
        
        {error && (
          <Box mt={2} width="100%">
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        <Box component={Paper} elevation={3} sx={{ p, mt, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ mt, mb }}
          >
            Sign in with Google
          </Button>

          <Typography variant="body2" color="textSecondary" align="center" sx={{ my }}>
            OR
          </Typography>

          <Typography variant="subtitle1" align="center" gutterBottom>
            Demo Accounts:
          </Typography>
          
          <Box sx={{ display: 'flex', gap, flexDirection: { xs: 'column', sm: 'row' }, mt }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDemoLogin('submitter')}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Submitter
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDemoLogin('reviewer')}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Reviewer
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Admin
            </Button>
          </Box>
        </Box>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            NamingOps - Streamline your naming process
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
