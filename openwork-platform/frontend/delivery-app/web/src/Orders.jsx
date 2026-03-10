import React from 'react'

function openGoogleMapsDirections(lat, lng){
  if (!lat || !lng) return
  // try to get current location
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`
      const dest = `${lat},${lng}`
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`
      window.open(url, '_blank')
    }, err => {
      // fallback: open maps with destination only (device will use current location)
      const dest = `${lat},${lng}`
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`
      window.open(url, '_blank')
    })
  } else {
    const dest = `${lat},${lng}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`
    window.open(url, '_blank')
  }
}

function formatOrderTime(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatPrice(amount) {
  return `₹${amount?.toFixed(2) || '0.00'}`;
}

function getItemsSummary(items) {
  if (!items || items.length === 0) return 'No items';
  if (items.length === 1) return `${items[0].name} x${items[0].quantity}`;
  return `${items[0].name} +${items.length - 1} more`;
}

export default function Orders({ orders = [], onAccept = ()=>{}, onSelect = ()=>{}, selectedOrderId = null, currentUser = null }){
  if (orders.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No Pending Orders</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Orders from customers will appear here automatically
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%',
      maxHeight: '100%', // Prevent overflow
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        background: '#f8f9fa',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        flexShrink: 0 // Don't shrink header
      }}>
        <h3 style={{ margin: '0', color: '#333', fontSize: '18px' }}>
          📋 Available Orders ({orders.length})
        </h3>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        padding: '16px',
        flex: 1,
        overflowY: 'auto' // Allow scrolling for orders
      }}>
        {orders.map(order => {
          const isSelected = order.id === selectedOrderId;
          const isAccepted = order.status === 'accepted' || order.status === 'out_for_delivery';
          const isAssignedToMe = order.assignedTo === currentUser?.name || order.deliveryPersonId === currentUser?.id;
          
          return (
            <div 
              key={order.id} 
              onClick={() => onSelect(order.id)} 
              style={{
                background: '#fff',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                boxShadow: isSelected ? '0 8px 25px rgba(229, 57, 53, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: isSelected ? '4px solid #e53935' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isSelected ? '1px solid rgba(229, 57, 53, 0.2)' : '1px solid #f0f0f0'
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {order.orderId || `#${order.id}`}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      🕒 Ordered at {formatOrderTime(order.orderTime)}
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

                {/* Customer Info - Privacy Protected */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>👤</span>
                  <div>
                    {isAccepted ? (
                      <>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                          {order.customer}
                        </div>
                        {order.phone && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            📞 {order.phone}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#94a3b8',
                        fontSize: '13px'
                      }}>
                        🔒 Hidden for privacy
                      </div>
                    )}
                  </div>
                </div>

                {/* Address - Partial before acceptance */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', marginTop: '2px' }}>📍</span>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {isAccepted 
                      ? order.address 
                      : `📍 ${order.address ? order.address.split(',').slice(-2).join(',') : 'Area hidden'}`
                    }
                  </div>
                </div>

                {/* Items Summary */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px' }}>🛍️</span>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    background: '#f8f9fa',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    {getItemsSummary(order.items)}
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '14px' }}>💳</span>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    background: order.paymentMethod === 'online' ? '#e8f5e8' : '#fff3cd',
                    color: order.paymentMethod === 'online' ? '#0a7d2f' : '#856404',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {order.paymentMethod === 'online' ? '✅ Paid Online' : '💰 Cash on Delivery'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginLeft: '16px',
                minWidth: '120px'
              }}>
                {/* Order Status */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: isAccepted ? '#e8f5e8' : '#fff3cd',
                  color: isAccepted ? '#0a7d2f' : '#856404'
                }}>
                  {isAccepted ? (isAssignedToMe ? '✅ Accepted by You' : '🚚 In Progress') : '⏳ Pending'}
                </div>

                {/* Accept Button */}
                {!isAccepted && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onAccept(order.id) 
                    }} 
                    style={{
                      background: 'linear-gradient(135deg, #e53935, #d32f2f)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🎯 Accept Order
                  </button>
                )}

                {/* Navigate Button */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    openGoogleMapsDirections(order.lat, order.lng) 
                  }} 
                  style={{
                    background: '#fff',
                    color: '#e53935',
                    border: '2px solid #e53935',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e53935';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#e53935';
                  }}
                >
                  🗺️ Navigate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
