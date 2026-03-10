import React from 'react';
import './OrderLocation.css';

const OrderLocation = ({ deliveryLocation }) => {
  if (!deliveryLocation || !deliveryLocation.coordinates) {
    return (
      <div className="order-location">
        <div className="location-header">
          <span className="location-icon">📍</span>
          <span className="location-title">Delivery Location</span>
        </div>
        <div className="location-address">
          {deliveryLocation?.fullAddress || 'Address not available'}
        </div>
      </div>
    );
  }

  const { coordinates, fullAddress, houseNo, street, area, landmark, city, state, pincode } = deliveryLocation;
  const hasCoords = coordinates && coordinates.lat && coordinates.lng;

  const openInMaps = () => {
    if (hasCoords) {
      // Opens location in default maps app (Google Maps on Android, Apple Maps on iOS)
      const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="order-location">
      <div className="location-header">
        <span className="location-icon">📍</span>
        <span className="location-title">Delivery Location</span>
      </div>

      <div className="location-details">
        {fullAddress ? (
          <div className="location-address">{fullAddress}</div>
        ) : (
          <div className="location-address-parts">
            {houseNo && <div>{houseNo}</div>}
            {street && <div>{street}</div>}
            {area && <div>{area}</div>}
            {landmark && <div className="location-landmark">🚩 {landmark}</div>}
            {city && state && pincode && (
              <div className="location-city">{city}, {state} - {pincode}</div>
            )}
          </div>
        )}

        {hasCoords && (
          <div className="location-coords">
            <span className="coords-label">Coordinates:</span>
            <span className="coords-value">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </span>
          </div>
        )}

        {hasCoords && (
          <button className="location-view-btn" onClick={openInMaps}>
            🗺️ View on Map
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderLocation;
