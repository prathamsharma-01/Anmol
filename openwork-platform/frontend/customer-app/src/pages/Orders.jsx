import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking.jsx';
import OrderLocation from '../components/OrderLocation.jsx';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, order: null });
  const [activeSection, setActiveSection] = useState('orders'); // Add active section state
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data
    const savedUser = JSON.parse(localStorage.getItem('quikry_user'));
    if (savedUser) {
      setUser(savedUser);
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('quikry_user'));
      
      if (!user || !user._id) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/orders/user/${user._id}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quikry_user');
    navigate('/login');
  };

  // Profile Component
  const ProfileSection = () => (
    <div className="section-content">
      <h2>My Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn-primary">Edit Profile</button>
          <button className="btn-secondary">Change Password</button>
        </div>
      </div>
    </div>
  );

  // Addresses Component
  const AddressesSection = () => (
    <div className="section-content">
      <h2>My Addresses</h2>
      <div className="addresses-grid">
        <div className="address-card">
          <h4>Home</h4>
          <p>123 Main Street<br/>City, State 12345<br/>Phone: +1234567890</p>
          <div className="address-actions">
            <button className="btn-edit">Edit</button>
            <button className="btn-delete">Delete</button>
          </div>
        </div>
        <div className="address-card add-new">
          <div className="add-icon">+</div>
          <p>Add New Address</p>
        </div>
      </div>
    </div>
  );

  // Payment Methods Component
  const PaymentMethodsSection = () => (
    <div className="section-content">
      <h2>Payment Methods</h2>
      <div className="payment-methods">
        <div className="payment-card">
          <div className="card-info">
            <div className="card-icon">💳</div>
            <div>
              <h4>**** **** **** 1234</h4>
              <p>Expires 12/25</p>
            </div>
          </div>
          <button className="btn-remove">Remove</button>
        </div>
        <div className="payment-card add-new">
          <div className="add-icon">+</div>
          <p>Add New Payment Method</p>
        </div>
      </div>
    </div>
  );

  // Wishlist Component
  const WishlistSection = () => (
    <div className="section-content">
      <h2>My Wishlist</h2>
      <div className="wishlist-grid">
        <div className="wishlist-item">
          <img src="/api/placeholder/100/100" alt="Product" />
          <div className="item-info">
            <h4>Product Name</h4>
            <p className="price">₹299</p>
          </div>
          <div className="item-actions">
            <button className="btn-primary">Add to Cart</button>
            <button className="btn-remove">Remove</button>
          </div>
        </div>
      </div>
      {/* Empty state */}
      <div className="empty-state">
        <div className="empty-icon">❤️</div>
        <h3>Your wishlist is empty</h3>
        <p>Save items you love for later</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Start Shopping
        </button>
      </div>
    </div>
  );

  // Gift Cards Component
  const GiftCardsSection = () => (
    <div className="section-content">
      <h2>Gift Cards</h2>
      <div className="gift-cards">
        <div className="gift-card-balance">
          <h3>Available Balance</h3>
          <div className="balance-amount">₹0</div>
        </div>
        <div className="gift-card-actions">
          <button className="btn-primary">Purchase Gift Card</button>
          <button className="btn-secondary">Redeem Gift Card</button>
        </div>
      </div>
    </div>
  );

  // Contact Us Component
  const ContactUsSection = () => (
    <div className="section-content">
      <h2>Contact Us</h2>
      <div className="contact-options">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h4>Call Us</h4>
          <p>+91 1234567890</p>
          <p>Mon-Sat: 9AM-9PM</p>
        </div>
        <div className="contact-card">
          <div className="contact-icon">📧</div>
          <h4>Email Support</h4>
          <p>support@quikry.com</p>
          <p>Response within 24hrs</p>
        </div>
        <div className="contact-card">
          <div className="contact-icon">💬</div>
          <h4>Live Chat</h4>
          <p>Chat with our team</p>
          <button className="btn-primary">Start Chat</button>
        </div>
      </div>
    </div>
  );

  // Help Center Component
  const HelpCenterSection = () => (
    <div className="section-content">
      <h2>Help Center</h2>
      <div className="help-topics">
        <div className="help-category">
          <h4>Order Issues</h4>
          <ul>
            <li>Track your order</li>
            <li>Cancel or modify order</li>
            <li>Order not delivered</li>
          </ul>
        </div>
        <div className="help-category">
          <h4>Payment & Refunds</h4>
          <ul>
            <li>Payment methods</li>
            <li>Refund status</li>
            <li>Payment failed</li>
          </ul>
        </div>
        <div className="help-category">
          <h4>Account & Profile</h4>
          <ul>
            <li>Update profile</li>
            <li>Change password</li>
            <li>Delete account</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Return Policy Component
  const ReturnPolicySection = () => (
    <div className="section-content">
      <h2>Return Policy</h2>
      <div className="policy-content">
        <div className="policy-section">
          <h4>Return Window</h4>
          <p>You can return most items within 7 days of delivery for a full refund.</p>
        </div>
        <div className="policy-section">
          <h4>Return Process</h4>
          <ol>
            <li>Go to "My Orders" and select the item to return</li>
            <li>Choose return reason and schedule pickup</li>
            <li>Package the item in original condition</li>
            <li>Hand over to our delivery partner</li>
          </ol>
        </div>
        <div className="policy-section">
          <h4>Refund Timeline</h4>
          <p>Refunds are processed within 5-7 business days after we receive the returned item.</p>
        </div>
      </div>
    </div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'orders':
        return (
          <div className="orders-section">
            <h2>My Orders</h2>
            {loading ? (
              <div className="loading-state">Loading orders...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>When you place orders, they'll appear here</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h4>Order #{order.orderId || order.order_number}</h4>
                        <p>Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown date'}</p>
                      </div>
                      <div className="order-total">₹{order.totalAmount || order.total_amount || order.total}</div>
                    </div>
                    <div className="order-items">
                      <div className="items-header">
                        <span className="items-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image-container">
                              <img 
                                src={item.image || '/api/placeholder/50/50'} 
                                alt={item.name}
                                className="item-mini-image"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/50/50';
                                }}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-quantity">Qty: {item.quantity}</div>
                            </div>
                            <div className="item-price">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display delivery location */}
                    {order.delivery_location && (
                      <OrderLocation deliveryLocation={order.delivery_location} />
                    )}
                    
                    <div className="order-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => setTrackingModal({ isOpen: true, order })}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'profile':
        return <ProfileSection />;
      case 'addresses':
        return <AddressesSection />;
      case 'payment':
        return <PaymentMethodsSection />;
      case 'wishlist':
        return <WishlistSection />;
      case 'giftcards':
        return <GiftCardsSection />;
      case 'contact':
        return <ContactUsSection />;
      case 'help':
        return <HelpCenterSection />;
      case 'returns':
        return <ReturnPolicySection />;
      default:
        return renderContent();
    }
  };

  const openTrackingModal = (order) => {
    setTrackingModal({ isOpen: true, order });
  };

  const closeTrackingModal = () => {
    setTrackingModal({ isOpen: false, order: null });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'preparing': return '#FF9800';
      case 'dispatched': return '#2196F3';
      case 'delivered': return '#8BC34A';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="orders-page">
      {/* Header */}
      <header className="orders-header">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <h1>QuikRy</h1>
            </Link>
          </div>
          <div className="header-actions">
            {user && (
              <div className="user-info">
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="orders-layout">
        {/* Main Content - Centered */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* Order Tracking Modal */}
      <OrderTracking 
        isOpen={trackingModal.isOpen}
        onClose={closeTrackingModal}
        order={trackingModal.order}
      />
    </div>
  );
};

export default Orders;