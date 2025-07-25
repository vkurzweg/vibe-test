import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Avatar, 
  Menu,
  MenuItem, 
  Divider, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from '@mui/material/styles';
import { logout } from '../features/auth/authSlice';

export const drawerWidth = 240;

const Main = styled('main', { 
  shouldForwardProp: (prop) => prop !== 'open' 
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: `${drawerWidth}px`,
  }),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'New Request', icon: <AddIcon />, path: '/requests/new' },
    { text: 'My Requests', icon: <ListIcon />, path: '/my-requests' },
  ];

  const adminMenuItems = [
    { text: 'All Requests', icon: <ListIcon />, path: '/admin/requests' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <div>
      <DrawerHeader>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 2 }}>
          NamingOps
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              },
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {user?.role === 'admin' && (
        <>
          <Divider />
          <List>
            <ListItem>
              <Typography variant="subtitle2" color="textSecondary">
                ADMIN
              </Typography>
            </ListItem>
            {adminMenuItems.map((item) => (
              <ListItem 
                key={item.text} 
                component={Link} 
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow }}>
            NamingOps
          </Typography>
          {user ? (
            <div>
              <Button
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                startIcon={
                  <Avatar 
                    alt={user.name} 
                    src={`/static/images/avatar/${user.id || 'default'}.jpg`}
                    sx={{ width: 32, height: 32 }}
                  />
                }
              >
                {user.name}
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={isMobile ? mobileOpen : drawerOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Main open={drawerOpen}>
        <DrawerHeader />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;
