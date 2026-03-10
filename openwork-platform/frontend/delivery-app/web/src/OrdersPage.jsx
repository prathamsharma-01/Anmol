import React, { useState } from 'react';
import DeliveryLocationNav from './DeliveryLocationNav.jsx';

function formatPrice(amount) {
  return `₹${amount?.toFixed(2) || '0.00'}`;
}

function formatOrderTime(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export default function OrdersPage({ order = null, onMarkDelivered = () => {}, currentUser = null }) {
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);

  if (!order) {
    return (
      <div style={{ 
        padding: '40px',
        textAlign: 'center',
        color: '#666',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Select an Order</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Choose an order from the left panel to view details
        </p>
      </div>
    );
  }

  const isAccepted = order.status === 'accepted' || order.status === 'out_for_delivery';
  const isAssignedToMe = order.assignedTo === currentUser?.name || order.deliveryPersonId === currentUser?.id;
  const canMarkDelivered = isAccepted && isAssignedToMe;

  const handleMarkDelivered = async () => {
    setIsMarkingDelivered(true);
    try {
      await onMarkDelivered(order.id);
    } finally {
      setIsMarkingDelivered(false);
    }
  };

  return (
    <div style={{ 
      height: '100%',
      maxHeight: '100%',
      width: '100%',
      maxWidth: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        background: '#f8f9fa',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              margin: '0 0 4px 0', 
              color: '#333',
              fontSize: '20px',
              wordBreak: 'break-word'
            }}>
              {order.orderId || `Order #${order.id}`}
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              Ordered: {formatOrderTime(order.orderTime)}
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#e53935',
            marginLeft: '16px',
            flexShrink: 0
          }}>
            {formatPrice(order.total)}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ 
        padding: '20px',
        flex: 1,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Order Status */}
        <div style={{
          background: isAccepted ? '#e8f5e8' : '#fff3cd',
          color: isAccepted ? '#0a7d2f' : '#856404',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {isAccepted ? (isAssignedToMe ? '✅ Accepted by You' : '🚚 In Progress') : '⏳ Waiting for Acceptance'}
        </div>

        {/* Customer Information - Privacy Protected */}
        {isAccepted ? (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#333',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👤 Customer Information
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                {order.customer || 'Customer Name'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {order.phone && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📞 <a href={`tel:${order.phone}`} style={{ color: '#e53935', textDecoration: 'none' }}>
                      {order.phone}
                    </a>
                  </div>
                )}
                {order.email && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📧 <a href={`mailto:${order.email}`} style={{ color: '#e53935', textDecoration: 'none' }}>
                      {order.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                📍 Delivery Address:
              </div>
              <div style={{
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.4',
                background: '#fff',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                {order.address}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              🔒 Customer Privacy Protected
            </div>
            <div style={{ fontSize: '14px' }}>
              Customer details will be revealed after you accept this order
            </div>
            <div style={{
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.4',
              background: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              marginTop: '8px'
            }}>
              📍 Delivery Area: {order.address ? order.address.split(',').slice(-2).join(',') : 'Available after acceptance'}
            </div>
          </div>
        )}

        {/* Delivery Location Navigation - Only for accepted orders */}
        {isAccepted && order.delivery_location && (
          <DeliveryLocationNav 
            deliveryLocation={order.delivery_location}
            customerPhone={order.phone}
          />
        )}

        {/* Order Items */}
        <div style={{
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#333',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛍️ Order Items ({order.items?.length || 0})
          </h3>
          
          {order.items && order.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items.map((item, index) => (
                <div key={index} style={{
                  background: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Quantity: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: '600',
                    color: '#e53935'
                  }}>
                    {formatPrice(item.quantity * item.price)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No items information available
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div style={{
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#333',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💳 Payment Details
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            padding: '12px',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontWeight: '600', color: '#333' }}>
                Payment Method
              </div>
              <div style={{
                fontSize: '14px',
                color: order.paymentMethod === 'online' ? '#0a7d2f' : '#856404',
                fontWeight: '500'
              }}>
                {order.paymentMethod === 'online' ? '✅ Paid Online' : '💰 Cash on Delivery'}
              </div>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#e53935'
            }}>
              {formatPrice(order.total)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          marginTop: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => {
              const address = encodeURIComponent(order.address || '');
              const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
              window.open(url, '_blank');
            }}
            style={{
              flex: 1,
              minWidth: '0',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: '#fff',
              border: 'none',
              padding: '16px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            🗺️ Navigate
          </button>

          {canMarkDelivered && (
            <button
              onClick={handleMarkDelivered}
              disabled={isMarkingDelivered}
              style={{
                flex: 1,
                minWidth: '0',
                background: isMarkingDelivered ? '#95a5a6' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: '#fff',
                border: 'none',
                padding: '16px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: isMarkingDelivered ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isMarkingDelivered ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Marking...
                </>
              ) : (
                <>
                  ✅ Delivered
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}