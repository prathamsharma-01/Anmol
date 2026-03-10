import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Products from './components/Products';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Cart from './components/Cart/Cart';
import HighTechPanel from './components/HighTechDemo/HighTechPanel';

// Import category icons
import allIcon from './assets/icons/all.svg';
import homeIcon from './assets/icons/home.svg';
import toysIcon from './assets/icons/toys.svg';
import freshIcon from './assets/icons/fresh.svg';
import electronicsIcon from './assets/icons/electronics.svg';
import mobilesIcon from './assets/icons/mobiles.svg';
import beautyIcon from './assets/icons/beauty.svg';
import fashionIcon from './assets/icons/fashion.svg';

// Import category card images
import fruitsImage from './assets/category-images/Fruits & Vegetables.jpeg';
import dairyImage from './assets/category-images/Dairy, Bread & Eggs.webp';
import riceImage from './assets/category-images/Atta, Rice, Oil & Dals.webp.jpeg';
import meatImage from './assets/category-images/Meat, Fish & Eggs.jpg.webp';
import masalaImage from './assets/category-images/Masala & Dry Fruits.jpg';
import breakfastImage from './assets/category-images/Breakfast & Sauces.jpg';

function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [pincode, setPincode] = useState('136118');
  const [deliveryEstimate, setDeliveryEstimate] = useState('13');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState(pincode);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [placeName, setPlaceName] = useState('');
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
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
        document.body.removeChild(confirmationDiv);
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
    
    // Cart will only open when toggleCart is called, not automatically when items are added
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
              onClick={() => setShowLocationModal(true)}
              title={placeName || pincode}
            >
              <span className="pin">📍</span>
              <span className="loc-text">{placeName ? ` ${placeName.split(',')[0]}` : pincode}</span>
              <span className="caret">▾</span>
            </button>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search for services and products" />
          </div>
          <div className="user-actions">
            <Link to="/login" className="login-btn">Login</Link>
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
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} setCartItems={setCartItems} />

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
                  <iframe
                    title="location-map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.02}%2C${coords.lat-0.02}%2C${coords.lng+0.02}%2C${coords.lat+0.02}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                    style={{border:0, width: '100%', height: 160, borderRadius: 12}}
                    loading="lazy"
                  />
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
          <img src={allIcon} alt="All" className="category-icon" />
          <span>All</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={homeIcon} alt="Home" className="category-icon" />
          <span>Home</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={toysIcon} alt="Toys" className="category-icon" />
          <span>Toys</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={freshIcon} alt="Fresh" className="category-icon" />
          <span>Fresh</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={electronicsIcon} alt="Electronics" className="category-icon" />
          <span>Electronics</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={mobilesIcon} alt="Mobiles" className="category-icon" />
          <span>Mobiles</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={beautyIcon} alt="Beauty" className="category-icon" />
          <span>Beauty</span>
        </button>
        <button className="category" onClick={(e) => e.preventDefault()}>
          <img src={fashionIcon} alt="Fashion" className="category-icon" />
          <span>Fashion</span>
        </button>
      </div>

      <main>
        <div className="category-scroll">
          <div className="category-card">
            <div className="category-img">
              <img src={fruitsImage} alt="Fruits & Vegetables" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Fruits & Vegetables</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={dairyImage} alt="Dairy, Bread & Eggs" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Dairy, Bread & Eggs</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={riceImage} alt="Atta, Rice, Oil & Dals" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Atta, Rice, Oil & Dals</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={meatImage} alt="Meat, Fish & Eggs" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Meat, Fish & Eggs</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={masalaImage} alt="Masala & Dry Fruits" className="category-card-icon" />
            </div>
            <div className="category-content">
              <h3>Masala & Dry Fruits</h3>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-img">
              <img src={breakfastImage} alt="Breakfast & Sauces" className="category-card-icon" />
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
        <Products addToCart={addToCart} cartItems={cartItems} updateQuantity={updateQuantity} />

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
                <button className="social-link" aria-label="instagram" onClick={() => window.open('https://instagram.com', '_blank')}>Instagram</button>
                <button className="social-link" aria-label="twitter" onClick={() => window.open('https://twitter.com', '_blank')}>Twitter</button>
                <button className="social-link" aria-label="facebook" onClick={() => window.open('https://facebook.com', '_blank')}>Facebook</button>
                <button className="social-link" aria-label="linkedin" onClick={() => window.open('https://linkedin.com', '_blank')}>LinkedIn</button>
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
          <Route path="/demo" element={<HighTechPanel />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;