import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../app/store';
import { fetchNameRequests } from '../nameRequests/nameRequestSlice';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { 
    nameRequests, 
    loading, 
    stats,
    currentUser 
  } = useSelector((state: RootState) => ({
    nameRequests: state.nameRequests.nameRequests.slice(0, 5), // Get only the first 5 requests
    loading: state.nameRequests.loading,
    stats: state.nameRequests.stats,
    currentUser: state.auth.user
  }));

  useEffect(() => {
    // Fetch name requests when component mounts
    dispatch(fetchNameRequests({}));
  }, [dispatch]);

  const handleCreateNew = () => {
    navigate('/requests/new');
  };

  const handleViewAll = () => {
    navigate('/my-requests');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.name || 'User'}!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New Name Request
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Requests"
            value={stats?.total || 0}
            icon={<AssignmentIcon fontSize="large" />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/my-requests')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved"
            value={stats?.approved || 0}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#4caf50"
            onClick={() => navigate('/my-requests?status=approved')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon={<PendingIcon fontSize="large" />}
            color={theme.palette.warning.main}
            onClick={() => navigate('/my-requests?status=pending')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected"
            value={stats?.rejected || 0}
            icon={<ErrorIcon fontSize="large" />}
            color={theme.palette.error.main}
            onClick={() => navigate('/my-requests?status=rejected')}
          />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Recent Name Requests
              </Typography>
              <Button 
                color="primary" 
                onClick={handleViewAll}
                disabled={nameRequests.length === 0}
              >
                View All
              </Button>
            </Box>
            
            {nameRequests.length > 0 ? (
              <Box>
                {nameRequests.map((request, index) => (
                  <Box key={request._id} mb={2}>
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center"
                      sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          cursor: 'pointer',
                        } 
                      }}
                      onClick={() => navigate(`/requests/${request._id}`)}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {request.requestedName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.domain} • {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: request.status === 'approved' 
                              ? 'success.light' 
                              : request.status === 'rejected'
                                ? 'error.light'
                                : 'warning.light',
                            color: 'white',
                            fontWeight: 'medium',
                            textTransform: 'capitalize'
                          }}
                        >
                          {request.status}
                        </Typography>
                      </Box>
                    </Box>
                    {index < nameRequests.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight={200}
                textAlign="center"
              >
                <AssignmentIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No name requests yet
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Get started by creating your first name request
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                >
                  Create Request
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                New Name Request
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/my-requests')}
              >
                View My Requests
              </Button>
              {currentUser?.role === 'admin' && (
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/admin/requests')}
                >
                  Manage All Requests
                </Button>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/help')}
              >
                Help & Documentation
              </Button>
            </Box>

            <Box mt={4}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Need Help?
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Check out our documentation or contact support if you have any questions about the naming process.
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                size="small"
                onClick={() => navigate('/help')}
              >
                View Documentation
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
