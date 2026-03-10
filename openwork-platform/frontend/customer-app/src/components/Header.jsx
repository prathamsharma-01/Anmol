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
import LocationSelector from './LocationSelector';

// Custom styles
import '../styles/Header.css';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Product list for search
  const allProducts = [
    { id: 1, name: "Dr. Oetker FunFoods Peanut Butter Creamy, 375g", category: "Dips & Spreads" },
    { id: 2, name: "Dr. Oetker FunFoods Peanut Butter Crunchy, 375g", category: "Dips & Spreads" },
    { id: 3, name: "Dr. Oetker Funfoods Pasta & Pizza White Sauce", category: "Condiments & Sauces" },
    { id: 4, name: "Dr. Oetker FunFoods Pasta And Pizza Sauce", category: "Condiments & Sauces" },
    { id: 5, name: "Dr. Oetker FunFoods Tandoori Mayonnaise", category: "Condiments & Sauces" },
    { id: 6, name: "Dr.Oetker Funfoods Cheese Chilli Sandwich Spread", category: "Dips & Spreads" },
    { id: 7, name: "Fresh Organic Apples", category: "Fruits & Vegetables" },
    { id: 8, name: "Whole Wheat Bread", category: "Dairy, Bread & Eggs" }
  ];

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

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    setLocationSelectorOpen(false);
    // Save to localStorage for persistence
    localStorage.setItem('selectedLocation', JSON.stringify(location));
  };

  const openLocationSelector = () => {
    setLocationSelectorOpen(true);
  };

  // Load saved location on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setCurrentLocation(JSON.parse(savedLocation));
    }
  }, []);

  const getLocationDisplayText = () => {
    if (!currentLocation) return 'Select Location';
    
    if (currentLocation.type === 'current') {
      return 'Current Location';
    }
    
    // Truncate long addresses for display
    const title = currentLocation.title;
    return title.length > 20 ? `${title.substring(0, 17)}...` : title;
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Filter products based on search query
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleSearchSelect = (product) => {
    console.log('Selected product:', product);
    // Navigate to home and show that product was selected
    navigate('/');
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    // Optionally show a toast/alert
    alert(`You selected: ${product.name}\n\nThis would add to cart or show product details.`);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
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
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
          mt: 0.5,
          minWidth: 180,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <Person fontSize="small" sx={{ mr: 1 }} /> Profile
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
        <LocalShipping fontSize="small" sx={{ mr: 1 }} /> My Orders
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: '#dc2626' }}>
        Logout
      </MenuItem>
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
          <ListItem button onClick={() => { openLocationSelector(); handleMobileMenuToggle(); }}>
            <ListItemIcon>
              📍
            </ListItemIcon>
            <ListItemText 
              primary="Location" 
              secondary={getLocationDisplayText()}
            />
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
                  color: '#dc2626',
                  textDecoration: 'none',
                  flexGrow: isMobile ? 1 : 0
                }}
              >
                QuikRy
              </Typography>

              {/* Location Selector */}
              {!isMobile && (
                <Button
                  onClick={openLocationSelector}
                  sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'inherit',
                    textTransform: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#dc2626'
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#666', lineHeight: 1 }}>
                      Deliver to
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>
                      {getLocationDisplayText()}
                    </Typography>
                  </Box>
                  <span style={{ fontSize: '12px', marginLeft: '4px' }}>▼</span>
                </Button>
              )}

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
                    <IconButton 
                      color="inherit" 
                      aria-label="search" 
                      sx={{ mr: 1 }}
                      onClick={handleSearchToggle}
                    >
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
                      sx={{ p: 0.5 }}
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

      {/* Search Box */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            zIndex: 1199,
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '20px'
          }}
        >
          <Container>
            <Box sx={{ position: 'relative' }}>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />              {searchResults.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1
                  }}
                >
                  {searchResults.map((product) => (
                    <Box
                      key={product.id}
                      onClick={() => handleSearchSelect(product)}
                      sx={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        '&:hover': {
                          background: '#f9f9f9'
                        },
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {product.category}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              {searchQuery && searchResults.length === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '20px',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    No products found for "{searchQuery}"
                  </Typography>
                </Box>
              )}
            </Box>
          </Container>
        </motion.div>
      )}

      {renderMenu}
      {mobileMenu}
      <LocationSelector
        isOpen={locationSelectorOpen}
        onClose={() => setLocationSelectorOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation}
      />
      <Toolbar /> {/* Empty toolbar to push content below AppBar */}
    </>
  );
};

export default Header;