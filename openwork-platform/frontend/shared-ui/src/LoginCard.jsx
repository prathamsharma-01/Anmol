import React, { useState } from 'react';
import './shared.css';

export default function LoginCard({ onLogin = ()=>{} }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Phone number validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Handle mobile input - only allow digits and max 10 characters
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setMobile(value);
      if (error) setError(''); // Clear error when user types
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error when user types
  };

  async function tryLogin() {
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!mobile.trim()) {
      setError('Please enter your mobile number');
      setIsLoading(false);
      return;
    }

    if (!validatePhone(mobile)) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend API for authentication
      const response = await fetch('http://localhost:8000/api/auth/delivery-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Create user object for the app
        const user = {
          id: data.user._id,
          name: data.user.name,
          phone: data.user.phone,
          role: 'delivery',
          vehicleType: data.user.vehicleType,
          rating: data.user.rating,
          totalDeliveries: data.user.totalDeliveries,
          isOnline: data.user.isOnline
        };
        
        // Call the onLogin callback
        try { 
          onLogin(user);
        } catch(e) {
          console.error('Login callback error:', e);
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      tryLogin();
    }
  };

  return (
    <div>
      <div className="input-group">
        <input 
          placeholder="Mobile number (10 digits)" 
          value={mobile} 
          onChange={handleMobileChange}
          onKeyPress={handleKeyPress}
          maxLength="10"
          disabled={isLoading}
          className={`login-input ${error && !validatePhone(mobile) && mobile ? 'input-error' : ''}`}
        />
        {mobile && !validatePhone(mobile) && (
          <div className="error-message">Enter valid 10-digit number (6-9 starting)</div>
        )}
      </div>

      <div className="input-group">
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={handlePasswordChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className={`login-input ${error && password.length < 4 && password ? 'input-error' : ''}`}
        />
        {password && password.length < 4 && (
          <div className="error-message">Password must be at least 4 characters</div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        className={`login-button ${isLoading ? 'loading' : ''}`} 
        onClick={tryLogin}
        disabled={isLoading || !mobile || !password}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Logging in...
          </>
        ) : (
          <>
            🔑 Login to Dashboard
          </>
        )}
      </button>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '25px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.05), rgba(211, 47, 47, 0.05))',
        borderRadius: '12px',
        border: '1px solid rgba(229, 57, 53, 0.1)'
      }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#e53935', 
          fontWeight: '600',
          marginBottom: '10px'
        }}>
          📱 Quick Access Info
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          🔒 Use your registered mobile number
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          🚚 Start earning immediately after login
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          📞 Need help? Call: <strong style={{ color: '#e53935' }}>1800-123-4567</strong>
        </div>
      </div>
    </div>
  );
}
