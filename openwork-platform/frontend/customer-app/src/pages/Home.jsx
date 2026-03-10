import React from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="home-container"
    >
      <div className="hero-section">
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography variant="h2" component="h1" className="hero-title">
                  Quick Commerce
                </Typography>
                <Typography variant="h5" className="hero-subtitle">
                  Shop smarter, faster, and easier
                </Typography>
                <Typography variant="body1" className="hero-description">
                  Discover thousands of products with fast delivery and secure checkout.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  className="shop-now-btn"
                  onClick={() => navigate('/products')}
                >
                  Shop Now
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hero-image-container"
              >
                <div className="hero-image-placeholder">
                  <Typography variant="h3">Quick Commerce</Typography>
                </div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </div>

      <Container className="features-section">
        <Typography variant="h4" component="h2" className="section-title" align="center">
          Why Choose Us
        </Typography>
        
        <Grid container spacing={4} className="mt-4">
          {[
            { title: 'Fast Delivery', description: 'Get your products delivered within 24 hours' },
            { title: 'Secure Payments', description: 'Multiple secure payment options for your convenience' },
            { title: 'Quality Products', description: 'All products are quality checked before shipping' },
            { title: '24/7 Support', description: 'Customer support available round the clock' }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                whileHover={{ y: -10 }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Paper elevation={2} className="feature-card">
                  <div className="feature-icon-placeholder"></div>
                  <Typography variant="h6" className="feature-title">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="feature-description">
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <div className="cta-section">
        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Typography variant="h4" component="h2" align="center" className="cta-title">
              Ready to start shopping?
            </Typography>
            <div className="cta-buttons">
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>
    </motion.div>
  );
};

export default Home;