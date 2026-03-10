import React, { useMemo, useState, useEffect } from 'react'
import { Header, Banner, Footer, LoginCard, RegisterCard } from '../../../shared-ui/src/index.jsx'
import '../../../shared-ui/src/shared.css'
import Orders from './Orders'
import OrdersPage from './OrdersPage'
import DeliveryMap from './DeliveryMap'
import AgentDashboard from './AgentDashboard'

export default function App(){
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [user, setUser] = useState(() => {
    try { 
      return JSON.parse(window.localStorage.getItem('delivery_user')) 
    } catch(e) { 
      return null 
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Fetch pending orders when user logs in
  useEffect(() => {
    if (user) {
      fetchPendingOrders();
      // Refresh orders every 30 seconds
      const interval = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      // Fetch real customer orders from the database
      const response = await fetch('http://localhost:8000/api/orders');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched orders response:', data);
      
      if (data.success && data.orders && Array.isArray(data.orders)) {
        // Transform the order data to match our delivery app format
        // Filter out delivered orders - they should not appear in the active list
        const transformedOrders = data.orders
          .filter(order => order.status !== 'delivered') // Hide delivered orders
          .map(order => ({
            id: order._id,
            orderId: order.orderId || order._id,
            customer: order.customerDetails?.name || order.customerDetails?.username || 'Unknown Customer',
            phone: order.customerDetails?.phone || 'No phone',
            email: order.customerDetails?.email || 'No email',
            address: order.deliveryAddress?.fullAddress || order.address || 'No address',
            items: order.items || [],
            total: order.totalAmount || order.total || 0,
            status: order.status || 'pending',
            orderTime: order.createdAt || order.orderTime || new Date(),
            paymentMethod: order.paymentMethod || 'cash',
            paymentId: order.paymentId || order.razorpayOrderId,
            assignedTo: order.assignedTo,
            deliveryPersonId: order.deliveryPersonId
          }));
        
        console.log('Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
        setError(''); // Clear any previous errors
      } else {
        // Add test data for debugging
        const testOrders = [
          {
            id: 'test-1',
            orderId: 'ORD-001',
            customer: 'John Doe',
            phone: '+91 9876543210',
            address: '123 Main Street, Delhi, India',
            items: [
              { name: 'Laptop', quantity: 1, price: 50000 },
              { name: 'Mouse', quantity: 2, price: 500 }
            ],
            total: 51000,
            status: 'pending',
            orderTime: new Date(),
            paymentMethod: 'online',
            assignedTo: null,
            deliveryPersonId: null
          },
          {
            id: 'test-2',
            orderId: 'ORD-002',
            customer: 'Jane Smith',
            phone: '+91 9876543211',
            address: '456 Park Avenue, Mumbai, India',
            items: [
              { name: 'Phone', quantity: 1, price: 25000 }
            ],
            total: 25000,
            status: 'pending',
            orderTime: new Date(),
            paymentMethod: 'cash',
            assignedTo: null,
            deliveryPersonId: null
          }
        ];
        
        console.log('Using test orders:', testOrders);
        setOrders(testOrders);
        setError('Using test data - no real orders found');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Add test data when backend is not available
      const testOrders = [
        {
          id: 'test-1',
          orderId: 'ORD-001',
          customer: 'John Doe',
          phone: '+91 9876543210',
          address: '123 Main Street, Delhi, India',
          items: [
            { name: 'Laptop', quantity: 1, price: 50000 },
            { name: 'Mouse', quantity: 2, price: 500 }
          ],
          total: 51000,
          status: 'pending',
          orderTime: new Date(),
          paymentMethod: 'online',
          assignedTo: null,
          deliveryPersonId: null
        }
      ];
      
      setOrders(testOrders);
      setError('Backend connection failed - showing test data');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryPersonId: user.id,
          deliveryPersonName: user.name
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local orders state
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { 
            ...o, 
            status: 'accepted', 
            assignedTo: user.name,
            deliveryPersonId: user.id
          } : o
        ));
        setSelectedOrderId(orderId);
        alert('Order accepted successfully!');
      } else {
        alert(data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Network error. Please try again.');
    }
  };

  const markDelivered = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'delivered',
          deliveryPersonId: user.id,
          deliveredAt: new Date()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local orders or update status
        setOrders(prev => prev.filter(o => o.id !== orderId));
        if (selectedOrderId === orderId) {
          setSelectedOrderId(null);
        }
        alert('Order marked as delivered successfully!');
      } else {
        alert(data.message || 'Failed to mark order as delivered');
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:8000/api/auth/delivery-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryPersonId: user.id
        })
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data
      setUser(null);
      setOrders([]);
      setSelectedOrderId(null);
      window.localStorage.removeItem('delivery_user');
    }
  };

  const selectOrder = (orderId) => {
    console.log('Selecting order:', orderId);
    console.log('Available orders:', orders);
    setSelectedOrderId(orderId);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    window.localStorage.setItem('delivery_user', JSON.stringify(userData));
  };

  const selectedOrder = useMemo(() => {
    const found = orders.find(o => o.id === selectedOrderId);
    console.log('Selected Order ID:', selectedOrderId);
    console.log('Found Order:', found);
    return found;
  }, [orders, selectedOrderId]);

  // Not logged in? Show login or register
  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <div className="auth-card register-card">
            <RegisterCard 
              onRegister={(userData) => {
                console.log('Registration successful:', userData);
                setShowRegister(false);
              }}
              onSwitchToLogin={() => setShowRegister(false)}
              userType="delivery"
            />
          </div>
        ) : (
          <div className="auth-card">
            <div className="auth-header">
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.05), rgba(211, 47, 47, 0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(229, 57, 53, 0.1)'
              }}>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: '900',
                  color: '#e53935',
                  margin: '0 0 8px 0',
                  letterSpacing: '-1px'
                }}>
                  QUIKRY
                </h1>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Delivery Partner Platform
                </div>
              </div>
              <h1 className="auth-title">🚛 Delivery Partner</h1>
              <p className="auth-subtitle">Sign in to start delivering orders</p>
            </div>
            
            <LoginCard 
              onLogin={handleLogin}
              userType="delivery"
              placeholder="Enter registered mobile number"
            />
            
            <div className="auth-switch">
              <p className="auth-switch-text">
                New delivery partner?
                <button
                  onClick={() => setShowRegister(true)}
                  className="auth-switch-button"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header showLoginButton={!user} showLocationButton={false} showCart={false} />
      
      {/* User Info Bar */}
      <div style={{ 
        backgroundColor: '#27ae60', 
        color: 'white', 
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Welcome, {user.name}!</strong>
          <span style={{ marginLeft: '20px', fontSize: '14px' }}>
            📱 {user.phone} | 🚛 {user.vehicleType || 'Bike'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowDashboard(true)}
            style={{
              backgroundColor: 'white',
              color: '#27ae60',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '5px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '10px', color: '#6c757d' }}>Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          padding: '15px 20px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderBottom: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchPendingOrders}
            style={{
              marginLeft: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <Banner 
        text={`📦 ${orders.length} orders available | ${orders.filter(o => o.status === 'accepted').length} accepted`}
        bgColor="#3498db"
      />

      <div style={{ 
        display: 'flex', 
        flex: 1,
        minHeight: '500px',
        maxHeight: 'calc(100vh - 200px)', // Prevent excessive height
        overflow: 'hidden' // Prevent container overflow
      }}>
        {/* Left side: Orders list */}
        <div style={{ 
          width: '450px',
          minWidth: '450px', // Prevent shrinking
          maxWidth: '450px', // Prevent growing
          borderRight: '2px solid #ddd',
          backgroundColor: '#f8f9fa',
          overflow: 'hidden', // Prevent overflow
          position: 'relative',
          zIndex: 2 // Ensure it stays on top
        }}>
          <Orders 
            orders={orders} 
            onAccept={acceptOrder} 
            onSelect={selectOrder}
            selectedOrderId={selectedOrderId}
            currentUser={user}
          />
        </div>

        {/* Right side: Order details */}
        <div style={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          minWidth: '0', // Allow shrinking
          overflow: 'hidden', // Prevent overflow
          position: 'relative',
          zIndex: 1,
          marginLeft: '0' // Ensure no overlap
        }}>
          {selectedOrder ? (
            <OrdersPage 
              order={selectedOrder} 
              onMarkDelivered={markDelivered}
              currentUser={user}
            />
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#6c757d',
              fontSize: '18px',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
                <p>Select an order from the left to view details</p>
                {orders.length === 0 && !loading && (
                  <p style={{ marginTop: '20px', color: '#28a745' }}>
                    🎉 No pending orders! Check back later.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Dashboard Modal */}
      {showDashboard && (
        <AgentDashboard 
          user={user}
          onClose={() => setShowDashboard(false)}
        />
      )}

      <Footer />
    </div>
  );
}
