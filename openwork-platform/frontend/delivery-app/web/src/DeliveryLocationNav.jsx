import React from 'react';
import './DeliveryLocationNav.css';

const DeliveryLocationNav = ({ deliveryLocation, customerPhone }) => {
  if (!deliveryLocation) {
    return (
      <div className="delivery-location-nav">
        <div className="nav-status">
          <span className="nav-icon">📍</span>
          <span className="nav-text">Location not available</span>
        </div>
      </div>
    );
  }

  const { coordinates, fullAddress, houseNo, street, area, landmark, city, state, pincode } = deliveryLocation;
  const hasCoords = coordinates && coordinates.lat && coordinates.lng;

  const navigateToCustomer = () => {
    if (hasCoords) {
      // Try to open in native map app first (better for mobile)
      // This works on both iOS (Apple Maps) and Android (Google Maps)
      const nativeUrl = `maps://maps.google.com/maps?daddr=${coordinates.lat},${coordinates.lng}&amp;ll=`;
      
      // Fallback to Google Maps web if native app fails
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      
      // Try native first, fallback to web
      window.location.href = nativeUrl;
      
      // Fallback to web after 500ms if native didn't work
      setTimeout(() => {
        window.open(webUrl, '_blank');
      }, 500);
    } else {
      alert('📍 Location coordinates not available for navigation');
    }
  };

  const callCustomer = () => {
    if (customerPhone) {
      window.location.href = `tel:${customerPhone}`;
    } else {
      alert('📞 Customer phone number not available');
    }
  };

  return (
    <div className="delivery-location-nav">
      <div className="nav-header">
        <span className="nav-icon">🎯</span>
        <span className="nav-title">Customer Location</span>
      </div>

      <div className="nav-details">
        {fullAddress ? (
          <div className="nav-address">{fullAddress}</div>
        ) : (
          <div className="nav-address-parts">
            {houseNo && <div className="nav-house">🏠 {houseNo}</div>}
            {street && <div>{street}</div>}
            {area && <div>{area}</div>}
            {landmark && <div className="nav-landmark">🚩 {landmark}</div>}
            {city && state && pincode && (
              <div className="nav-city">{city}, {state} - {pincode}</div>
            )}
          </div>
        )}

        {hasCoords && (
          <div className="nav-coords">
            <span className="coords-icon">🌐</span>
            <span className="coords-text">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </span>
          </div>
        )}

        <div className="nav-actions">
          {hasCoords && (
            <button className="nav-btn nav-btn-primary" onClick={navigateToCustomer}>
              <span className="btn-icon">🧭</span>
              <span>Navigate</span>
            </button>
          )}
          
          {customerPhone && (
            <button className="nav-btn nav-btn-secondary" onClick={callCustomer}>
              <span className="btn-icon">📞</span>
              <span>Call Customer</span>
            </button>
          )}
        </div>

        {!hasCoords && (
          <div className="nav-warning">
            ⚠️ GPS coordinates not available. Please contact customer for directions.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryLocationNav;
