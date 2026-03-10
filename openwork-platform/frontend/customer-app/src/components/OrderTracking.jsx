import React, { useState } from 'react';
import ContactSupport from './ContactSupport.jsx';
import './OrderTracking.css';

const OrderTracking = ({ isOpen, onClose, order }) => {
  const [supportModal, setSupportModal] = useState(false);
  
  if (!isOpen || !order) return null;

  // Use actual order status from database for quick commerce
  const getOrderStatus = () => {
    // Use the actual status from the order object
    const actualStatus = order.status || 'pending';
    
    // Map database status to tracking status for quick commerce
    switch (actualStatus.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return 'placed';
      case 'accepted':
      case 'out_for_delivery':
        return 'on_the_way';
      case 'delivered':
        return 'delivered';
      default:
        return 'placed';
    }
  };

  const currentStatus = getOrderStatus();

  // Calculate timestamps based on actual order data
  const getStatusTimestamp = (status) => {
    const orderTime = new Date(order.createdAt || order.order_date);
    
    switch (status) {
      case 'placed':
        return orderTime;
      case 'on_the_way':
        // Return actual acceptance time if available, otherwise estimate
        return order.acceptedAt ? new Date(order.acceptedAt) : null;
      case 'delivered':
        // Return actual delivery time if available, otherwise estimate
        return order.deliveredAt ? new Date(order.deliveredAt) : null;
      default:
        return null;
    }
  };

  const trackingSteps = [
    {
      status: 'placed',
      title: 'Order Placed',
      description: 'Your order has been placed and is being processed',
      icon: '📋',
      completed: true,
      timestamp: getStatusTimestamp('placed')
    },
    {
      status: 'on_the_way',
      title: 'Agent Assigned & On the Way',
      description: 'A delivery agent has accepted your order and is on the way to deliver',
      icon: '🚴‍♂️',
      completed: ['on_the_way', 'delivered'].includes(currentStatus),
      timestamp: ['on_the_way', 'delivered'].includes(currentStatus) 
        ? getStatusTimestamp('on_the_way') : null
    },
    {
      status: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      icon: '✅',
      completed: currentStatus === 'delivered',
      timestamp: currentStatus === 'delivered' 
        ? getStatusTimestamp('delivered') : null
    }
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    if (currentStatus === 'delivered') return 'Delivered';
    
    const orderTime = new Date(order.order_date);
    const estimatedDeliveryTime = new Date(orderTime.getTime() + (18 * 60 * 60 * 1000)); // 18 hours
    
    const now = new Date();
    if (estimatedDeliveryTime <= now) {
      return 'Delivered';
    }
    
    return formatTime(estimatedDeliveryTime);
  };

  return (
    <div className="tracking-overlay" onClick={onClose}>
      <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-header">
          <div className="tracking-title">
            <h2>Track Your Order</h2>
            <p>Order #{order.orderId || order.order_number}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tracking-content">
          <div className="delivery-info">
            <div className="delivery-box">
              <div className="delivery-icon">🚚</div>
              <div className="delivery-details">
                <h3>Estimated Delivery</h3>
                <p className="delivery-time">{getEstimatedDelivery()}</p>
                <p className="delivery-address">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="tracking-timeline">
            {trackingSteps.map((step, index) => (
              <div 
                key={step.status} 
                className={`timeline-step ${step.completed ? 'completed' : ''} ${currentStatus === step.status ? 'current' : ''}`}
              >
                <div className="step-indicator">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-line"></div>
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <h4>{step.title}</h4>
                    {step.timestamp && (
                      <span className="step-time">{formatTime(step.timestamp)}</span>
                    )}
                  </div>
                  <p className="step-description">{step.description}</p>
                  
                  {currentStatus === step.status && (
                    <div className="current-status">
                      <span className="status-indicator">🔴 Current Status</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="order-details">
            <h3>Order Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Payment ID:</span>
                <span className="value">{order.payment_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Amount:</span>
                <span className="value amount">₹{order.totalAmount || order.total_amount || order.total}</span>
              </div>
              <div className="detail-item">
                <span className="label">Items:</span>
                <span className="value">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="tracking-actions">
            <button className="action-btn primary" onClick={onClose}>
              Continue Shopping
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => setSupportModal(true)}
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Contact Support Modal */}
        <ContactSupport 
          isOpen={supportModal}
          onClose={() => setSupportModal(false)}
          order={order}
        />
      </div>
    </div>
  );
};

export default OrderTracking;