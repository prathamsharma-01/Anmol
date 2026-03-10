import React, { useState, useEffect } from 'react';
import './AgentDashboard.css';

export default function AgentDashboard({ user, onClose }) {
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    totalDeliveries: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    averageDeliveryTime: 0,
    completionRate: 0,
    todayOrders: [],
    allDeliveredOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, earnings

  useEffect(() => {
    if (user) {
      fetchAgentStats();
    }
  }, [user]);

  const fetchAgentStats = async () => {
    try {
      setLoading(true);
      // Fetch all delivered orders for this agent
      const response = await fetch(`http://localhost:8000/api/orders/agent/${user.id || user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent stats');
      }
      
      const data = await response.json();
      
      if (data.success && data.orders) {
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.deliveredAt || order.updatedAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todayDeliveries = todayOrders.length;
    const totalDeliveries = orders.length;

    // Calculate earnings (assuming ₹50 per delivery as base)
    const earningsPerDelivery = 50;
    const todayEarnings = todayDeliveries * earningsPerDelivery;
    const totalEarnings = totalDeliveries * earningsPerDelivery;

    // Calculate average delivery time
    let totalTime = 0;
    let validTimeCount = 0;
    
    orders.forEach(order => {
      if (order.acceptedAt && order.deliveredAt) {
        const acceptTime = new Date(order.acceptedAt);
        const deliverTime = new Date(order.deliveredAt);
        const diff = (deliverTime - acceptTime) / (1000 * 60); // minutes
        if (diff > 0 && diff < 300) { // Valid time between 0-300 minutes
          totalTime += diff;
          validTimeCount++;
        }
      }
    });

    const averageDeliveryTime = validTimeCount > 0 ? Math.round(totalTime / validTimeCount) : 0;
    const completionRate = totalDeliveries > 0 ? 100 : 0; // Simplified

    setStats({
      todayDeliveries,
      totalDeliveries,
      todayEarnings,
      totalEarnings,
      averageDeliveryTime,
      completionRate,
      todayOrders,
      allDeliveredOrders: orders
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.loading}>
            <div className="dashboard-spinner" style={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div className="dashboard-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🚀 Agent Dashboard</h2>
            <p style={styles.subtitle}>{user?.name || 'Delivery Agent'}</p>
          </div>
          <button onClick={onClose} className="dashboard-close-btn" style={styles.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            className="dashboard-tab"
            style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className="dashboard-tab"
            style={{...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('history')}
          >
            📦 History
          </button>
          <button
            className="dashboard-tab"
            style={{...styles.tab, ...(activeTab === 'earnings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('earnings')}
          >
            💰 Earnings
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content" style={styles.content}>
          {activeTab === 'overview' && (
            <div style={styles.overview}>
              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div style={styles.statIcon}>📦</div>
                  <div style={styles.statValue}>{stats.todayDeliveries}</div>
                  <div style={styles.statLabel}>Today's Deliveries</div>
                </div>

                <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <div style={styles.statIcon}>🎯</div>
                  <div style={styles.statValue}>{stats.totalDeliveries}</div>
                  <div style={styles.statLabel}>Total Deliveries</div>
                </div>

                <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                  <div style={styles.statIcon}>⏱️</div>
                  <div style={styles.statValue}>{stats.averageDeliveryTime}m</div>
                  <div style={styles.statLabel}>Avg. Time</div>
                </div>

                <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statValue}>{stats.completionRate}%</div>
                  <div style={styles.statLabel}>Success Rate</div>
                </div>
              </div>

              {/* Today's Summary */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📅 Today's Summary</h3>
                <div style={styles.summaryBox}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Orders Completed:</span>
                    <span style={styles.summaryValue}>{stats.todayDeliveries}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Earnings Today:</span>
                    <span style={{...styles.summaryValue, color: '#10b981'}}>₹{stats.todayEarnings}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Average per Delivery:</span>
                    <span style={styles.summaryValue}>₹{stats.todayDeliveries > 0 ? Math.round(stats.todayEarnings / stats.todayDeliveries) : 0}</span>
                  </div>
                </div>
              </div>

              {/* Agent Info */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👤 Agent Information</h3>
                <div style={styles.infoBox}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Name:</span>
                    <span style={styles.infoValue}>{user?.name || '-'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Email:</span>
                    <span style={styles.infoValue}>{user?.email || '-'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Phone:</span>
                    <span style={styles.infoValue}>{user?.phone || '-'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Agent ID:</span>
                    <span style={styles.infoValue}>{user?.id || user?._id || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={styles.historyTab}>
              <h3 style={styles.sectionTitle}>📦 Delivery History</h3>
              {stats.allDeliveredOrders.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <p>No delivery history yet</p>
                </div>
              ) : (
                <div style={styles.ordersList}>
                  {stats.allDeliveredOrders.map((order, index) => (
                    <div key={order._id || index} style={styles.orderCard}>
                      <div style={styles.orderHeader}>
                        <span style={styles.orderId}>#{order.orderId || order._id}</span>
                        <span style={styles.orderDate}>{formatDate(order.deliveredAt || order.updatedAt)}</span>
                      </div>
                      <div style={styles.orderBody}>
                        <div style={styles.orderInfo}>
                          <span style={styles.orderLabel}>Customer:</span>
                          <span style={styles.orderValue}>{order.customerDetails?.name || 'Unknown'}</span>
                        </div>
                        <div style={styles.orderInfo}>
                          <span style={styles.orderLabel}>Amount:</span>
                          <span style={styles.orderValue}>₹{order.totalAmount || order.total || 0}</span>
                        </div>
                        <div style={styles.orderInfo}>
                          <span style={styles.orderLabel}>Time:</span>
                          <span style={styles.orderValue}>{formatTime(order.deliveredAt || order.updatedAt)}</span>
                        </div>
                      </div>
                      <div style={styles.orderBadge}>✓ Delivered</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div style={styles.earningsTab}>
              <h3 style={styles.sectionTitle}>💰 Earnings Breakdown</h3>
              
              <div style={styles.earningsCards}>
                <div style={styles.earningCard}>
                  <div style={styles.earningIcon}>💵</div>
                  <div style={styles.earningAmount}>₹{stats.todayEarnings}</div>
                  <div style={styles.earningLabel}>Today's Earnings</div>
                </div>
                <div style={styles.earningCard}>
                  <div style={styles.earningIcon}>💎</div>
                  <div style={styles.earningAmount}>₹{stats.totalEarnings}</div>
                  <div style={styles.earningLabel}>Total Earnings</div>
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.subsectionTitle}>📈 Earnings Details</h4>
                <div style={styles.earningsDetails}>
                  <div style={styles.detailRow}>
                    <span>Base Rate per Delivery:</span>
                    <span style={styles.detailValue}>₹50</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Today's Deliveries:</span>
                    <span style={styles.detailValue}>{stats.todayDeliveries}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Total Deliveries:</span>
                    <span style={styles.detailValue}>{stats.totalDeliveries}</span>
                  </div>
                  <div style={{...styles.detailRow, ...styles.totalRow}}>
                    <span>Average Earnings per Day:</span>
                    <span style={styles.detailValue}>
                      ₹{stats.totalDeliveries > 0 ? Math.round(stats.totalEarnings / Math.max(1, Math.ceil((Date.now() - new Date(stats.allDeliveredOrders[stats.allDeliveredOrders.length - 1]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb'
  },
  tab: {
    flex: 1,
    padding: '16px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '3px solid transparent'
  },
  activeTab: {
    color: '#667eea',
    borderBottomColor: '#667eea',
    background: 'white'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px'
  },
  overview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    padding: '24px',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '8px 0'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  section: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px'
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  },
  summaryBox: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  infoBox: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827'
  },
  historyTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  orderCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    position: 'relative'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  orderId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea'
  },
  orderDate: {
    fontSize: '12px',
    color: '#6b7280'
  },
  orderBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px'
  },
  orderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  orderLabel: {
    color: '#6b7280'
  },
  orderValue: {
    color: '#111827',
    fontWeight: '500'
  },
  orderBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: '#10b981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  earningsTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  earningsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  earningCard: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '32px',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  earningIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  earningAmount: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '12px 0'
  },
  earningLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  subsectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  earningsDetails: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  detailValue: {
    fontWeight: '600',
    color: '#111827'
  },
  totalRow: {
    borderBottom: 'none',
    borderTop: '2px solid #667eea',
    marginTop: '8px',
    paddingTop: '16px',
    fontSize: '15px',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: '#6b7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  }
};
