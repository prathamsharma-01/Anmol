import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import googleIcon from '../../assets/icons/google.svg';
import appleIcon from '../../assets/icons/apple.svg';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Set current time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login with:', mobileNumber, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--split">
        <div className="auth-visual" aria-hidden>
          <div className="visual-inner">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="140" height="140" rx="20" fill="#fff0f0" />
              <circle cx="70" cy="48" r="24" fill="#ffdede" />
            </svg>
            <h3>Welcome back!</h3>
            <p>Fast, convenient grocery delivery — login to continue.</p>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-header">
            <div className="time">{currentTime}</div>
            <h2>Login</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter your mobile number</label>
            <div className="input-group" style={{"--i": 1}}>
              <div className="country-code">+91</div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="9123456789"
                required
              />
              <div className="input-icon">
                <i className="info-icon">i</i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Enter your password</label>
            <div className="input-group" style={{"--i": 2}}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div 
                className="input-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className="eye-icon">{showPassword ? "👁️" : "👁️‍🗨️"}</i>
              </div>
            </div>
            <div className="forgot-password">
              <button type="button" onClick={() => console.log('Forgot password clicked')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline'}}>Forgot password?</button>
            </div>
          </div>

          <button type="submit" className="auth-button">Login</button>
          </form>

          <div className="auth-footer">
          <div className="auth-divider">
            <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
          </div>

          <div className="social-login">
            <p>or continue with</p>
            <div className="social-buttons">
              <button className="social-button google" style={{"--i": 1}}>
                <img src={googleIcon} alt="Google" />
                <span>Continue with Google</span>
              </button>
              <button className="social-button apple" style={{"--i": 2}}>
                <img src={appleIcon} alt="Apple" />
                <span>Continue with Apple</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;