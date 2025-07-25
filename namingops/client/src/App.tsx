import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Layout from './components/Layout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NameRequestForm from './features/nameRequests/NameRequestForm';
import NameRequestList from './features/nameRequests/NameRequestList';
import NameRequestDetails from './features/nameRequests/NameRequestDetails';
import PrivateRoute from './components/PrivateRoute';
import { loadUser } from './features/auth/authSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  // Load user from localStorage if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(loadUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="requests">
                <Route index element={<NameRequestList />} />
                <Route path="new" element={<NameRequestForm />} />
                <Route path=":id" element={<NameRequestDetails />} />
                <Route path=":id/edit" element={<NameRequestForm editMode />} />
              </Route>
              <Route path="my-requests" element={<NameRequestList myRequests />} />
              
              {/* Admin Routes */}
              <Route
                path="admin/requests"
                element={
                  <PrivateRoute roles={['admin', 'reviewer']}>
                    <NameRequestList adminView />
                  </PrivateRoute>
                }
              />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
