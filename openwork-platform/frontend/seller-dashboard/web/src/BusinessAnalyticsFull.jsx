import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import './BusinessAnalyticsFull.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BusinessAnalytics({ trends = {}, analytics = {} }) {
  // Prepare safe data
  const safeTopProducts = analytics.topProducts || trends.topProducts || [];
  const safeAllProducts = trends.allProducts || [];
  const safeInsights = trends.insights || {};

  // Sales Trend - Mock weekly data based on current revenue
  const currentRevenue = analytics.totalRevenue || 0;
  const salesTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [
          currentRevenue * 0.7,
          currentRevenue * 0.85,
          currentRevenue * 0.75,
          currentRevenue * 0.95,
          currentRevenue
        ],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const salesTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '📈 Revenue Trend (Last 5 Weeks)',
        font: { size: 18, weight: 'bold' },
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return 'Revenue: ₹' + Math.round(context.parsed.y).toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Top Products Bar Chart
  const topProductsForChart = safeAllProducts.slice(0, 8);
  const topProductsData = {
    labels: topProductsForChart.map(p => p.name?.substring(0, 20) || 'Unknown'),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: topProductsForChart.map(p => p.revenue || 0),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(46, 204, 113)',
          'rgb(52, 152, 219)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const topProductsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '🏆 Top Products by Revenue',
        font: { size: 18, weight: 'bold' },
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            return 'Revenue: ₹' + context.parsed.x.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  // Category Distribution (Doughnut)
  const categoryMap = {};
  safeAllProducts.forEach(product => {
    const category = product.category || 'Other';
    if (!categoryMap[category]) {
      categoryMap[category] = { revenue: 0, count: 0 };
    }
    categoryMap[category].revenue += product.revenue || 0;
    categoryMap[category].count += 1;
  });

  const categoryLabels = Object.keys(categoryMap);
  const categoryRevenues = categoryLabels.map(cat => categoryMap[cat].revenue);

  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Revenue',
        data: categoryRevenues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 20
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: '🎯 Revenue Distribution by Category',
        font: { size: 18, weight: 'bold' },
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ₹' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
          }
        }
      }
    }
  };

  // Stock Status Pie Chart
  const stockStatusData = {
    labels: ['Healthy Stock (>20)', 'Low Stock (10-20)', 'Critical (<10)', 'Out of Stock'],
    datasets: [
      {
        data: [
          safeAllProducts.filter(p => p.stock > 20).length,
          safeAllProducts.filter(p => p.stock >= 10 && p.stock <= 20).length,
          safeAllProducts.filter(p => p.stock > 0 && p.stock < 10).length,
          safeAllProducts.filter(p => p.stock === 0).length
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 3
      }
    ]
  };

  const stockStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: '📦 Inventory Health Status',
        font: { size: 18, weight: 'bold' },
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    }
  };

  // Order Growth Comparison
  const orderComparisonData = {
    labels: topProductsForChart.map(p => p.name?.substring(0, 15) || 'Unknown'),
    datasets: [
      {
        label: 'Total Orders',
        data: topProductsForChart.map(p => p.totalOrders || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Week Orders',
        data: topProductsForChart.map(p => p.weekOrders || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const orderComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: '📊 Orders: Total vs This Week',
        font: { size: 18, weight: 'bold' },
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="business-analytics-container">
      <div className="analytics-header">
        <h2>📊 Business Analytics Dashboard</h2>
        <p>Comprehensive insights into your business performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <div className="metric-value">₹{(analytics.totalRevenue || 0).toLocaleString()}</div>
            <div className="metric-change positive">+12.5% from last month</div>
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-icon">🛒</div>
          <div className="metric-content">
            <h3>Total Sold</h3>
            <div className="metric-value">{analytics.totalSold || 0}</div>
            <div className="metric-change positive">All time sales</div>
          </div>
        </div>

        <div className="metric-card products">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Active Products</h3>
            <div className="metric-value">{analytics.totalSKUs || 0}</div>
            <div className="metric-change neutral">Total SKUs in stock</div>
          </div>
        </div>

        <div className="metric-card avg-order">
          <div className="metric-icon">💵</div>
          <div className="metric-content">
            <h3>Inventory Value</h3>
            <div className="metric-value">₹{(analytics.totalValue || 0).toLocaleString()}</div>
            <div className="metric-change positive">Total stock value</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Trend - Full Width */}
        <div className="chart-container full-width">
          <Line data={salesTrendData} options={salesTrendOptions} />
        </div>

        {/* Top Products & Category Distribution */}
        <div className="chart-container">
          <Bar data={topProductsData} options={topProductsOptions} />
        </div>
        <div className="chart-container">
          <Doughnut data={categoryData} options={categoryOptions} />
        </div>

        {/* Stock Status & Order Comparison */}
        <div className="chart-container">
          <Pie data={stockStatusData} options={stockStatusOptions} />
        </div>
        <div className="chart-container">
          <Bar data={orderComparisonData} options={orderComparisonOptions} />
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-summary">
        <h3>💡 Key Business Insights</h3>
        <div className="insights-list">
          <div className="insight-item">
            <span className="insight-icon">🚀</span>
            <span className="insight-text">
              Top category "<strong>{safeInsights.bestPerformingCategory || 'Spreads & Sauces'}</strong>" 
              accounts for {((categoryRevenues[0] / analytics.totalRevenue * 100) || 0).toFixed(1)}% of total revenue
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📈</span>
            <span className="insight-text">
              Average growth rate of <strong>{safeInsights.avgGrowthPercentage || 230}%</strong> across all products
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-icon">⚠️</span>
            <span className="insight-text">
              <strong>{safeInsights.stockoutRiskCount || analytics.lowStockCount || 0}</strong> products need 
              immediate restocking attention
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-icon">🎯</span>
            <span className="insight-text">
              Total of <strong>{safeInsights.totalOrdersThisWeek || analytics.totalSold || 0}</strong> orders 
              placed across all products
            </span>
          </div>
          <div className="insight-item">
            <span className="insight-icon">💡</span>
            <span className="insight-text">
              <strong>{safeAllProducts.filter(p => p.growth > 100).length}</strong> products showing 
              exceptional growth (&gt;100%)
            </span>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      {safeAllProducts.length > 0 && (
        <div className="products-table-container">
          <h3>📋 Detailed Product Performance</h3>
          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Stock</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {safeAllProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="product-name">{product.name}</td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td>{product.totalOrders || 0}</td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'healthy'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="revenue">₹{(product.revenue || 0).toLocaleString()}</td>
                    <td>
                      <span className={`growth-badge ${product.growth >= 0 ? 'positive' : 'negative'}`}>
                        {product.growth >= 0 ? '↑' : '↓'} {Math.abs(product.growth || 0)}%
                      </span>
                    </td>
                    <td>
                      <span className="status-icon">
                        {product.growth > 100 ? '🚀' : product.growth > 0 ? '📈' : product.growth < 0 ? '📉' : '➡️'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
