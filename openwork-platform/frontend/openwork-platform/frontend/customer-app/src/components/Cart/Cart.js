import React from 'react';
import '../../styles/Cart.css';

const Cart = ({ isOpen, onClose, cartItems = [], setCartItems }) => {
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
                <button className="proceed-btn">
                  Login to Proceed →
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
