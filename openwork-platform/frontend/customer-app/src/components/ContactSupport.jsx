import React, { useState } from 'react';
import './ContactSupport.css';

const ContactSupport = ({ isOpen, onClose, order }) => {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const issueTypes = [
    'Order not delivered',
    'Wrong items received',
    'Damaged items',
    'Payment issues',
    'Delivery delay',
    'Cancel order',
    'Refund request',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get user data
      const user = JSON.parse(localStorage.getItem('quikry_user'));
      
      const supportData = {
        user_id: user._id,
        user_name: user.name,
        user_email: user.email,
        user_phone: user.phone,
        order_number: order ? (order.orderId || order.order_number) : null,
        order_id: order ? order._id : null,
        order_amount: order ? (order.totalAmount || order.total_amount || order.total) : null,
        order_items_count: order ? order.items.length : null,
        issue_type: selectedIssue,
        message: message,
        contact_method: contactMethod
      };

      const response = await fetch('http://localhost:8000/api/support/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supportData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`Support request submitted successfully! Ticket Number: ${result.ticket_number}\nWe will contact you within 24 hours.`);
        onClose();
        
        // Reset form
        setSelectedIssue('');
        setMessage('');
        setContactMethod('email');
      } else {
        alert('Failed to submit support request. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Network error. Please check if the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-overlay" onClick={onClose}>
      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        <div className="support-header">
          <div className="support-title">
            <h2>Contact Support</h2>
            <p>We're here to help with your order</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="support-content">
          {order && (
            <div className="order-reference">
              <div className="order-ref-header">
                <span className="order-icon">📋</span>
                <div>
                  <h4>Order Reference</h4>
                  <p>#{order.orderId || order.order_number}</p>
                </div>
              </div>
              <div className="order-ref-details">
                <span>Amount: ₹{order.totalAmount || order.total_amount || order.total}</span>
                <span>Items: {order.items.length}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label>What can we help you with?</label>
              <select 
                value={selectedIssue} 
                onChange={(e) => setSelectedIssue(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Select an issue</option>
                {issueTypes.map((issue, index) => (
                  <option key={index} value={issue}>{issue}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Describe your issue</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please provide details about your issue..."
                required
                rows="4"
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-group">
              <label>How would you like us to contact you?</label>
              <div className="contact-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="email"
                    checked={contactMethod === 'email'}
                    onChange={(e) => setContactMethod(e.target.value)}
                  />
                  <span className="radio-icon">📧</span>
                  Email
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="phone"
                    checked={contactMethod === 'phone'}
                    onChange={(e) => setContactMethod(e.target.value)}
                  />
                  <span className="radio-icon">📞</span>
                  Phone Call
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="whatsapp"
                    checked={contactMethod === 'whatsapp'}
                    onChange={(e) => setContactMethod(e.target.value)}
                  />
                  <span className="radio-icon">💬</span>
                  WhatsApp
                </label>
              </div>
            </div>

            <div className="support-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>

          <div className="quick-help">
            <h4>Quick Help</h4>
            <div className="help-options">
              <div className="help-item">
                <span className="help-icon">❓</span>
                <div>
                  <h5>FAQ</h5>
                  <p>Find answers to common questions</p>
                </div>
              </div>
              <div className="help-item">
                <span className="help-icon">💬</span>
                <div>
                  <h5>Live Chat</h5>
                  <p>Chat with our support team</p>
                </div>
              </div>
              <div className="help-item">
                <span className="help-icon">📞</span>
                <div>
                  <h5>Call Us</h5>
                  <p>+91-9876543210</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;