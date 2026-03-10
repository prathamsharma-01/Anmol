import React, { useState } from 'react';
import './Products.css';

function Products({ addToCart, cartItems, updateQuantity }) {
  // Products data from CSV file
  const productData = [
    {
      id: 1,
      name: "Dr. Oetker FunFoods Peanut Butter Creamy, 375g",
      price: "₹139",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/61b1LaBCSML._SL1000.jpg?v=1759355264",
      description: "Creamy peanut butter, preservative free",
      category: "Dips & Spreads"
    },
    {
      id: 2,
      name: "Dr. Oetker FunFoods Peanut Butter Crunchy, 375g",
      price: "₹139",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/6108u7xkJpL._SL1000.jpg?v=1759355164",
      description: "Crunchy peanut butter, preservative free",
      category: "Dips & Spreads"
    },
    {
      id: 3,
      name: "Dr. Oetker Funfoods Pasta & Pizza White Sauce",
      price: "₹99",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/images.jpg?v=1759355032",
      description: "Creamy white sauce for pasta and pizza",
      category: "Condiments & Sauces"
    },
    {
      id: 4,
      name: "Dr. Oetker FunFoods Pasta And Pizza Sauce",
      price: "₹99",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/716RDJLpd0L._SL1500.jpg?v=1759354951",
      description: "Preservative free, 315 Grams",
      category: "Condiments & Sauces"
    },
    {
      id: 5,
      name: "Dr. Oetker FunFoods Tandoori Mayonnaise",
      price: "₹99",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/61zRzZiiNIL._SL1500.jpg?v=1759354868",
      description: "Tandoori flavored mayonnaise, 245 Grams",
      category: "Condiments & Sauces"
    },
    {
      id: 6,
      name: "Dr.Oetker Funfoods Cheese Chilli Sandwich Spread",
      price: "₹99",
      image: "https://cdn.shopify.com/s/files/1/0655/6293/5414/files/61EkKRzHLPL._SX679.jpg?v=1759354618",
      description: "Cheese and chili flavored spread, 250g",
      category: "Dips & Spreads"
    },
    {
      id: 7,
      name: "Fresh Organic Apples",
      price: "₹99",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      description: "Fresh and juicy organic apples from the hills",
      category: "Fruits & Vegetables"
    },
    {
      id: 8,
      name: "Whole Wheat Bread",
      price: "₹45",
      image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      description: "Freshly baked whole wheat bread",
      category: "Dairy, Bread & Eggs"
    }
  ];

  const [products] = useState(productData);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Get quantity of a product from cart
  const getProductQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle quantity change
  const handleQuantityChange = (product, change) => {
    const currentQty = getProductQuantity(product.id);
    const newQty = currentQty + change;
    
    if (newQty <= 0) {
      // Remove from cart
      updateQuantity(product.id, 0);
    } else {
      // Update quantity
      updateQuantity(product.id, newQty);
    }
  };
  
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="products-container">
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
                className="product-card"
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-weight">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    {getProductQuantity(product.id) === 0 ? (
                      <button 
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: parseInt(product.price.replace('₹', '')),
                            image: product.image,
                            weight: product.description
                          });
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
                          className="qty-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(product, 1);
                          }}
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
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="modal-info">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-description">{selectedProduct.description}</p>
                <p className="modal-price">{selectedProduct.price}</p>
                <p className="modal-category"><strong>Category:</strong> {selectedProduct.category}</p>
                <button 
                  className="add-to-cart"
                  onClick={() => {
                    addToCart({
                      id: selectedProduct.id,
                      name: selectedProduct.name,
                      price: parseInt(selectedProduct.price.replace('₹', '')),
                      image: selectedProduct.image
                    });
                    closeModal();
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;