import React, { useState, useEffect, useRef } from 'react';
import './LocationSelector-Enhanced.css';

const LocationSelector = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Sample locations for demo (in real app, this would come from API)
  const recentLocations = [
    {
      id: 1,
      title: "Home",
      address: "123 Main Street, New Delhi, Delhi 110001",
      type: "home",
      lat: 28.6139,
      lng: 77.2090
    },
    {
      id: 2,
      title: "Office",
      address: "456 Business District, Gurgaon, Haryana 122001",
      type: "work",
      lat: 28.4595,
      lng: 77.0266
    }
  ];

  const popularLocations = [
    { name: "Connaught Place", city: "New Delhi", state: "Delhi" },
    { name: "Cyber City", city: "Gurgaon", state: "Haryana" },
    { name: "Sector 18", city: "Noida", state: "Uttar Pradesh" },
    { name: "Khan Market", city: "New Delhi", state: "Delhi" },
    { name: "Golf Course Road", city: "Gurgaon", state: "Haryana" },
    { name: "Lajpat Nagar", city: "New Delhi", state: "Delhi" }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Enhanced location detection with multiple attempts for better accuracy
  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsDetectingLocation(false);
      return;
    }

    // Method 1: Multiple high-accuracy attempts
    let bestPosition = null;
    let bestAccuracy = Infinity;
    const maxAttempts = 3;

    try {
      console.log('Starting enhanced location detection...');

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Location attempt ${attempt}/${maxAttempts}`);
          
          const position = await new Promise((resolve, reject) => {
            const options = {
              enableHighAccuracy: true,
              timeout: attempt === 1 ? 8000 : 12000, // Increase timeout for later attempts
              maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });

          const accuracy = position.coords.accuracy;
          console.log(`Attempt ${attempt} - Accuracy: ${Math.round(accuracy)}m`);

          // Keep the most accurate position
          if (accuracy < bestAccuracy) {
            bestAccuracy = accuracy;
            bestPosition = position;
          }

          // If we get excellent accuracy (< 20m), use it immediately
          if (accuracy < 20) {
            console.log('Excellent accuracy achieved, using this position');
            break;
          }

          // Wait between attempts to get different GPS readings
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (attemptError) {
          console.log(`Attempt ${attempt} failed:`, attemptError.message);
          if (attempt === maxAttempts && !bestPosition) {
            throw attemptError;
          }
        }
      }

      if (!bestPosition) {
        throw new Error('Failed to get location after multiple attempts');
      }

      const { latitude, longitude, accuracy } = bestPosition.coords;
      console.log(`Final position - Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${Math.round(accuracy)}m`);

      // Method 2: Enhanced address resolution with multiple services
      let addressResult = null;

      try {
        // Primary service: OpenStreetMap Nominatim with enhanced parameters
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en&namedetails=1&extratags=1`;
        
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'QuikRy Delivery App v1.0 (Location Service)'
          }
        });
        
        if (nominatimResponse.ok) {
          const data = await nominatimResponse.json();
          
          if (data && data.display_name) {
            const addr = data.address || {};
            
            // Enhanced Indian address formatting
            const parts = [];
            
            // Building/house details
            if (addr.house_number && addr.road) {
              parts.push(`${addr.house_number}, ${addr.road}`);
            } else if (addr.road) {
              parts.push(addr.road);
            } else if (addr.house_number) {
              parts.push(addr.house_number);
            }
            
            // Area details
            if (addr.neighbourhood) {
              parts.push(addr.neighbourhood);
            } else if (addr.suburb) {
              parts.push(addr.suburb);
            } else if (addr.locality) {
              parts.push(addr.locality);
            }
            
            // City details
            if (addr.city) {
              parts.push(addr.city);
            } else if (addr.town) {
              parts.push(addr.town);
            } else if (addr.village) {
              parts.push(addr.village);
            }
            
            // State and postal code
            if (addr.state) parts.push(addr.state);
            if (addr.postcode) parts.push(addr.postcode);
            
            const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
            
            addressResult = {
              formatted: formattedAddress,
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy),
              components: addr,
              source: 'Nominatim'
            };
          }
        }
      } catch (nominatimError) {
        console.log('Nominatim failed:', nominatimError.message);
      }

      // Fallback: Use coordinate-based address with accuracy info
      if (!addressResult) {
        console.log('Using coordinate fallback');
        addressResult = {
          formatted: `📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m accuracy)`,
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          source: 'GPS'
        };
      }

      setCurrentAddress(addressResult);
      console.log('Location detection successful:', addressResult);

    } catch (error) {
      console.error('Enhanced location detection failed:', error);
      
      let errorMessage = '❌ Location Detection Failed\n\n';
      
      switch(error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage += '🔒 Location access denied.\n\nPlease:\n1. Enable location permissions for this website\n2. Refresh the page and try again\n3. Or search manually for your location';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage += '📡 GPS signal unavailable.\n\nPlease:\n1. Move to an open area (away from buildings)\n2. Enable high-accuracy mode in device settings\n3. Or search manually for your location';
          break;
        case 3: // TIMEOUT
          errorMessage += '⏱️ Location request timed out.\n\nPlease:\n1. Check your internet connection\n2. Try again in a few seconds\n3. Or search manually for your location';
          break;
        default:
          errorMessage += '🔧 Technical issue occurred.\n\nPlease:\n1. Refresh the page\n2. Check internet connection\n3. Or search manually for your location';
          break;
      }
      
      alert(errorMessage);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Search function using OpenStreetMap Nominatim (same as main app)
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the same API as the main app for consistency
      const indiaUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&countrycodes=in`;
      const response = await fetch(indiaUrl, { 
        headers: { 'Accept-Language': 'en' } 
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = data.map((item, index) => ({
          id: `search_${item.place_id || index}`,
          title: item.address?.house_number ? 
                 `${item.address.house_number} ${item.address.road || item.address.neighbourhood || ''}`.trim() :
                 (item.address?.village || item.address?.town || item.address?.hamlet || item.address?.suburb || (item.display_name || '').split(',')[0]),
          address: item.display_name,
          type: "search",
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    }
    
    setIsLoading(false);
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    onClose();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="location-header">
          <div>
            <h2>🎯 Select Delivery Location</h2>
            <p className="location-subtitle">Choose precise location for fast delivery</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Search Section */}
        <div className="location-search">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Current Location */}
        <div className="location-section">
          <button 
            className="detect-location-btn"
            onClick={detectCurrentLocation}
            disabled={isDetectingLocation}
          >
            <div className="location-icon">📍</div>
            <div className="location-text">
              <div className="location-title">
                {isDetectingLocation ? 'Detecting...' : 'Use current location'}
              </div>
              <div className="location-subtitle">
                {currentAddress ? currentAddress.formatted : 'Using GPS to find you'}
              </div>
            </div>
            {isDetectingLocation && <div className="loading-spinner"></div>}
          </button>
          
          {currentAddress && (
            <button 
              className="location-option current-location"
              onClick={() => handleLocationSelect({
                title: 'Current Location',
                address: currentAddress.formatted,
                lat: currentAddress.lat,
                lng: currentAddress.lng,
                type: 'current'
              })}
            >
              <div className="location-icon">✅</div>
              <div className="location-text">
                <div className="location-title">Current Location</div>
                <div className="location-subtitle">{currentAddress.formatted}</div>
              </div>
            </button>
          )}
        </div>

        <div className="location-content">
          {/* Current Location Section - Always show at top */}
          <div className="location-section">
            <button 
              className="detect-location-btn"
              onClick={detectCurrentLocation}
              disabled={isDetectingLocation}
            >
              <div className="location-icon">📍</div>
              <div className="location-text">
                <div className="location-title">
                  {isDetectingLocation ? 'Detecting location...' : 'Use current location'}
                </div>
                <div className="location-subtitle">
                  {isDetectingLocation ? 'Getting your precise location...' : 'Using GPS for accurate location'}
                </div>
              </div>
              {isDetectingLocation && <div className="loading-spinner"></div>}
            </button>
          </div>

          {/* Current Address Result - Only show after successful detection */}
          {currentAddress && !isDetectingLocation && (
            <div className="location-section">
              <h3>📍 Detected Location</h3>
              <button 
                className="location-option current-location"
                onClick={() => handleLocationSelect({
                  title: 'Current Location',
                  address: currentAddress.formatted,
                  lat: currentAddress.lat,
                  lng: currentAddress.lng,
                  type: 'current'
                })}
              >
                <div className="location-icon">✅</div>
                <div className="location-text">
                  <div className="location-title">Use This Location</div>
                  <div className="location-subtitle">
                    {currentAddress.formatted}
                    {currentAddress.accuracy && (
                      <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>
                        Accuracy: ±{Math.round(currentAddress.accuracy)}m
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Search Results */}
          {isLoading && (
            <div className="search-loading">
              <div className="loading-spinner" style={{ position: 'relative', margin: '0 auto 10px' }}></div>
              Searching for "{searchQuery}"...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="location-section">
              <h3>🔍 Search Results</h3>
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  className="location-option"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="location-icon">📍</div>
                  <div className="location-text">
                    <div className="location-title">{location.title}</div>
                    <div className="location-subtitle">{location.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery && suggestions.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div><strong>No results found</strong></div>
              <div style={{ fontSize: '14px', marginTop: '8px', color: '#999' }}>
                Try searching for "{searchQuery.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}" or use current location above
              </div>
            </div>
          )}

          {/* Recent Locations - only show when not searching */}
          {!searchQuery && recentLocations.length > 0 && (
            <div className="location-section">
              <h3>🕒 Recent Locations</h3>
              {recentLocations.map((location) => (
                <button
                  key={location.id}
                  className="location-option"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="location-icon">
                    {location.type === 'home' ? '🏠' : location.type === 'work' ? '🏢' : '📍'}
                  </div>
                  <div className="location-text">
                    <div className="location-title">{location.title}</div>
                    <div className="location-subtitle">{location.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Locations - only show when not searching */}
          {!searchQuery && (
            <div className="location-section">
              <h3>⭐ Popular Locations</h3>
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  className="location-option"
                  onClick={() => handleLocationSelect({
                    title: location.name,
                    address: `${location.name}, ${location.city}, ${location.state}`,
                    type: 'popular',
                    lat: 28.6139 + Math.random() * 0.1,
                    lng: 77.2090 + Math.random() * 0.1
                  })}
                >
                  <div className="location-icon">⭐</div>
                  <div className="location-text">
                    <div className="location-title">{location.name}</div>
                    <div className="location-subtitle">{location.city}, {location.state}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;