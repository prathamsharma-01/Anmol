import React, { useState, useEffect } from 'react';
import '../../styles/Cart.css';
import { initializeRazorpay, createRazorpayOrder, openRazorpayCheckout } from '../../utils/razorpay.js';

const Cart = ({ isOpen, onClose, cartItems = [], setCartItems, user }) => {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [userAddresses, setUserAddresses] = useState([]);

  useEffect(() => {
    if (user && user.addresses) {
      setUserAddresses(user.addresses);
      // Find default address or use first one
      const defaultIndex = user.addresses.findIndex(addr => addr.isDefault);
      setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
    }
  }, [user]);

  if (!isOpen) return null;

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const handleProceed = async () => {
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = '/login';
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Check if user has addresses
    if (!userAddresses || userAddresses.length === 0) {
      alert('⚠️ Please add your delivery address first!\n\nGo to Profile > Address Book to add an address.');
      return;
    }

    const selectedAddress = userAddresses[selectedAddressIndex];
    if (!selectedAddress) {
      alert('⚠️ Please select a delivery address!');
      return;
    }

    // 🔥 STEP 1: Validate stock availability before payment
    try {
      const stockCheckResponse = await fetch('http://localhost:8000/api/products/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity
          }))
        })
      });

      const stockCheck = await stockCheckResponse.json();

      if (!stockCheck.success || !stockCheck.allAvailable) {
        // Show stock issues to user
        const issues = stockCheck.items.filter(item => !item.canFulfill);
        const issueMessages = issues.map(item => `• ${item.name}: ${item.message}`).join('\n');
        
        alert(`⚠️ Some items are not available:\n\n${issueMessages}\n\nPlease update your cart.`);
        return;
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      alert('Failed to validate stock availability. Please try again.');
      return;
    }

    try {
      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      if (!isRazorpayLoaded) {
        alert('Payment gateway failed to load. Please try again.');
        return;
      }

      // Create order on backend
      const orderData = {
        amount: subtotal,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          user_id: user._id,
          user_name: user.name,
          items_count: cartItems.length
        }
      };

      const orderResponse = await createRazorpayOrder(orderData);
      
      if (!orderResponse.success) {
        alert('Failed to create payment order. Please try again.');
        return;
      }

      // Open Razorpay checkout
      const paymentOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderResponse.key_id, // Get from server response
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'QuikRy',
        description: `Order for ${cartItems.length} items`,
        order_id: orderResponse.order.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              card: {
                name: 'Debit/Credit Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              netbanking: {
                name: 'Net Banking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['upi', 'card', 'netbanking'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: '#e53935'
        }
      };

      const paymentResponse = await openRazorpayCheckout(paymentOptions);
      
      // Payment successful - Save order to database
      try {
        const selectedAddress = userAddresses[selectedAddressIndex];
        
        const orderSaveData = {
          user_id: user._id,
          user_name: user.name,
          user_email: user.email,
          user_phone: user.phone,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total_amount: subtotal,
          payment_id: paymentResponse.razorpay_payment_id,
          order_id: orderResponse.order.id,
          delivery_address: selectedAddress.fullAddress || `${selectedAddress.houseNo || ''} ${selectedAddress.street || ''}, ${selectedAddress.area || ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode || selectedAddress.zipCode}`.replace(/\s+/g, ' ').trim(),
          delivery_location: {
            fullAddress: selectedAddress.fullAddress || `${selectedAddress.houseNo || ''} ${selectedAddress.street || ''}, ${selectedAddress.area || ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode || selectedAddress.zipCode}`.replace(/\s+/g, ' ').trim(),
            houseNo: selectedAddress.houseNo || '',
            street: selectedAddress.street || '',
            landmark: selectedAddress.landmark || '',
            area: selectedAddress.area || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode || selectedAddress.zipCode,
            type: selectedAddress.addressType || selectedAddress.type,
            coordinates: {
              lat: null,
              lng: null
            }
          }
        };

        const saveResponse = await fetch('http://localhost:8000/api/orders/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderSaveData)
        });

        const saveResult = await saveResponse.json();
        
        if (saveResult.success) {
          alert(`Order placed successfully! Order Number: ${saveResult.order_number}`);
        } else {
          alert('Payment successful but failed to save order details.');
        }
      } catch (orderSaveError) {
        console.error('Error saving order:', orderSaveError);
        alert('Payment successful but failed to save order details.');
      }
      
      // Clear cart after successful payment
      setCartItems([]);
      onClose();

    } catch (error) {
      console.error('Payment error:', error);
      if (error.message === 'Payment cancelled by user') {
        alert('Payment was cancelled.');
      } else {
        alert('Payment failed. Please try again.');
      }
    }
  };

  const deliveryCharge = 25;
  const subtotal = calculateSubtotal();

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>My Cart</h2>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items-section">
                <div className="shipment-header">
                  <span className="store-badge">📦 1</span>
                  <div className="shipment-info">
                    <strong>Shipment of {cartItems.length} items</strong>
                  </div>
                </div>

                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className={`cart-item-card ${item.isNew ? 'new-item' : ''}`}>
                      <div className="cart-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name || item.title} />
                        ) : (
                          <div className="placeholder-img">📦</div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name || item.title || 'Product'}</h4>
                        {item.weight && <p className="item-weight">{item.weight}</p>}
                        <div className="item-price">₹{item.price || 0}</div>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="cart-address-section" style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '2px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '16px',
                  color: '#333'
                }}>
                  📍 Delivery Address
                </h3>
                {userAddresses && userAddresses.length > 0 ? (
                  <>
                    {/* Address Selection Dropdown */}
                    {userAddresses.length > 1 && (
                      <select
                        value={selectedAddressIndex}
                        onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '12px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {userAddresses.map((addr, index) => (
                          <option key={index} value={index}>
                            {addr.type === 'home' ? '🏠' : addr.type === 'work' ? '🏢' : '📍'} {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)} {addr.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {/* Selected Address Display */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '8px',
                      borderLeft: '4px solid #dc2626',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}>
                      <strong>
                        {userAddresses[selectedAddressIndex]?.addressType === 'home' || userAddresses[selectedAddressIndex]?.type === 'home' ? '🏠 Home' : 
                         userAddresses[selectedAddressIndex]?.addressType === 'work' || userAddresses[selectedAddressIndex]?.type === 'work' ? '🏢 Work' : 
                         userAddresses[selectedAddressIndex]?.customLabel ? `📍 ${userAddresses[selectedAddressIndex]?.customLabel}` : '📍 Other'}
                      </strong>
                      <br />
                      {userAddresses[selectedAddressIndex]?.houseNo && <><strong>{userAddresses[selectedAddressIndex]?.houseNo}</strong><br /></>}
                      {userAddresses[selectedAddressIndex]?.street && <>{userAddresses[selectedAddressIndex]?.street}<br /></>}
                      {userAddresses[selectedAddressIndex]?.landmark && <>Near {userAddresses[selectedAddressIndex]?.landmark}<br /></>}
                      {userAddresses[selectedAddressIndex]?.area && <>{userAddresses[selectedAddressIndex]?.area}<br /></>}
                      {userAddresses[selectedAddressIndex]?.city}, {userAddresses[selectedAddressIndex]?.state} - {userAddresses[selectedAddressIndex]?.pincode || userAddresses[selectedAddressIndex]?.zipCode}
                    </div>
                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                      <a 
                        href="/profile" 
                        style={{ 
                          color: '#dc2626', 
                          fontSize: '13px', 
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        + Add or edit addresses
                      </a>
                    </div>
                  </>
                ) : (
                  <div style={{
                    background: '#fef2f2',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '2px dashed #dc2626',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#dc2626',
                    fontWeight: '600'
                  }}>
                    ⚠️ No address added yet!<br/>
                    <a 
                      href="/profile" 
                      style={{ 
                        color: '#dc2626', 
                        fontSize: '13px', 
                        fontWeight: 'normal',
                        textDecoration: 'underline',
                        marginTop: '8px',
                        display: 'inline-block'
                      }}
                    >
                      Go to Profile → Address Book to add your address
                    </a>
                  </div>
                )}
              </div>

              <div className="cart-bill-section">
                <h3>Bill details</h3>
                <div className="bill-row">
                  <span className="bill-icon">🧾</span>
                  <span>Items total</span>
                  <span className="bill-amount">₹{subtotal}</span>
                </div>
                <div className="bill-row">
                  <span className="bill-icon">🚚</span>
                  <span>Delivery charge</span>
                  <span className="bill-amount delivery-free">
                    <del>₹{deliveryCharge}</del> FREE
                  </span>
                </div>
                <div className="bill-row grand-total">
                  <span>Grand total</span>
                  <span className="bill-amount">₹{subtotal}</span>
                </div>
              </div>

              <div className="cart-footer">
                <div className="total-section">
                  <div className="total-amount">₹{subtotal}</div>
                  <div className="total-label">TOTAL</div>
                </div>
                <button className="proceed-btn" onClick={handleProceed}>
                  {user ? `Proceed to Checkout →` : `Login to Proceed →`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
