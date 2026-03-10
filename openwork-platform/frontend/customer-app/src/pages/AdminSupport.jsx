import React, { useState, useEffect } from 'react';
import './AdminSupport.css';

const AdminSupport = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchSupportRequests();
  }, [filters]);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: filters.status,
        priority: filters.priority,
        page: filters.page,
        limit: 10
      });

      const response = await fetch(`http://localhost:8000/api/support/all?${query}`);
      const data = await response.json();

      if (data.success) {
        setSupportRequests(data.support_requests);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, assignedTo = null, notes = null) => {
    try {
      const response = await fetch(`http://localhost:8000/api/support/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          assigned_to: assignedTo,
          resolution_notes: notes
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchSupportRequests(); // Refresh the list
        setSelectedTicket(null);
        alert('Ticket updated successfully!');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#2196f3';
      case 'in-progress': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="admin-support">
      <div className="admin-header">
        <h1>Support Requests Management</h1>
        <div className="stats">
          <div className="stat-card">
            <h3>{supportRequests.filter(t => t.status === 'open').length}</h3>
            <p>Open Tickets</p>
          </div>
          <div className="stat-card">
            <h3>{supportRequests.filter(t => t.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-card">
            <h3>{supportRequests.filter(t => t.priority === 'high').length}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => setFilters({...filters, priority: e.target.value, page: 1})}
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button onClick={fetchSupportRequests} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading support requests...</div>
      ) : (
        <>
          <div className="tickets-list">
            {supportRequests.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-info">
                    <h3>{ticket.ticket_number}</h3>
                    <p>{ticket.issue_type}</p>
                  </div>
                  <div className="ticket-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="ticket-content">
                  <div className="customer-info">
                    <p><strong>Customer:</strong> {ticket.user_name}</p>
                    <p><strong>Email:</strong> {ticket.user_email}</p>
                    <p><strong>Phone:</strong> {ticket.user_phone}</p>
                    <p><strong>Contact Method:</strong> {ticket.contact_method}</p>
                  </div>

                  {ticket.order_reference && (
                    <div className="order-info">
                      <p><strong>Order:</strong> {ticket.order_reference.order_number}</p>
                      <p><strong>Amount:</strong> ₹{ticket.order_reference.order_amount}</p>
                    </div>
                  )}

                  <div className="message">
                    <p><strong>Message:</strong></p>
                    <p>{ticket.message}</p>
                  </div>

                  <div className="ticket-meta">
                    <p><strong>Created:</strong> {formatDate(ticket.created_at)}</p>
                    {ticket.assigned_to && (
                      <p><strong>Assigned to:</strong> {ticket.assigned_to}</p>
                    )}
                  </div>
                </div>

                <div className="ticket-actions">
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="action-btn primary"
                  >
                    Manage
                  </button>
                  
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => updateTicketStatus(ticket._id, 'in-progress')}
                      className="action-btn secondary"
                    >
                      Start Working
                    </button>
                  )}
                  
                  {ticket.status === 'in-progress' && (
                    <button 
                      onClick={() => updateTicketStatus(ticket._id, 'resolved')}
                      className="action-btn success"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button 
                disabled={!pagination.has_prev}
                onClick={() => setFilters({...filters, page: filters.page - 1})}
              >
                Previous
              </button>
              <span>Page {pagination.current_page} of {pagination.total_pages}</span>
              <button 
                disabled={!pagination.has_next}
                onClick={() => setFilters({...filters, page: filters.page + 1})}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick Update Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Ticket: {selectedTicket.ticket_number}</h2>
              <button onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="quick-actions">
                <button 
                  onClick={() => updateTicketStatus(selectedTicket._id, 'in-progress')}
                  className="quick-btn"
                >
                  In Progress
                </button>
                <button 
                  onClick={() => updateTicketStatus(selectedTicket._id, 'resolved')}
                  className="quick-btn"
                >
                  Resolved
                </button>
                <button 
                  onClick={() => updateTicketStatus(selectedTicket._id, 'closed')}
                  className="quick-btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;