import React, { useState, useEffect, useRef } from 'react';
import './LocationSelector-v2.css';

const LocationSelector = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const [pincode, setPincode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showPincodeEntry, setShowPincodeEntry] = useState(false);
  const searchInputRef = useRef(null);

  // Load user's saved addresses from database when modal opens
  useEffect(() => {
    const loadAddresses = async () => {
      if (isOpen) {
        try {
          const userData = JSON.parse(localStorage.getItem('quikry_user') || '{}');
          
          // Fetch addresses from database if user is logged in
          if (userData._id) {
            try {
              console.log('📡 LocationSelector: Fetching addresses from database...');
              const response = await fetch(`http://localhost:8000/api/user/addresses/${userData._id}`);
              const data = await response.json();
              
              if (data.success && data.addresses && data.addresses.length > 0) {
                setSavedAddresses(data.addresses);
                setShowPincodeEntry(false); // Show saved addresses first
                console.log('✅ LocationSelector: Loaded', data.addresses.length, 'addresses from database');
                
                // Update localStorage cache
                userData.addresses = data.addresses;
                localStorage.setItem('quikry_user', JSON.stringify(userData));
              } else {
                console.warn('⚠️ No addresses in database');
                setSavedAddresses([]);
                setShowPincodeEntry(true); // No addresses, show pincode entry
              }
            } catch (error) {
              console.error('❌ Error fetching addresses:', error);
              // Fallback to localStorage cache
              if (userData.addresses && userData.addresses.length > 0) {
                setSavedAddresses(userData.addresses);
                setShowPincodeEntry(false);
                console.log('Using localStorage cache:', userData.addresses.length, 'addresses');
              } else {
                setSavedAddresses([]);
                setShowPincodeEntry(true);
              }
            }
          } else {
            // No user logged in, show pincode entry
            setSavedAddresses([]);
            setShowPincodeEntry(true);
          }
        } catch (e) {
          setSavedAddresses([]);
          setShowPincodeEntry(true);
        }

        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    };
    
    loadAddresses();
  }, [isOpen]);

  // Handle selecting a saved address
  const handleSelectSavedAddress = (address) => {
    const locationData = {
      title: address.label || address.addressType || 'Saved Address',
      address: address.fullAddress || `${address.houseNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`,
      city: address.city,
      state: address.state,
      pincode: address.pincode || address.zipCode,
      houseNo: address.houseNo,
      street: address.street,
      area: address.area,
      landmark: address.landmark,
      type: 'saved',
      lat: address.lat || null,
      lng: address.lng || null
    };
    
    onLocationSelect(locationData);
    onClose();
  };

  // Verify pincode and get city/state
  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsVerifying(true);
    setPincodeError('');

    try {
      // Use Nominatim to verify pincode and get city/state
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'QuikRy App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const location = data[0];
          const addr = location.address || {};
          
          // Extract city and state
          const city = addr.city || addr.town || addr.village || addr.state_district || '';
          const state = addr.state || '';
          
          console.log('✅ Pincode verified:', pincode, 'City:', city, 'State:', state);
          
          // Pass to parent with needsFullAddress flag
          onLocationSelect({
            pincode: pincode,
            city: city,
            state: state,
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon),
            address: location.display_name,
            needsFullAddress: true // Signal to open address form
          });
          
          onClose();
        } else {
          setPincodeError('Invalid pincode. Please check and try again.');
        }
      } else {
        setPincodeError('Unable to verify pincode. Please try again.');
      }
    } catch (error) {
      console.error('Pincode verification error:', error);
      setPincodeError('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setPincode(value);
    if (pincodeError) setPincodeError('');
  };

  if (!isOpen) return null;

  return (
    <div className="loc-overlay">
      <div className="loc-modal">
        {/* Header */}
        <div className="loc-header">
          <h2>
            <span className="loc-pin-icon">📍</span>
            Select Delivery Location
          </h2>
          <button className="loc-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="loc-content">
          {/* Show saved addresses if user has any */}
          {savedAddresses.length > 0 && !showPincodeEntry && (
            <div className="loc-section">
              <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                📍 Your Saved Addresses
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedAddresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSavedAddress(address)}
                    className="loc-address-card"
                    style={{
                      background: address.isDefault ? '#fef2f2' : 'white',
                      border: address.isDefault ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = address.isDefault ? '#dc2626' : '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>
                        {address.addressType === 'home' || address.type === 'home' ? '🏠' :
                         address.addressType === 'work' || address.type === 'work' ? '🏢' : '📍'}
                      </span>
                      <strong style={{ fontSize: '15px', color: '#333' }}>
                        {address.customLabel || address.label || address.addressType || address.type}
                      </strong>
                      {address.isDefault && (
                        <span style={{
                          background: '#dc2626',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Default
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                      {address.houseNo && <div><strong>{address.houseNo}</strong></div>}
                      {address.street && <div>{address.street}</div>}
                      {address.landmark && <div>Near {address.landmark}</div>}
                      {address.area && <div>{address.area}</div>}
                      <div>{address.city}, {address.state} - {address.pincode || address.zipCode}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPincodeEntry(true)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  background: 'white',
                  border: '2px dashed #dc2626',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                ➕ Add New Location
              </button>
            </div>
          )}

          {/* Pincode Input Section */}
          {(showPincodeEntry || savedAddresses.length === 0) && (
            <div className="loc-section">
              {savedAddresses.length > 0 && (
                <button
                  onClick={() => setShowPincodeEntry(false)}
                  style={{
                    marginBottom: '16px',
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ← Back to Saved Addresses
                </button>
              )}
              
              <h3 style={{ marginBottom: '12px', color: '#dc2626', fontSize: '16px' }}>
                Enter Your Pincode
              </h3>
            
              <form onSubmit={handlePincodeSubmit}>
              <div style={{ position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit pincode (e.g., 110001)"
                  className="loc-search-input"
                  style={{
                    paddingLeft: '45px',
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '2px'
                  }}
                  disabled={isVerifying}
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  📮
                </span>
              </div>

              {pincodeError && (
                <div style={{
                  marginTop: '8px',
                  padding: '10px',
                  background: '#fee2e2',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ⚠️ {pincodeError}
                </div>
              )}

              <button
                type="submit"
                className="loc-detect-btn"
                disabled={isVerifying || pincode.length !== 6}
                style={{
                  marginTop: '12px',
                  opacity: pincode.length === 6 ? 1 : 0.5,
                  cursor: pincode.length === 6 ? 'pointer' : 'not-allowed'
                }}
              >
                <span className="loc-detect-icon">
                  {isVerifying ? '⏳' : '✅'}
                </span>
                <div className="loc-detect-text">
                  <strong>{isVerifying ? 'Verifying Pincode...' : 'Continue'}</strong>
                  <small>
                    {isVerifying 
                      ? 'Please wait...' 
                      : 'We\'ll detect your city and ask for complete address'}
                  </small>
                </div>
              </button>
            </form>
            </div>
          )}

          {/* Info Section - Only show when entering new pincode */}
          {(showPincodeEntry || savedAddresses.length === 0) && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: '700', color: '#065f46', marginBottom: '8px' }}>
                📌 Why Pincode?
              </div>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#047857' }}>
                <li>Quick and accurate city detection</li>
                <li>No GPS/location permissions needed</li>
                <li>Works on any device</li>
                <li>You'll add exact house address next</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
