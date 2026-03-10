import React, { useState, useEffect } from 'react';
import './AgentManagement.css';

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAgentPerformance();
    // Refresh every 60 seconds
    const interval = setInterval(fetchAgentPerformance, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentPerformance = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/agents/performance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching agent performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryLogs = async (agentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/agents/delivery-logs?agentId=${agentId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery logs');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDeliveryLogs(data.deliveryLogs || []);
        setShowDetailedLogs(true);
      }
    } catch (error) {
      console.error('Error fetching delivery logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (agent) => {
    setSelectedAgent(agent);
    fetchDeliveryLogs(agent.agentId);
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

  const exportToCSV = () => {
    if (!selectedAgent || deliveryLogs.length === 0) return;

    const headers = ['Order ID', 'Date', 'Customer', 'Address', 'Order Amount', 'Delivery Fee', 'Tip', 'Total Earning', 'Delivery Time (min)', 'Rating'];
    const rows = deliveryLogs.map(log => [
      log.orderId,
      formatDate(log.date) + ' ' + formatTime(log.date),
      log.customerName,
      log.deliveryAddress,
      log.orderAmount,
      log.deliveryFee,
      log.tip,
      log.totalEarning,
      log.deliveryTime,
      log.rating
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedAgent.name}_deliveries_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    link.click();
  };

  if (loading && agents.length === 0) {
    return (
      <div className="agent-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-management">
      {/* Header */}
      <div className="am-header">
        <div>
          <h1 className="am-title">🚛 Delivery Agent Management</h1>
          <p className="am-subtitle">Track performance, deliveries, and earnings</p>
        </div>
        <button className="refresh-btn" onClick={fetchAgentPerformance}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="summary-icon">👥</div>
            <div className="summary-value">{summary.totalAgents}</div>
            <div className="summary-label">Total Agents</div>
          </div>
          <div className="summary-card" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <div className="summary-icon">✅</div>
            <div className="summary-value">{summary.activeToday}</div>
            <div className="summary-label">Active Today</div>
          </div>
          <div className="summary-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <div className="summary-icon">📦</div>
            <div className="summary-value">{summary.totalDeliveriesToday}</div>
            <div className="summary-label">Deliveries Today</div>
          </div>
          <div className="summary-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <div className="summary-icon">💰</div>
            <div className="summary-value">₹{summary.totalEarningsToday}</div>
            <div className="summary-label">Earnings Today</div>
          </div>
        </div>
      )}

      {/* Agents Table */}
      <div className="agents-section">
        <h2 className="section-title">Agent Performance</h2>
        
        {agents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No delivery agents registered yet</p>
          </div>
        ) : (
          <div className="agents-table-container">
            <table className="agents-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Contact</th>
                  <th>Vehicle</th>
                  <th>Today's Deliveries</th>
                  <th>Total Deliveries</th>
                  <th>Today's Earnings</th>
                  <th>Total Earnings</th>
                  <th>Avg. Time</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent.agentId} className={agent.stats.todayDeliveries > 0 ? 'active-row' : ''}>
                    <td>
                      <div className="agent-name">
                        <strong>{agent.name}</strong>
                        <span className="agent-id">ID: {agent.agentId.slice(-6)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>📧 {agent.email}</div>
                        <div>📱 {agent.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className="vehicle-badge">{agent.vehicleType}</span>
                    </td>
                    <td>
                      <span className="stat-value highlight">{agent.stats.todayDeliveries}</span>
                    </td>
                    <td>
                      <span className="stat-value">{agent.stats.totalDeliveries}</span>
                    </td>
                    <td>
                      <span className="earning-value">₹{agent.stats.todayEarnings}</span>
                    </td>
                    <td>
                      <span className="earning-value">₹{agent.stats.totalEarnings}</span>
                    </td>
                    <td>
                      <span className="time-value">{agent.stats.averageDeliveryTime}m</span>
                    </td>
                    <td>
                      <span className="rating-badge">
                        ⭐ {agent.stats.averageRating || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${agent.status}`}>
                        {agent.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(agent)}
                      >
                        📊 View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Logs Modal */}
      {showDetailedLogs && selectedAgent && (
        <div className="modal-overlay" onClick={() => setShowDetailedLogs(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>📋 Delivery Logs - {selectedAgent.name}</h2>
                <p>Detailed delivery history and earnings breakdown</p>
              </div>
              <button className="close-btn" onClick={() => setShowDetailedLogs(false)}>✕</button>
            </div>

            {/* Date Range Filter */}
            <div className="date-filter">
              <div className="date-input-group">
                <label>Start Date:</label>
                <input 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div className="date-input-group">
                <label>End Date:</label>
                <input 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
              <button 
                className="apply-filter-btn"
                onClick={() => fetchDeliveryLogs(selectedAgent.agentId)}
              >
                Apply Filter
              </button>
              <button 
                className="export-btn"
                onClick={exportToCSV}
              >
                📥 Export CSV
              </button>
            </div>

            {/* Summary Box */}
            {deliveryLogs.length > 0 && (
              <div className="logs-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Deliveries:</span>
                  <span className="summary-value">{deliveryLogs.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Earnings:</span>
                  <span className="summary-value earning">
                    ₹{deliveryLogs.reduce((sum, log) => sum + log.totalEarning, 0)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Avg. per Delivery:</span>
                  <span className="summary-value">
                    ₹{Math.round(deliveryLogs.reduce((sum, log) => sum + log.totalEarning, 0) / deliveryLogs.length)}
                  </span>
                </div>
              </div>
            )}

            {/* Logs Table */}
            <div className="logs-table-container">
              {deliveryLogs.length === 0 ? (
                <div className="empty-logs">
                  <p>No deliveries in selected date range</p>
                </div>
              ) : (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Order Amount</th>
                      <th>Delivery Fee</th>
                      <th>Tip</th>
                      <th>Total Earning</th>
                      <th>Time (min)</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryLogs.map((log, index) => (
                      <tr key={index}>
                        <td><span className="order-id-badge">{log.orderId}</span></td>
                        <td>
                          <div className="datetime">
                            <div>{formatDate(log.date)}</div>
                            <div className="time">{formatTime(log.date)}</div>
                          </div>
                        </td>
                        <td>{log.customerName}</td>
                        <td className="address-cell">{log.deliveryAddress}</td>
                        <td>₹{log.orderAmount}</td>
                        <td>₹{log.deliveryFee}</td>
                        <td>{log.tip > 0 ? `₹${log.tip}` : '-'}</td>
                        <td><strong>₹{log.totalEarning}</strong></td>
                        <td>{log.deliveryTime}m</td>
                        <td>
                          {log.rating > 0 ? (
                            <span className="rating">⭐ {log.rating}</span>
                          ) : (
                            <span className="no-rating">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
