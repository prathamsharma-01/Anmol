import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import googleIcon from '../../assets/icons/google.svg';
import appleIcon from '../../assets/icons/apple.svg';

const Register = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    // Handle registration logic here
    console.log('Register with:', mobileNumber, email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="time">{currentTime}</div>
          <h2>Register</h2>
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
            <label>Enter your email</label>
            <div className="input-group" style={{"--i": 2}}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
              <div className="input-icon">
                <i className="info-icon">i</i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Enter your password</label>
            <div className="input-group" style={{"--i": 3}}>
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
          </div>

          <div className="form-group">
            <label>Re-enter your password</label>
            <div className="input-group" style={{"--i": 4}}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div 
                className="input-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className="eye-icon">{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</i>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <div className="auth-footer">
          <div className="auth-divider">
            <span>Already have an account? <Link to="/login">Login</Link></span>
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
  );
};

export default Register;