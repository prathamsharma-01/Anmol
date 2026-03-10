import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import googleIcon from '../../assets/icons/google.svg';
import appleIcon from '../../assets/icons/apple.svg';
import { validatePassword, getPasswordStrength } from '../../utils/passwordValidation.js';

const Register = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#ccc' });

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

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      const strength = getPasswordStrength(password);
      setPasswordValidation(validation);
      setPasswordStrength(strength);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
      setPasswordStrength({ score: 0, label: '', color: '#ccc' });
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobileNumber,
          email: email,
          password: password,
          name: name
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! You can now login.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="time">{currentTime}</div>
          <h2>Register</h2>
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
            <label>Enter your full name</label>
            <div className="input-group" style={{"--i": 1}}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
              <div className="input-icon">
                <i className="info-icon">i</i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Enter your mobile number</label>
            <div className="input-group" style={{"--i": 2}}>
              <div className="country-code">+91</div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="9123456789"
                required
                disabled={isLoading}
              />
              <div className="input-icon">
                <i className="info-icon">i</i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Enter your email</label>
            <div className="input-group" style={{"--i": 3}}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
              <div className="input-icon">
                <i className="info-icon">i</i>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Enter your password</label>
            <div className="input-group" style={{"--i": 4}}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength="8"
              />
              <div 
                className="input-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className="eye-icon">{showPassword ? "👁️" : "👁️‍🗨️"}</i>
              </div>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="password-strength" style={{ marginTop: '8px' }}>
                <div className="strength-bar" style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  marginBottom: '8px' 
                }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: '4px',
                        flex: 1,
                        backgroundColor: level <= passwordStrength.score ? passwordStrength.color : '#e0e0e0',
                        borderRadius: '2px',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: passwordStrength.color, 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Password Strength: {passwordStrength.label}
                </div>
                
                {/* Password requirements */}
                <div className="password-requirements" style={{ fontSize: '12px' }}>
                  <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                    Password must contain:
                  </div>
                  {[
                    { check: password.length >= 8, text: 'At least 8 characters' },
                    { check: /[A-Z]/.test(password), text: 'One uppercase letter (A-Z)' },
                    { check: /[a-z]/.test(password), text: 'One lowercase letter (a-z)' },
                    { check: /[0-9]/.test(password), text: 'One number (0-9)' },
                    { check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'One special character (!@#$%^&*)' }
                  ].map((req, index) => (
                    <div 
                      key={index}
                      style={{ 
                        color: req.check ? '#27ae60' : '#e74c3c',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{req.check ? '✓' : '✗'}</span>
                      <span>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Re-enter your password</label>
            <div className="input-group" style={{"--i": 5}}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <div 
                className="input-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className="eye-icon">{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</i>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
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