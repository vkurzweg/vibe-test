import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box, Typography } from '@mui/material';

const PrivateRoute = ({ roles, children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setAuthorized(false);
      } else if (roles && user) {
        setAuthorized(roles.includes(user.role));
      } else {
        setAuthorized(true);
      }
    }
  }, [isAuthenticated, loading, roles, user]);

  if (loading || authorized === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authorized === false) {
    // User is authenticated but not authorized for this route
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
      >
        <Typography variant="h4" color="error" gutterBottom>
          403 Forbidden
        </Typography>
        <Typography variant="body1">
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
