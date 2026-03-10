import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Avatar,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Notifications,
  Home,
  LocalShipping,
  Favorite,
  Search
} from '@mui/icons-material';

// Custom styles
import '../styles/Header.css';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Mock cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
    
    // Mock notification count
    setNotificationCount(3);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    handleMenuClose();
    navigate('/login');
  };

  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <Person fontSize="small" sx={{ mr: 1 }} /> Profile
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
        <LocalShipping fontSize="small" sx={{ mr: 1 }} /> My Orders
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          <ListItem sx={{ justifyContent: 'center', py: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Quick Commerce
            </Typography>
          </ListItem>
          <Divider />
          <ListItem button component={Link} to="/" onClick={handleMobileMenuToggle}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          {isAuthenticated ? (
            <>
              <ListItem button component={Link} to="/profile" onClick={handleMobileMenuToggle}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button component={Link} to="/orders" onClick={handleMobileMenuToggle}>
                <ListItemIcon>
                  <LocalShipping />
                </ListItemIcon>
                <ListItemText primary="My Orders" />
              </ListItem>
              <ListItem button component={Link} to="/cart" onClick={handleMobileMenuToggle}>
                <ListItemIcon>
                  <Badge badgeContent={cartCount} color="error">
                    <ShoppingCart />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Cart" />
              </ListItem>
              <Divider />
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/login" onClick={handleMobileMenuToggle}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button component={Link} to="/register" onClick={handleMobileMenuToggle}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={scrolled ? 4 : 0}
          className={scrolled ? 'header scrolled' : 'header'}
        >
          <Container>
            <Toolbar disableGutters>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  flexGrow: isMobile ? 1 : 0
                }}
              >
                Quick Commerce
              </Typography>

              {!isMobile && (
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  <Button 
                    component={Link} 
                    to="/" 
                    color="inherit"
                    sx={{ mx: 1 }}
                  >
                    Home
                  </Button>
                  <Button 
                    component={Link} 
                    to="/categories" 
                    color="inherit"
                    sx={{ mx: 1 }}
                  >
                    Categories
                  </Button>
                  <Button 
                    component={Link} 
                    to="/deals" 
                    color="inherit"
                    sx={{ mx: 1 }}
                  >
                    Deals
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated ? (
                  <>
                    <IconButton color="inherit" aria-label="search" sx={{ mr: 1 }}>
                      <Search />
                    </IconButton>
                    <IconButton 
                      component={Link} 
                      to="/cart" 
                      color="inherit" 
                      aria-label="cart"
                      sx={{ mr: 1 }}
                    >
                      <Badge badgeContent={cartCount} color="error">
                        <ShoppingCart />
                      </Badge>
                    </IconButton>
                    <IconButton color="inherit" aria-label="notifications" sx={{ mr: 2 }}>
                      <Badge badgeContent={notificationCount} color="error">
                        <Notifications />
                      </Badge>
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="account"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                        <Person />
                      </Avatar>
                    </IconButton>
                  </>
                ) : (
                  <>
                    {!isMobile && (
                      <>
                        <Button 
                          component={Link} 
                          to="/login" 
                          color="inherit"
                          sx={{ mr: 1 }}
                        >
                          Login
                        </Button>
                        <Button 
                          component={Link} 
                          to="/register" 
                          variant="contained" 
                          color="primary"
                        >
                          Register
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </motion.div>
      {renderMenu}
      {mobileMenu}
      <Toolbar /> {/* Empty toolbar to push content below AppBar */}
    </>
  );
};

export default Header;