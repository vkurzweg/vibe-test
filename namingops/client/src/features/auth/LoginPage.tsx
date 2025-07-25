import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper, Avatar, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login, googleAuth } from '../../services/api';
import { loginStart, loginSuccess, loginFailure, clearError } from './authSlice';
import { RootState } from '../../app/store';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
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
    googleAuth();
  };

  const handleDemoLogin = async (role: 'submitter' | 'reviewer' | 'admin') => {
    try {
      dispatch(loginStart());
      // This is just for demo purposes
      const demoCredentials = {
        submitter: { email: 'submitter@example.com', password: 'demo123' },
        reviewer: { email: 'reviewer@example.com', password: 'demo123' },
        admin: { email: 'admin@example.com', password: 'demo123' },
      }[role];

      const response = await login(demoCredentials);
      const { user, token } = response.data;
      
      dispatch(loginSuccess({ user, token }));
      navigate(from, { replace: true });
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
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

        <Box component={Paper} elevation={3} sx={{ p: 3, mt: 3, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ mt: 1, mb: 2 }}
          >
            Sign in with Google
          </Button>

          <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 2 }}>
            OR
          </Typography>

          <Typography variant="subtitle1" align="center" gutterBottom>
            Demo Accounts:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDemoLogin('submitter')}
                disabled={loading}
              >
                Submitter
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDemoLogin('reviewer')}
                disabled={loading}
              >
                Reviewer
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                Admin
              </Button>
            </Grid>
          </Grid>
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
