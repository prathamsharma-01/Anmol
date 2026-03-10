import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import Products from './components/Products.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import Cart from './components/Cart/Cart.jsx';
import HighTechPanel from './components/HighTechDemo/HighTechPanel';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import AdminSupport from './pages/AdminSupport.jsx';
import LocationSelector from './components/LocationSelector-v2.jsx';
import AddressForm from './components/AddressForm.jsx';

// Import all assets from centralized location
import { icons, categoryImages } from './assets/images.js';

function HomePage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on initial render
    try {
      const savedCart = localStorage.getItem('quikry_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });
  const [pincode, setPincode] = useState('136118');
  const [deliveryEstimate, setDeliveryEstimate] = useState('13');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfessionalLocationSelector, setShowProfessionalLocationSelector] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationInput, setLocationInput] = useState(pincode);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [placeName, setPlaceName] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState(''); // Product search
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [user, setUser] = useState(null); // Add user state
  const searchTimer = useRef(null)
  const doSearchNow = async (q) => {
    if (!q) return
    setSearchLoading(true)
    setSearchError(null)
    try {
      // First try: bias results to India and return detailed address parts
      const indiaUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=20&countrycodes=in`;
      const res = await fetch(indiaUrl, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('Search failed');
      let data = await res.json();
      // If no India-biased matches, fall back to a broader/global search
      if (!data || data.length === 0) {
        const globalUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=20`;
        const gres = await fetch(globalUrl, { headers: { 'Accept-Language': 'en' } });
        if (gres.ok) {
          data = await gres.json();
        }
      }
      setSearchResults(data || [])
    } catch (err) {
      setSearchError('Search failed')
      setSearchResults([])
    } finally { setSearchLoading(false) }
  }

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('quikry_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cartItems]);

  // Load saved pincode from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('quikry_pincode');
      if (saved) {
        setPincode(saved);
        setLocationInput(saved);
        // Try to extract coords if saved in format: Current location (lat,lng)
        const m = saved.match(/\(([-0-9.]+),\s*([-0-9.]+)\)/);
        if (m) {
          const parsed = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
          setCoords(parsed);
          // Try to load saved place name
          try {
            const savedPlace = window.localStorage.getItem('quikry_place');
            if (savedPlace) setPlaceName(savedPlace);
          } catch (e) {}
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Check if user is logged in and load their addresses from database
  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        const savedUser = window.localStorage.getItem('quikry_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // Fetch addresses from database
          if (userData._id) {
            try {
              console.log('📡 Fetching addresses from database for user:', userData._id);
              const response = await fetch(`http://localhost:8000/api/user/addresses/${userData._id}`);
              const data = await response.json();
              
              if (data.success && data.addresses) {
                // Update user with database addresses
                userData.addresses = data.addresses;
                console.log('✅ Loaded', data.addresses.length, 'addresses from database');
              } else {
                console.warn('⚠️ No addresses found in database, using localStorage cache');
              }
            } catch (error) {
              console.error('❌ Error fetching addresses from database:', error);
              console.warn('Using localStorage cache as fallback');
            }
          }
          
          setUser(userData);
          
          // If user has addresses, use the default one or first one
          if (userData.addresses && userData.addresses.length > 0) {
            const defaultAddr = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0];
            
            // Create a location object from the address
            const userLocation = {
              title: defaultAddr.label || defaultAddr.addressType || 'Saved Address',
              address: defaultAddr.fullAddress || `${defaultAddr.houseNo}, ${defaultAddr.street}, ${defaultAddr.area}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pincode}`,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode || defaultAddr.zipCode,
              houseNo: defaultAddr.houseNo,
              street: defaultAddr.street,
              area: defaultAddr.area,
              landmark: defaultAddr.landmark,
              type: 'saved',
              lat: defaultAddr.lat || null,
              lng: defaultAddr.lng || null
            };
            
            setSelectedLocation(userLocation);
            setPincode(defaultAddr.pincode || defaultAddr.zipCode || '');
            setPlaceName(`${defaultAddr.houseNo}, ${defaultAddr.area}`);
            
            // Update localStorage cache
            localStorage.setItem('quikry_user', JSON.stringify(userData));
            localStorage.setItem('selectedLocation', JSON.stringify(userLocation));
            
            console.log('✅ Auto-loaded user default address:', defaultAddr.label || defaultAddr.addressType);
          }
        }
      } catch (e) {
        console.error('Error loading user addresses:', e);
      }
    };
    
    loadUserAddresses();
  }, []);

  // Load saved professional location (only if no user addresses loaded)
  useEffect(() => {
    try {
      // Skip if we already have a selected location from user addresses
      if (selectedLocation && selectedLocation.type === 'saved') return;
      
      const savedLocation = localStorage.getItem('selectedLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setSelectedLocation(location);
        // Also sync with existing location states
        setPincode(location.address);
        setPlaceName(location.title);
        setLocationInput(location.address);
        if (location.lat && location.lng) {
          setCoords({ lat: location.lat, lng: location.lng });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Debounced search when typing in location input
  useEffect(() => {
    if (!showLocationModal) return;
    const q = locationInput && locationInput.trim();
    if (!q) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchError(null)
    setSearchLoading(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
  // increase limit and allow house numbers / short strings
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=10`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data || [])
      } catch (err) {
        setSearchError('Search failed')
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 450)

    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [locationInput, showLocationModal])

  // Reverse geocode when coords change
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    const fetchPlace = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (!res.ok) throw new Error('Reverse geocode failed');
        const data = await res.json();
        if (cancelled) return;
        const name = data.display_name || '';
        setPlaceName(name);
        try { window.localStorage.setItem('quikry_place', name); } catch (e) {}
      } catch (err) {
        // don't block UI, leave placeName empty
        console.warn('Reverse geocode error', err);
      }
    };
    fetchPlace();
    return () => { cancelled = true; };
  }, [coords]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // Increase quantity if item exists
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, isNew: true } 
            : item
        );
      } else {
        // Add new item with quantity 1
        const newItem = { ...product, quantity: 1, isNew: true };
        return [...prevItems, newItem];
      }
    });

    // Show confirmation animation
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'add-to-cart-confirmation';
    confirmationDiv.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-icon">✓</div>
        <div class="confirmation-text">Item added to cart</div>
      </div>
    `;
    document.body.appendChild(confirmationDiv);

    // Remove confirmation after animation
    setTimeout(() => {
      confirmationDiv.classList.add('fade-out');
      setTimeout(() => {
        if (confirmationDiv.parentNode) confirmationDiv.parentNode.removeChild(confirmationDiv);
      }, 500);
    }, 1500);

    // Remove isNew flag after animation completes
    setTimeout(() => {
      setCartItems(current => 
        current.map(item => 
          item.id === product.id ? { ...item, isNew: false } : item
        )
      );
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('quikry_user');
    setUser(null);
    alert('Logged out successfully!');
  };

  // Professional location handler - opens address form for full details
  const handleProfessionalLocationSelect = (location) => {
    console.log('Location selected:', location);
    console.log('Coordinates received:', location.lat, location.lng);
    
    if (location.needsFullAddress) {
      // Store detected location data and open address form
      setDetectedLocation({
        pincode: location.pincode,
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng
      });
      console.log('Stored detected location with coords:', location.lat, location.lng);
      setShowAddressForm(true);
    } else if (location.type === 'saved') {
      // User selected an existing saved address
      setSelectedLocation(location);
      setPincode(location.pincode || location.zipCode || '');
      setPlaceName(location.title || `${location.houseNo}, ${location.area}`);
      setLocationInput(location.address || location.fullAddress);
      
      if (location.lat && location.lng) {
        setCoords({ lat: location.lat, lng: location.lng });
      }
      
      // Save as current selected location
      try {
        localStorage.setItem('selectedLocation', JSON.stringify(location));
        localStorage.setItem('quikry_pincode', location.pincode || location.zipCode || '');
        localStorage.setItem('quikry_place', location.title || `${location.houseNo}, ${location.area}`);
        console.log('✅ Saved address selected and set as current location');
      } catch (e) {
        console.error('Error saving selected address:', e);
      }
    } else {
      // Fallback: use location as-is
      setSelectedLocation(location);
      setPincode(location.pincode || location.address);
      setPlaceName(location.title);
      setLocationInput(location.address);
      
      if (location.lat && location.lng) {
        setCoords({ lat: location.lat, lng: location.lng });
      }
    }
    
    setShowProfessionalLocationSelector(false);
  };

  // Handle complete address save from form
  const handleAddressSave = async (addressData) => {
    console.log('Address saved:', addressData);
    console.log('detectedLocation coords:', detectedLocation?.lat, detectedLocation?.lng);
    
    // Set the complete address
    const fullLocation = {
      title: `${addressData.label.charAt(0).toUpperCase() + addressData.label.slice(1)}`,
      address: addressData.fullAddress,
      pincode: addressData.pincode,
      city: addressData.city,
      state: addressData.state,
      houseNo: addressData.houseNo,
      street: addressData.street,
      area: addressData.area,
      landmark: addressData.landmark,
      lat: detectedLocation?.lat,
      lng: detectedLocation?.lng,
      addressType: addressData.addressType,
      customLabel: addressData.customLabel,
      type: addressData.addressType, // For backward compatibility
      zipCode: addressData.pincode, // For backward compatibility
      fullAddress: addressData.fullAddress,
      label: addressData.label,
      isDefault: false
    };
    
    console.log('fullLocation with coords:', fullLocation.lat, fullLocation.lng);
    
    setSelectedLocation(fullLocation);
    setPincode(addressData.pincode);
    setPlaceName(`${addressData.houseNo}, ${addressData.area}`);
    setLocationInput(addressData.fullAddress);
    
    if (detectedLocation?.lat && detectedLocation?.lng) {
      setCoords({ lat: detectedLocation.lat, lng: detectedLocation.lng });
      console.log('Coords set:', detectedLocation.lat, detectedLocation.lng);
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('selectedLocation', JSON.stringify(fullLocation));
      localStorage.setItem('quikry_pincode', addressData.pincode);
      localStorage.setItem('quikry_place', `${addressData.houseNo}, ${addressData.area}`);
      localStorage.setItem('quikry_full_address', addressData.fullAddress);
      
      if (detectedLocation?.lat && detectedLocation?.lng) {
        localStorage.setItem('quikry_coords', JSON.stringify({ 
          lat: detectedLocation.lat, 
          lng: detectedLocation.lng 
        }));
        console.log('✅ Coordinates saved to localStorage:', detectedLocation.lat, detectedLocation.lng);
      } else {
        console.warn('⚠️ No coordinates to save!');
      }

      // **SAVE ADDRESS TO DATABASE**
      if (user && user._id) {
        // Check if this address already exists in localStorage (quick check)
        const updatedUser = { ...user };
        if (!updatedUser.addresses) {
          updatedUser.addresses = [];
        }

        const existingIndex = updatedUser.addresses.findIndex(
          addr => addr.houseNo === addressData.houseNo && 
                  addr.street === addressData.street && 
                  addr.pincode === addressData.pincode
        );

        try {
          if (existingIndex === -1) {
            // NEW ADDRESS - Save to database
            console.log('💾 Saving new address to database...');
            const response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fullLocation)
            });

            const data = await response.json();

            if (data.success) {
              // Add the address with its database ID to local state
              updatedUser.addresses.push(data.address);
              console.log('✅ Address saved to database successfully');
              alert(`✅ Address saved permanently! You now have ${updatedUser.addresses.length} saved address${updatedUser.addresses.length > 1 ? 'es' : ''}.`);
            } else {
              console.error('Failed to save address:', data.message);
              alert('❌ Failed to save address to database. Using temporary storage.');
              // Fallback to localStorage
              updatedUser.addresses.push(fullLocation);
            }
          } else {
            // EXISTING ADDRESS - Update in database
            const existingAddress = updatedUser.addresses[existingIndex];
            if (existingAddress._id) {
              console.log('💾 Updating existing address in database...');
              const response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}/${existingAddress._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(fullLocation)
              });

              const data = await response.json();

              if (data.success) {
                updatedUser.addresses[existingIndex] = { ...fullLocation, _id: existingAddress._id };
                console.log('✅ Address updated in database successfully');
                alert('✅ Address updated permanently!');
              } else {
                console.error('Failed to update address:', data.message);
                alert('❌ Failed to update address in database.');
              }
            }
          }

          // Update localStorage cache
          localStorage.setItem('quikry_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          console.log('✅ User profile synced. Total addresses:', updatedUser.addresses.length);

        } catch (error) {
          console.error('❌ Error saving to database:', error);
          alert('❌ Network error. Address saved temporarily. Please check your internet connection.');
          // Fallback to localStorage only
          if (existingIndex === -1) {
            updatedUser.addresses.push(fullLocation);
          } else {
            updatedUser.addresses[existingIndex] = fullLocation;
          }
          localStorage.setItem('quikry_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        console.warn('⚠️ No user logged in - address not saved permanently');
        alert('⚠️ Please log in to save addresses permanently!');
      }
    } catch (e) {
      console.error('Error saving address:', e);
      alert('❌ Error saving address. Please try again.');
    }
    
    // Update delivery estimate
    setDeliveryEstimate('10-15');
    setShowAddressForm(false);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      // Remove item from cart
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      // Update quantity
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };

  return (
    <>
      <header className="App-header">
        <div className="header-container">
          <div className="logo">
            <h1>QuikRy</h1>
          </div>

          <div className="delivery" title="Click to change delivery pincode/address">
            <div className="eta">Delivery in {deliveryEstimate} minutes</div>
            <button
              className="location-pill"
              onClick={() => setShowProfessionalLocationSelector(true)}
              title={placeName || pincode}
            >
              <span className="pin">📍</span>
              <span className="loc-text">
                {selectedLocation ? selectedLocation.title : 
                 placeName ? placeName.split(',')[0] : 
                 pincode === '136118' ? 'Select Location' : pincode}
              </span>
              <span className="caret">▾</span>
            </button>
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search for services and products" 
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
            {productSearchQuery && (
              <button className="clear-search" onClick={() => setProductSearchQuery('')}>✕</button>
            )}
          </div>
          <div className="user-actions">
            {user ? (
              <div className="user-dropdown">
                <button className="user-btn">
                  👤 {user.name}
                  <span className="caret">▾</span>
                </button>
                <div className="user-dropdown-menu">
                  <button onClick={() => navigate('/profile')}>Profile</button>
                  <button onClick={() => navigate('/orders')}>My Orders</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-btn">Login</Link>
            )}
            <button className="cart-btn" onClick={toggleCart}>
              🛒 Cart
              {cartItems.length > 0 && (
                <span className={`cart-badge ${cartItems.some(item => item.isNew) ? 'cart-badge-pulse' : ''}`}>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} setCartItems={setCartItems} user={user} />

      {/* Location modal (rich) */}
      {showLocationModal && (
        <div className="location-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal rich" onClick={(e) => e.stopPropagation()}>
            <div className="location-left">
              <h3>Your Location</h3>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { if (searchTimer.current) clearTimeout(searchTimer.current); doSearchNow(locationInput.trim()) } }}
                placeholder="Search a new address"
                className="location-search"
              />

              {/* Search results (geocoding) */}
              {searchLoading && <div style={{fontSize:13, color:'#666', marginTop:8}}>Searching...</div>}
              {searchError && <div style={{fontSize:13, color:'#b00020', marginTop:8}}>{searchError}</div>}
              {searchResults.length > 0 && (
                <ul className="search-results" style={{listStyle:'none', padding:8, marginTop:8, maxHeight:200, overflow:'auto', background:'#fff', border:'1px solid #eee', borderRadius:8}}>
                              {searchResults.map(r => {
                                const addr = r.address || {}
                                const primary = addr.house_number ? `${addr.house_number} ${addr.road || addr.neighbourhood || ''}`.trim()
                                              : (addr.village || addr.town || addr.hamlet || addr.suburb || (r.display_name || '').split(',')[0])
                                const secondary = r.display_name
                                return (
                                  <li key={r.place_id} style={{padding:'8px 10px', cursor:'pointer'}} onClick={() => {
                                    const lat = parseFloat(r.lat)
                                    const lng = parseFloat(r.lon)
                                    setCoords({ lat, lng })
                                    setPlaceName(secondary)
                                    setLocationInput(secondary)
                                    setSearchResults([])
                                    try { window.localStorage.setItem('quikry_pincode', secondary); } catch(e){}
                                    try { window.localStorage.setItem('quikry_coords', JSON.stringify({ lat, lng })); } catch(e){}
                                    try { window.localStorage.setItem('quikry_place', secondary); } catch(e){}
                                  }}>
                                    <div style={{fontSize:14, fontWeight:600}}>{primary}</div>
                                    <div style={{fontSize:12, color:'#666', marginTop:4}}>{secondary}</div>
                                  </li>
                                )
                              })}
                </ul>
              )}
              {/* If no search results, allow saving exact typed address */}
              {!searchLoading && searchResults.length === 0 && locationInput.trim() !== '' && (
                <div style={{marginTop:10}}>
                  <div style={{fontSize:13, color:'#666'}}>No match found. You can save the exact address you typed.</div>
                  <button className="auth-button" style={{marginTop:8}} onClick={() => {
                    const next = locationInput.trim();
                    setPincode(next);
                    try { window.localStorage.setItem('quikry_pincode', next); } catch(e){}
                    setShowLocationModal(false);
                  }}>Use this exact address</button>
                </div>
              )}

              {placeName && (
                <div style={{marginBottom: 10, color: '#444', fontSize: 13}}>Resolved: <strong>{placeName}</strong></div>
              )}

              <div className="current-location-card">
                <div className="current-left">
                  <div className="loc-icon" aria-hidden>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2v4" stroke="#e53935" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" stroke="#e53935" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12h-4" stroke="#e53935" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 12H3" stroke="#e53935" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="loc-text">
                    <strong>Use My Current Location</strong>
                    <div className="small">Enable location for faster delivery & nearby options</div>
                  </div>
                </div>
                <div>
                  <button
                    className="enable-btn"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setGeoError('Geolocation not supported');
                        return;
                      }
                      setGeoError(null);
                      setGeoLoading(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setGeoLoading(false);
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          const coordsLabel = `${lat.toFixed(3)},${lng.toFixed(3)}`;
                          const label = `Current location (${coordsLabel})`;
                          setPincode(label);
                          setLocationInput(label);
                          setCoords({ lat, lng });
                          try { window.localStorage.setItem('quikry_pincode', label); } catch (e) {}
                          try { window.localStorage.setItem('quikry_coords', JSON.stringify({ lat, lng })); } catch (e) {}
                          setDeliveryEstimate('10');
                          setShowLocationModal(false);
                        },
                        (err) => {
                          setGeoLoading(false);
                          setGeoError(err.message || 'Unable to get location');
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                      );
                    }}
                  >
                    {geoLoading ? 'Enabling...' : 'Enable'}
                  </button>
                </div>
              </div>

              {geoError && <div className="geo-error">{geoError}</div>}

              <div className="modal-actions">
                <button className="btn" onClick={() => setShowLocationModal(false)}>Close</button>
                <button
                  className="auth-button"
                  onClick={() => {
                    const next = locationInput.trim();
                    if (next !== '') {
                      setPincode(next);
                      try { window.localStorage.setItem('quikry_pincode', next); } catch (e) {}
                      if (next.length === 6) setDeliveryEstimate('13'); else setDeliveryEstimate('20');
                    }
                    setShowLocationModal(false);
                  }}
                >Save</button>
              </div>
            </div>

            <div className="location-right">
              <div className="illustration">
                {coords ? (
                  <MapPreview coords={coords} />
                ) : (
                  <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="220" height="160" rx="12" fill="#f7f7fb" />
                    <circle cx="110" cy="60" r="28" fill="#ffdede" />
                    <path d="M80 120c10-10 30-10 40 0" stroke="#e53935" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="110" cy="60" r="10" fill="#e53935" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="nav-categories">
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.all} alt="All" className="category-icon" />
          <span>All</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.home} alt="Home" className="category-icon" />
          <span>Home</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.toys} alt="Toys" className="category-icon" />
          <span>Toys</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.fresh} alt="Fresh" className="category-icon" />
          <span>Fresh</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.electronics} alt="Electronics" className="category-icon" />
          <span>Electronics</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.mobiles} alt="Mobiles" className="category-icon" />
          <span>Mobiles</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.beauty} alt="Beauty" className="category-icon" />
          <span>Beauty</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={icons.fashion} alt="Fashion" className="category-icon" />
          <span>Fashion</span>
        </button>
      </div>

      <main>
        <div className="category-scroll">
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.fruits} alt="Fruits & Vegetables" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Fruits & Vegetables</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.dairy} alt="Dairy, Bread & Eggs" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Dairy, Bread & Eggs</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.rice} alt="Atta, Rice, Oil & Dals" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Atta, Rice, Oil & Dals</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.meat} alt="Meat, Fish & Eggs" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Meat, Fish & Eggs</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.masala} alt="Masala & Dry Fruits" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Masala & Dry Fruits</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={categoryImages.breakfast} alt="Breakfast & Sauces" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Breakfast & Sauces</h3>
            </div>
          </div>
        </div>

        <div className="banner">
          <h2>Get Everything You Need</h2>
          <p>Fast delivery within 10 minutes</p>
          <button className="btn">Order Now</button>
        </div>

        {/* Products Component */}
        <Products 
          addToCart={addToCart} 
          cartItems={cartItems} 
          updateQuantity={updateQuantity} 
          searchQuery={productSearchQuery}
        />

        <section className="why-choose-us">
          <h2>Why Choose Us</h2>
          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Get your orders delivered within 10 minutes to your doorstep with our lightning-fast delivery network</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🛒</div>
              <h3>Wide Selection</h3>
              <p>Choose from thousands of products across multiple categories to fulfill all your shopping needs</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Enjoy competitive prices, regular discounts, and exclusive deals that help you save on every purchase</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>Hassle-free return policy on all items with quick refunds and no questions asked policy</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Multiple secure payment options with end-to-end encryption to keep your financial information safe</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🌟</div>
              <h3>Premium Quality</h3>
              <p>All products undergo strict quality checks to ensure you receive only the best items every time</p>
            </div>
          </div>
        </section>

        <div className="promo-banners">
          <div className="promo-banner promo-hero promo-hero--left" role="region" aria-label="Super Sonic Deals">
            <div className="promo-deco deco-1" aria-hidden>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="44" fill="rgba(255,255,255,0.06)" />
                <path d="M20 60h80" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="promo-content">
              <h3 className="title">Super Sonic Deals</h3>
              <p className="subtitle">UP TO <strong>90% OFF</strong></p>
              <div className="promo-cta">
                <button className="btn glass-cta">Shop Now</button>
                <div className="spark" aria-hidden />
              </div>
            </div>
          </div>

          <div className="promo-banner promo-hero promo-hero--right" role="region" aria-label="Beauty LIT Fest">
            <div className="promo-deco deco-2" aria-hidden>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="100" height="100" rx="18" fill="rgba(255,255,255,0.05)" />
              </svg>
            </div>
            <div className="promo-content">
              <h3 className="title">Beauty LIT Fest</h3>
              <p className="subtitle">UP TO <strong>60% OFF</strong></p>
              <div className="promo-cta">
                <button className="btn glass-cta">Explore</button>
                <div className="spark" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Zepto-like) */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-left">
              <div className="brand">QuikRy</div>
              <div className="socials">
                <button className="social-link" aria-label="instagram" onClick={() => window.open('https://instagram.com', '_blank')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#E1306C" strokeWidth="1.5"/>
                    <path d="M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="#E1306C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" />
                  </svg>
                </button>
                <button className="social-link" aria-label="twitter" onClick={() => window.open('https://twitter.com', '_blank')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M23 4.5c-.8.4-1.6.6-2.5.8.9-.6 1.6-1.6 1.9-2.7-.9.5-1.9.9-3 1.1C18.2 3 16.9 2.5 15.6 2.5c-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1C7.7 8 4.1 6 1.7 3.1c-.4.7-.6 1.6-.6 2.4 0 1.6.8 3 2 3.8-.7 0-1.4-.2-2-.6v.1c0 2.1 1.4 3.8 3.3 4.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.3-4 1.3H6c1.4.9 3 1.4 4.8 1.4 5.7 0 8.9-4.7 8.9-8.8v-.4c.6-.4 1.1-1 1.5-1.6-.6.3-1.2.5-1.9.6z" fill="#1DA1F2"/>
                  </svg>
                </button>
                <button className="social-link" aria-label="facebook" onClick={() => window.open('https://facebook.com', '_blank')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M22 12a10 10 0 10-11.6 9.9v-7H8.9v-3h2.5V9.1c0-2.5 1.5-3.8 3.6-3.8 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 3h-2v7A10 10 0 0022 12z" fill="#1877F2"/>
                  </svg>
                </button>
                <button className="social-link" aria-label="linkedin" onClick={() => window.open('https://linkedin.com', '_blank')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="#0A66C2"/>
                    <path d="M6.5 9.5h2.8v8H6.5v-8zM8.9 7.6c.9 0 1.5.6 1.5 1.4-.0.8-.6 1.4-1.5 1.4s-1.5-.6-1.5-1.4c0-.8.6-1.4 1.5-1.4zM11.6 9.5h2.7v1.1h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.6 2 3.6 4.6v5.9h-2.8v-5.2c0-1.2 0-2.8-1.7-2.8-1.7 0-1.9 1.3-1.9 2.6v5.4h-2.8v-8z" fill="#fff"/>
                  </svg>
                </button>
              </div>
              <div className="legal">© QuikRy Marketplace</div>
            </div>

            <div className="footer-columns">
              <div className="footer-col">
                <h4>Popular Searches</h4>
                <p className="muted">Avocado | Strawberry | Pomegranate | Beetroot | Bottle gourd | Potato | Lemon | Dalchini | Blueberry</p>
              </div>
              <div className="footer-col">
                <h4>Categories</h4>
                <ul>
                  <li>Fruits & Vegetables</li>
                  <li>Atta, Rice, Oil & Dals</li>
                  <li>Masala & Dry Fruits</li>
                  <li>Frozen Food & Ice Creams</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li>Home</li>
                  <li>Delivery Areas</li>
                  <li>Careers</li>
                  <li>Customer Support</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Download App</h4>
                <div className="download-btns">
                  <button className="download play">Get it on Play Store</button>
                  <button className="download app">Get it on App Store</button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <footer>
        <p>&copy; 2025 QuikRy. All rights reserved.</p>
      </footer>

      {/* Professional Location Selector */}
      <LocationSelector
        isOpen={showProfessionalLocationSelector}
        onClose={() => setShowProfessionalLocationSelector(false)}
        onLocationSelect={handleProfessionalLocationSelect}
        currentLocation={selectedLocation}
      />

      {/* Address Form */}
      <AddressForm
        isOpen={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onSave={handleAddressSave}
        detectedPincode={detectedLocation?.pincode}
        detectedCity={detectedLocation?.city}
        detectedState={detectedLocation?.state}
      />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminSupport />} />
          <Route path="/demo" element={<HighTechPanel />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

// Small MapPreview component — lazy-loads Leaflet and shows a compact map using MapTiler tiles
function MapPreview({ coords }){
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const key = process.env.REACT_APP_MAPTILER_KEY
    import('leaflet').then(L => {
      if (!mounted) return
      // Fix default marker icon paths for webpack/CRA
      if (L && L.Icon && L.Icon.Default) {
        L.Icon.Default.mergeOptions({
          iconUrl: markerIconUrl,
          shadowUrl: markerShadowUrl,
        })
      }
      const map = L.map(containerRef.current, { center: [coords.lat, coords.lng], zoom: 14, attributionControl: false, zoomControl: false })
      // Prefer MapTiler raster tiles when key available. Use the /tiles/v3/endpoint which
      // has broad compatibility. If tile requests fail, fall back to OpenStreetMap tiles.
  // Use MapTiler maps/streets raster tiles (256px) which is compatible and tested.
  const tileUrl = key ? `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${key}` : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileLayer = L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(map)
      tileLayer.on('tileerror', (err) => {
        console.warn('Map tiles failed, falling back to OSM tiles', err)
        try {
          tileLayer.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        } catch(e){}
      })
      L.marker([coords.lat, coords.lng]).addTo(map)
      mapRef.current = map
    }).catch(err => {
      console.warn('MapPreview leaflet load failed', err)
    })

    return () => {
      mounted = false
      if (mapRef.current) try { mapRef.current.remove() } catch(e){}
    }
  }, [coords])

  return (
    <div ref={containerRef} style={{width:'100%', height:160, borderRadius:12, overflow:'hidden'}} />
  )
}


