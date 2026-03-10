import React, { useState, useEffect } from 'react';
import './Products.css';
import { categoryImages } from '../assets/images';

function Products({ addToCart, cartItems, updateQuantity, searchQuery = '' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Map category names to imported images (fallback only)
  const getCategoryImage = (category) => {
    const categoryMap = {
      'Fruits & Vegetables': categoryImages.fruits,
      'Dairy & Breakfast': categoryImages.dairy,
      'Dairy': categoryImages.dairy,
      'Bakery': categoryImages.breakfast,
      'Snacks & Beverages': categoryImages.breakfast,
      'Beverages': categoryImages.breakfast,
      'Snacks': categoryImages.breakfast,
      'Spreads & Sauces': categoryImages.breakfast,
      'Breakfast & Sauces': categoryImages.breakfast,
      'Atta, Rice, Oil & Dals': categoryImages.rice,
      'Pantry': categoryImages.rice,
      'Meat, Fish & Eggs': categoryImages.meat,
      'Masala & Dry Fruits': categoryImages.masala,
      'Household': categoryImages.breakfast
    };
    
    return categoryMap[category] || categoryImages.fruits;
  };

  // Get product image - use product.image if available, else category image
  const getProductImage = (product) => {
    if (product.image && product.image.trim() !== '') {
      return product.image;
    }
    return getCategoryImage(product.category);
  };

  // 🔥 Fetch products from backend with real stock data
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/products/available');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setError(null);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Get quantity of a product from cart
  const getProductQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // 🔥 Check if can add more to cart based on stock
  const canAddMore = (product) => {
    const currentQty = getProductQuantity(product.id);
    return currentQty < product.stock;
  };

  // 🔥 Handle quantity change with stock validation
  const handleQuantityChange = (product, change) => {
    const currentQty = getProductQuantity(product.id);
    const newQty = currentQty + change;

    // Check stock limit when increasing
    if (change > 0 && newQty > product.stock) {
      alert(`⚠️ Only ${product.stock} items available in stock!`);
      return;
    }
    
    if (newQty <= 0) {
      // Remove from cart
      updateQuantity(product.id, 0);
    } else {
      // Update quantity
      updateQuantity(product.id, newQty);
    }
  };

  // 🔥 Handle add to cart with stock validation
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      alert('⚠️ This product is currently out of stock!');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.description,
      stock: product.stock
    });
  };

  if (loading) {
    return (
      <div className="products-container" style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container" style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: '#e53935' }}>❌</div>
        <p>{error}</p>
        <button onClick={fetchProducts} style={{ 
          padding: '10px 20px',
          background: '#e53935',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '10px'
        }}>
          Retry
        </button>
      </div>
    );
  }
  
  // Group products by category - use filteredProducts
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // Show search results info if searching
  const showSearchInfo = searchQuery && (
    <div style={{
      backgroundColor: '#fff3cd',
      padding: '15px',
      margin: '0 15px 20px 15px',
      borderRadius: '8px',
      borderLeft: '4px solid #ffc107',
      color: '#856404'
    }}>
      {filteredProducts.length > 0 
        ? `Showing results for "${searchQuery}" (${filteredProducts.length} items)` 
        : `No results found for "${searchQuery}"`
      }
    </div>
  );

  return (
    <div className="products-container">
      {showSearchInfo}
      {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
        <div key={category} className="category-section">
          <div className="category-header">
            <h2>{category}</h2>
            <button className="see-all-btn">see all</button>
          </div>
          <div className="products-scroll">
            {categoryProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="product-card"
              >
                <div className="product-image">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="stock-badge low-stock">Only {product.stock} left!</div>
                  )}
                  {product.stock === 0 && (
                    <div className="stock-badge out-of-stock">Out of Stock</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-weight">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    {product.stock === 0 ? (
                      <button className="add-btn disabled" disabled>
                        Unavailable
                      </button>
                    ) : getProductQuantity(product.id) === 0 ? (
                      <button 
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(product, -1);
                          }}
                        >
                          −
                        </button>
                        <span className="qty-display">{getProductQuantity(product.id)}</span>
                        <button 
                          className={`qty-btn ${!canAddMore(product) ? 'disabled' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canAddMore(product)) {
                              handleQuantityChange(product, 1);
                            }
                          }}
                          disabled={!canAddMore(product)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <div className="modal-content">
              <div className="modal-image">
                <img 
                  src={getProductImage(selectedProduct)} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="modal-info">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-description">{selectedProduct.description}</p>
                <p className="modal-price">₹{selectedProduct.price}</p>
                <p className="modal-category"><strong>Category:</strong> {selectedProduct.category}</p>
                <p className="modal-stock" style={{
                  color: selectedProduct.stock === 0 ? '#e53935' : selectedProduct.stock <= 5 ? '#ff9800' : '#4caf50',
                  fontWeight: 'bold'
                }}>
                  <strong>Stock:</strong> {selectedProduct.stock === 0 ? 'Out of Stock' : `${selectedProduct.stock} available`}
                </p>
                {selectedProduct.stock > 0 ? (
                  <button 
                    className="add-to-cart"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      closeModal();
                    }}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button className="add-to-cart" disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;