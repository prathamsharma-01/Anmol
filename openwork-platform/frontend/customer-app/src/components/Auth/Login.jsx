import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { validatePassword } from '../../utils/passwordValidation.js';

const Login = () => {
  const [loginId, setLoginId] = useState(''); // Changed from mobileNumber to loginId
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState('email'); // Track whether user is typing email or phone
  const navigate = useNavigate();

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

  // Detect if user is typing email or phone number
  const handleLoginIdChange = (e) => {
    const value = e.target.value;
    setLoginId(value);
    
    // Auto-detect input type based on content
    if (value.includes('@')) {
      setInputType('email');
    } else if (/^\d+$/.test(value.replace(/\s/g, ''))) {
      setInputType('phone');
    } else {
      setInputType('email'); // Default to email
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!loginId || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Validate email format if it looks like an email
    if (inputType === 'email' && loginId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginId)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
    }

    // Validate phone format if it looks like a phone number
    if (inputType === 'phone' && !/^\d{10}$/.test(loginId)) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    // Validate password format (for security feedback)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet security requirements. ' + passwordValidation.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: loginId, // Send as loginId instead of phone
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('quikry_user', JSON.stringify(data.user));
        console.log('Login successful:', data.user);
        alert('Login successful! Welcome ' + data.user.name);
        // Redirect to home page or previous page
        window.location.href = '/';
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
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
            <p>Fast, convenient grocery delivery — login with email or phone to continue.</p>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-header">
            <div className="time">{currentTime}</div>
            <h2>Login</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{
              color: '#e74c3c',
              backgroundColor: '#fdf2f2',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label>Enter your email or phone number</label>
            <div className="input-group" style={{"--i": 1}}>
              {inputType === 'phone' && (
                <div className="country-code">+91</div>
              )}
              <input
                type={inputType === 'email' ? 'email' : 'tel'}
                value={loginId}
                onChange={handleLoginIdChange}
                placeholder={inputType === 'email' ? 'example@email.com' : '9123456789'}
                required
                disabled={isLoading}
              />
              <div className="input-icon">
                <i className="info-icon" title={inputType === 'email' ? 'Enter your email address' : 'Enter your phone number'}>
                  {inputType === 'email' ? '📧' : '📱'}
                </i>
              </div>
            </div>
            <div className="input-hint" style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>💡</span>
              <span>You can login with either your email address or phone number</span>
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
                disabled={isLoading}
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

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          </form>

          <div className="auth-footer">
          <div className="auth-divider">
            <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;