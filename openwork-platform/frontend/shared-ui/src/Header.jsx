import React, { useState } from 'react';
import './shared.css';

export default function Header({ place, onLocationChange, showCart = true, showLocationButton = true, showLoginButton = true }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState(place || '');

  const handleLogin = () => {
    // For seller dashboard, redirect to login page or show login modal
    window.location.href = '/login';
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleLocationSubmit = () => {
    if (location.trim()) {
      if (onLocationChange) {
        onLocationChange(location);
      }
      setShowLocationModal(false);
    }
  };

  return (
    <>
      <header className="sw-header">
        <div className="sw-brand">QUIKRY</div>
        <div className="sw-actions">
          {showLocationButton && (
            <button 
              className="sw-place-btn" 
              onClick={handleLocationClick}
            >
              📍 {location || 'Set location'}
            </button>
          )}
          {showLoginButton && (
            <button className="sw-login" onClick={handleLogin}>
              {isLoggedIn ? 'Account' : 'Login'}
            </button>
          )}
          {showCart && <button className="sw-cart">Cart</button>}
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set Your Location</h3>
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleLocationSubmit} className="btn-primary">
                Set Location
              </button>
              <button onClick={() => setShowLocationModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
