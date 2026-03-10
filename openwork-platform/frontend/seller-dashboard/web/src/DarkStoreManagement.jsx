import React, { useState, useEffect } from 'react';
import './DarkStoreManagement.css';
import BusinessAnalytics from './BusinessAnalytics';

export default function DarkStoreManagement() {
  const [inventory, setInventory] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [sortBy, setSortBy] = useState('sales');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    reorderLevel: 10,
    maxStock: 100
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [lowStockAlert, setLowStockAlert] = useState(0);

  useEffect(() => {
    fetchInventory();
    fetchAnalytics();
    fetchTrends();
    const interval = setInterval(() => {
      fetchInventory();
      fetchAnalytics();
      fetchTrends();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate low stock alerts
    const lowStock = inventory.filter(item => 
      item.stock > 0 && item.stock <= (item.reorderLevel || 10)
    ).length;
    setLowStockAlert(lowStock);
  }, [inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory/trends');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      
      const data = await response.json();
      if (data.success) {
        setTrends(data);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setUpdateData({
      stock: product.stock,
      reorderLevel: product.reorderLevel || 10,
      maxStock: product.maxStock || product.stock * 2
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStock = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/inventory/${selectedProduct.sku}/update`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      const data = await response.json();
      if (data.success) {
        setShowUpdateModal(false);
        fetchInventory();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory: ' + error.message);
    }
  };

  const handleDeleteProduct = async (sku) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/inventory/${sku}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchInventory();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= reorderLevel) return 'low-stock';
    if (stock > (reorderLevel * 5)) return 'high-stock';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock':
        return '#ef4444';
      case 'low-stock':
        return '#f97316';
      case 'high-stock':
        return '#10b981';
      case 'normal':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const filteredInventory = inventory
    .filter(item => {
      if (filter === 'low') return item.stock <= (item.reorderLevel || 10);
      if (filter === 'out') return item.stock === 0;
      if (filter === 'high') return item.stock > ((item.reorderLevel || 10) * 5);
      return true;
    })
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'sales') return b.totalSold - a.totalSold;
      if (sortBy === 'stock') return b.stock - a.stock;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const topSellingProducts = inventory
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const exportToCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Stock', 'Reorder Level', 'Max Stock', 'Total Sold', 'Revenue', 'Status'];
    const rows = inventory.map(item => [
      item.sku,
      item.name,
      item.category,
      item.stock,
      item.reorderLevel || 0,
      item.maxStock || 0,
      item.totalSold || 0,
      (item.totalSold * item.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      getStockStatus(item.stock, item.reorderLevel)
    ]);

    let csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (!response.ok) throw new Error('Failed to add product');

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewProduct({
          sku: '',
          name: '',
          category: '',
          price: 0,
          stock: 0,
          reorderLevel: 10,
          maxStock: 100
        });
        fetchInventory();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    }
  };

  const handleQuickStockUpdate = async (sku, adjustment) => {
    try {
      const product = inventory.find(p => p.sku === sku);
      const newStock = Math.max(0, product.stock + adjustment);
      
      const response = await fetch(
        `http://localhost:8000/api/inventory/${sku}/update`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock })
        }
      );

      if (response.ok) {
        fetchInventory();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedItems.length} selected products?`)) return;

    try {
      await Promise.all(
        selectedItems.map(sku =>
          fetch(`http://localhost:8000/api/inventory/${sku}`, { method: 'DELETE' })
        )
      );
      setSelectedItems([]);
      fetchInventory();
      fetchAnalytics();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete products');
    }
  };

  const toggleSelectItem = (sku) => {
    setSelectedItems(prev =>
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(item => item.sku));
    }
  };

  const printInventory = () => {
    window.print();
  };

  return (
    <div className="dark-store-container">
      {/* Header */}
      <div className="store-header">
        <h1>🏪 Dark Store Management</h1>
        <p>Real-time inventory tracking and business analytics</p>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          📈 Business Trends
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Action Bar */}
          <div className="action-bar">
            <div className="action-left">
              <button className="primary-btn" onClick={() => setShowAddModal(true)}>
                ➕ Add New Product
              </button>
              <button 
                className={`danger-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}
                onClick={handleBulkDelete}
                disabled={selectedItems.length === 0}
              >
                🗑️ Delete Selected {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
              </button>
              {selectedItems.length > 0 && (
                <button className="secondary-btn" onClick={() => setSelectedItems([])}>
                  ✕ Clear Selection
                </button>
              )}
            </div>
            <div className="action-right">
              {lowStockAlert > 0 && (
                <div className="alert-badge">
                  ⚠️ {lowStockAlert} Low Stock Alert{lowStockAlert > 1 ? 's' : ''}
                </div>
              )}
              <button className="secondary-btn" onClick={printInventory}>
                🖨️ Print
              </button>
              <button className="secondary-btn" onClick={exportToCSV}>
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total SKUs</div>
            <div className="card-value">{inventory.length}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Total Stock Value</div>
            <div className="card-value">
              {(inventory.reduce((sum, item) => sum + (item.stock * item.price), 0) || 0)
                .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <div className="card-label">Low Stock Items</div>
            <div className="card-value" style={{ color: '#f97316' }}>
              {inventory.filter(item => item.stock <= (item.reorderLevel || 10) && item.stock > 0).length}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">❌</div>
          <div className="card-content">
            <div className="card-label">Out of Stock</div>
            <div className="card-value" style={{ color: '#ef4444' }}>
              {inventory.filter(item => item.stock === 0).length}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Revenue</div>
            <div className="card-value">
              {(inventory.reduce((sum, item) => sum + (item.totalSold * item.price), 0) || 0)
                .toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">🛒</div>
          <div className="card-content">
            <div className="card-label">Total Items Sold</div>
            <div className="card-value">
              {inventory.reduce((sum, item) => sum + (item.totalSold || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <div className="analytics-section">
          <h3>🔥 Top Selling Products</h3>
          <div className="top-products-grid">
            {topSellingProducts.map((product, index) => (
              <div key={product.sku} className="top-product-card">
                <div className="rank-badge">#{index + 1}</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-sku">SKU: {product.sku}</p>
                  <div className="product-stats">
                    <div className="stat">
                      <span className="stat-label">Sold:</span>
                      <span className="stat-value">{product.totalSold}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Revenue:</span>
                      <span className="stat-value">₹{(product.totalSold * product.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table Section */}
      <div className="inventory-section">
        <div className="section-header">
          <h3>📋 Inventory Details</h3>
          <div className="header-actions">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                onChange={selectAll}
              />
              <span>Select All</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="high">Overstock</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="sales">Most Sold</option>
              <option value="stock">Stock Amount</option>
              <option value="name">Product Name</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <p>No products found</p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                      onChange={selectAll}
                    />
                  </th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Quick Adjust</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Total Sold</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const status = getStockStatus(item.stock, item.reorderLevel || 10);
                  const isSelected = selectedItems.includes(item.sku);
                  return (
                    <tr key={item.sku} className={isSelected ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.sku)}
                        />
                      </td>
                      <td className="sku-cell">{item.sku}</td>
                      <td className="name-cell">{item.name}</td>
                      <td className="category-cell">{item.category}</td>
                      <td className="price-cell">₹{item.price.toLocaleString()}</td>
                      <td className="stock-cell">
                        <span className="stock-badge" style={{ backgroundColor: getStatusColor(status) }}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="quick-adjust-cell">
                        <div className="quick-adjust-btns">
                          <button
                            className="quick-btn minus"
                            onClick={() => handleQuickStockUpdate(item.sku, -1)}
                            title="Decrease by 1"
                          >
                            −1
                          </button>
                          <button
                            className="quick-btn plus"
                            onClick={() => handleQuickStockUpdate(item.sku, 1)}
                            title="Increase by 1"
                          >
                            +1
                          </button>
                          <button
                            className="quick-btn plus"
                            onClick={() => handleQuickStockUpdate(item.sku, 10)}
                            title="Increase by 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="reorder-cell">{item.reorderLevel || '-'}</td>
                      <td className="status-cell">
                        <span className={`status-badge ${status}`}>
                          {status === 'out-of-stock' && '❌ Out'}
                          {status === 'low-stock' && '⚠️ Low'}
                          {status === 'high-stock' && '📈 High'}
                          {status === 'normal' && '✅ Normal'}
                        </span>
                      </td>
                      <td className="sold-cell">{item.totalSold || 0}</td>
                      <td className="revenue-cell">
                        ₹{((item.totalSold || 0) * item.price).toLocaleString()}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn update-btn"
                          onClick={() => handleUpdateClick(item)}
                          title="Update Stock"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProduct(item.sku)}
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <BusinessAnalytics trends={trends} analytics={analytics} />
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Update Inventory - {selectedProduct.name}</h3>
              <button className="close-btn" onClick={() => setShowUpdateModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Current Stock</label>
                <input
                  type="number"
                  min="0"
                  value={updateData.stock}
                  onChange={(e) => setUpdateData({ ...updateData, stock: parseInt(e.target.value) || 0 })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Reorder Level (Minimum Stock)</label>
                <input
                  type="number"
                  min="0"
                  value={updateData.reorderLevel}
                  onChange={(e) => setUpdateData({ ...updateData, reorderLevel: parseInt(e.target.value) || 0 })}
                  className="form-input"
                />
                <small>Alert will trigger when stock falls below this level</small>
              </div>

              <div className="form-group">
                <label>Max Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={updateData.maxStock}
                  onChange={(e) => setUpdateData({ ...updateData, maxStock: parseInt(e.target.value) || 0 })}
                  className="form-input"
                />
              </div>

              <div className="stock-preview">
                <p>
                  {updateData.stock <= updateData.reorderLevel 
                    ? '⚠️ Stock is below reorder level' 
                    : '✅ Stock level is healthy'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleUpdateStock}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Product</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    placeholder="e.g., SKU009"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    placeholder="e.g., Spreads & Sauces"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Oetker Mayo Dip"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={newProduct.reorderLevel}
                    onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: parseInt(e.target.value) || 10 })}
                    className="form-input"
                  />
                  <small>Minimum stock before alert</small>
                </div>
                <div className="form-group">
                  <label>Max Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={newProduct.maxStock}
                    onChange={(e) => setNewProduct({ ...newProduct, maxStock: parseInt(e.target.value) || 100 })}
                    className="form-input"
                  />
                  <small>Maximum capacity</small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                className="save-btn" 
                onClick={handleAddProduct}
                disabled={!newProduct.sku || !newProduct.name || !newProduct.category || !newProduct.price}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
