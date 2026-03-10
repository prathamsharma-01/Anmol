import React, { useState } from 'react';
import './shared.css';

export default function RegisterCard({ onRegister, onSwitchToLogin, userType = "delivery" }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'Bike',
    licenseNumber: '',
    aadharNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const vehicleTypes = ['Bike', 'Scooter', 'Car', 'Auto', 'Bicycle'];

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Enter valid 10-digit mobile number starting with 6-9';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Driving license number is required';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required for verification';
    } else if (formData.aadharNumber.length !== 12) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required for delivery assignments';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    } else if (formData.licenseNumber.length < 10) {
      newErrors.licenseNumber = 'License number must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number (only digits)
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'aadharNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'pincode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/delivery-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone,
          email: formData.email.trim() || null,
          password: formData.password,
          vehicleType: formData.vehicleType,
          licenseNumber: formData.licenseNumber.trim(),
          aadharNumber: formData.aadharNumber.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          pincode: formData.pincode || null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! You can now login with your credentials.');
        if (onRegister) {
          onRegister(data.user);
        }
        // Switch to login view
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      } else {
        setErrors({ submit: data.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-header">
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.05), rgba(211, 47, 47, 0.05))',
          borderRadius: '12px',
          border: '1px solid rgba(229, 57, 53, 0.1)'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900',
            color: '#e53935',
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            QUIKRY
          </h1>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            fontWeight: '500'
          }}>
            Delivery Partner Platform
          </div>
        </div>
        <h1 className="auth-title">📝 Join Our Team</h1>
        <p className="auth-subtitle">Register as a delivery partner and start earning today</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Personal Information Section */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Personal Information
          </h3>
          
          <div className="input-row three-col">
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInputChange}
                className={`auth-input ${errors.name ? 'input-error' : ''}`}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="input-group">
              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number *"
                value={formData.phone}
                onChange={handleInputChange}
                className={`auth-input ${errors.phone ? 'input-error' : ''}`}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address (optional)"
                value={formData.email}
                onChange={handleInputChange}
                className={`auth-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🔒</span>
            Security
          </h3>
          
          <div className="input-row">
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password * (min 6 chars)"
                value={formData.password}
                onChange={handleInputChange}
                className={`auth-input ${errors.password ? 'input-error' : ''}`}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`auth-input ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🚗</span>
            Vehicle Information
          </h3>
          
          <div className="input-row">
            <div className="input-group">
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="auth-select"
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="licenseNumber"
                placeholder="Driving License Number *"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={`auth-input ${errors.licenseNumber ? 'input-error' : ''}`}
              />
              {errors.licenseNumber && <div className="error-message">{errors.licenseNumber}</div>}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📍</span>
            Identity & Address Verification
          </h3>
          
          <div className="input-row">
            <div className="input-group">
              <input
                type="text"
                name="aadharNumber"
                placeholder="Aadhar Number * (12 digits)"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                className={`auth-input ${errors.aadharNumber ? 'input-error' : ''}`}
                maxLength="12"
              />
              {errors.aadharNumber && <div className="error-message">{errors.aadharNumber}</div>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="address"
                placeholder="Complete Address *"
                value={formData.address}
                onChange={handleInputChange}
                className={`auth-input ${errors.address ? 'input-error' : ''}`}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>
          </div>

          <div className="input-row three-col">
            <div className="input-group">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={formData.city}
                onChange={handleInputChange}
                className={`auth-input ${errors.city ? 'input-error' : ''}`}
              />
              {errors.city && <div className="error-message">{errors.city}</div>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="state"
                placeholder="State *"
                value={formData.state}
                onChange={handleInputChange}
                className={`auth-input ${errors.state ? 'input-error' : ''}`}
              />
              {errors.state && <div className="error-message">{errors.state}</div>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="pincode"
                placeholder="Pincode * (6 digits)"
                value={formData.pincode}
                onChange={handleInputChange}
                className={`auth-input ${errors.pincode ? 'input-error' : ''}`}
                maxLength="6"
              />
              {errors.pincode && <div className="error-message">{errors.pincode}</div>}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating Account...
            </>
          ) : (
            <>
              🎯 Register as Delivery Partner
            </>
          )}
        </button>

        {/* Switch to Login */}
        <div className="auth-switch">
          <p className="auth-switch-text">
            Already have an account?
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-switch-button"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}