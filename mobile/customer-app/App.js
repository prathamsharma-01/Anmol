import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Modal,
  Image,
  RefreshControl,
  SafeAreaView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

// Use your computer's local IP address so mobile device can connect
// Change this IP if your computer's IP changes
const API_URL = 'http://192.168.1.13:8000';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', phone: '' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'cart', 'orders', 'profile'
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' }); // Toast notification

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 2000);
  };

  useEffect(() => {
    checkBackend();
    fetchProducts();
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      // Simulating AsyncStorage - in production use: await AsyncStorage.getItem('quikry_user');
      const savedUser = null;
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
  };

  const checkBackend = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      setBackendStatus(response.data);
      console.log('✅ Backend connected:', response.data);
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      setBackendStatus({ status: 'ERROR', message: 'Backend not reachable' });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/available`);
      console.log('Products response:', response.data);
      setProducts(response.data.products || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    await checkBackend();
    setRefreshing(false);
  };

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });

    showToast(`${product.name} added to cart!`, 'success');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    } else {
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, loginData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsLoginOpen(false);
        setLoginData({ email: '', password: '' });
        showToast('Logged in successfully!', 'success');
      }
    } catch (error) {
      showToast('Login failed. Please check your credentials.', 'error');
    }
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, signupData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsLoginOpen(false);
        setIsSignupMode(false);
        setSignupData({ name: '', email: '', password: '', phone: '' });
        showToast('Account created successfully!', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Signup failed. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out successfully!', 'success');
  };

  const placeOrder = async () => {
    if (!user) {
      showToast('Please login to place an order', 'error');
      setIsLoginOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      showToast('Please add items to cart first', 'error');
      return;
    }

    try {
      const orderData = {
        userId: user._id,
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: user.address || 'Default Address'
      };

      const response = await axios.post(`${API_URL}/api/orders/save`, orderData);
      if (response.data.success) {
        showToast('Order placed successfully!', 'success');
        setCartItems([]);
        setCurrentView('orders');
        fetchOrders();
      }
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Search in loaded products (client-side)
    const results = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const categories = ['All', 'Fruits & Vegetables', 'Dairy & Breakfast', 'Snacks & Beverages', 'Household'];

  const filteredProducts = isSearching 
    ? searchResults 
    : (selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory));

  const renderHome = () => (
    <ScrollView 
      style={styles.content} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e53935']} />
      }
    >
      {!isSearching && (
        <>
          {/* Top Categories with Images - Hide when searching */}
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryCardsContainer}>
            {[
              { name: 'Fruits & Vegetables', emoji: '🥗', image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c' },
              { name: 'Dairy & Breakfast', emoji: '🥛', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da' },
              { name: 'Snacks & Beverages', emoji: '🍿', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087' },
              { name: 'Household', emoji: '🏠', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf' },
            ].map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <Image 
              source={{ uri: cat.image }}
              style={styles.categoryCardImage}
              resizeMode="cover"
            />
            <View style={styles.categoryCardOverlay}>
              <Text style={styles.categoryCardText}>{cat.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hero Banner - Hide when searching */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroBannerTitle}>Get Everything You Need</Text>
        <Text style={styles.heroBannerSubtitle}>Fast delivery within 10 minutes</Text>
        <TouchableOpacity style={styles.orderNowButton}>
          <Text style={styles.orderNowButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Tabs - Hide when searching */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
        </>
      )}

      {/* Products Section - Always show but change title */}
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>
          {isSearching ? 'Search Results' : selectedCategory}
        </Text>
        {!isSearching && (
          <TouchableOpacity>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#e53935" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {filteredProducts.map((product, index) => (
            <View key={`product-${product._id || index}`} style={styles.productCard}>
              <Image 
                source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productContent}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                {product.unit && (
                  <Text style={styles.productUnit}>per {product.unit}</Text>
                )}
                
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {!isSearching && (
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>Why Choose QuikRy?</Text>
          {[
            { icon: '⚡', title: 'Fast Delivery', desc: 'Get orders in 10 minutes' },
            { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing always' },
            { icon: '🔒', title: 'Secure Payments', desc: '100% safe transactions' },
            { icon: '🌟', title: 'Premium Quality', desc: 'Quality assured products' }
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderCart = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Shopping Cart</Text>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.shopNowButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cartItems.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>₹{item.price} × {item.quantity}</Text>
                <Text style={styles.cartItemTotal}>Total: ₹{item.price * item.quantity}</Text>
              </View>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder}>
            <Text style={styles.checkoutButtonText}>
              {user ? 'Place Order' : 'Login to Place Order'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderOrders = () => {
    useEffect(() => {
      if (user && currentView === 'orders') {
        fetchOrders();
      }
    }, [user, currentView]);

    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        
        {!user ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartIcon}>📦</Text>
            <Text style={styles.emptyText}>Please login to view orders</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => setIsLoginOpen(true)}
            >
              <Text style={styles.shopNowButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => setCurrentView('home')}
            >
              <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderItems}>
                {order.items?.length || 0} item(s)
              </Text>
              <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status?.toLowerCase()] || '#9e9e9e';
  };

  const renderProfile = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      {!user ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartIcon}>👤</Text>
          <Text style={styles.emptyText}>Please login to view profile</Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => setIsLoginOpen(true)}
          >
            <Text style={styles.shopNowButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.name?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          {user.phone && (
            <Text style={styles.profilePhone}>📱 {user.phone}</Text>
          )}

          <View style={styles.profileStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{cartItems.length}</Text>
              <Text style={styles.statLabel}>In Cart</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>QuikRy</Text>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => setIsLocationModalOpen(true)}
          >
            <Text style={styles.deliveryText}>Delivery in 13 minutes</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Chitkara University</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => user ? setCurrentView('profile') : setIsLoginOpen(true)}
        >
          <Text style={styles.loginButtonText}>
            {user ? `${user.name?.split(' ')[0]}` : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for services and products"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setCurrentView('home')}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.searchIcon}>🔍</Text>
        )}
      </View>

      {/* Search Results Info */}
      {isSearching && (
        <View style={styles.searchInfoBar}>
          <Text style={styles.searchInfoText}>
            {searchResults.length > 0 
              ? `Showing results for "${searchQuery}" (${searchResults.length} items)` 
              : `No results found for "${searchQuery}"`
            }
          </Text>
        </View>
      )}

      {/* Main Content */}
      {currentView === 'home' && renderHome()}
      {currentView === 'cart' && renderCart()}
      {currentView === 'orders' && renderOrders()}
      {currentView === 'profile' && renderProfile()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentView('home')}
        >
          <Text style={[styles.navIcon, currentView === 'home' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navText, currentView === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentView('cart')}
        >
          <View style={styles.navIconContainer}>
            <Text style={[styles.navIcon, currentView === 'cart' && styles.navIconActive]}>🛒</Text>
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navText, currentView === 'cart' && styles.navTextActive]}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            if (user) {
              setCurrentView('orders');
            } else {
              setIsLoginOpen(true);
            }
          }}
        >
          <Text style={[styles.navIcon, currentView === 'orders' && styles.navIconActive]}>📦</Text>
          <Text style={[styles.navText, currentView === 'orders' && styles.navTextActive]}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => user ? setCurrentView('profile') : setIsLoginOpen(true)}
        >
          <Text style={[styles.navIcon, currentView === 'profile' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navText, currentView === 'profile' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Login/Signup Modal */}
      <Modal
        visible={isLoginOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsLoginOpen(false);
          setIsSignupMode(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isSignupMode ? 'Create Account' : 'Login to QuikRy'}
            </Text>
            
            {isSignupMode ? (
              // Signup Form
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  value={signupData.name}
                  onChangeText={(text) => setSignupData({...signupData, name: text})}
                  autoCapitalize="words"
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  value={signupData.email}
                  onChangeText={(text) => setSignupData({...signupData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Phone (Optional)"
                  value={signupData.phone}
                  onChangeText={(text) => setSignupData({...signupData, phone: text})}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  value={signupData.password}
                  onChangeText={(text) => setSignupData({...signupData, password: text})}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
                
                <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
                  <Text style={styles.loginButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.switchButton}
                  onPress={() => setIsSignupMode(false)}
                >
                  <Text style={styles.switchButtonText}>
                    Already have an account? <Text style={styles.switchButtonTextBold}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Login Form
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={loginData.email}
                  onChangeText={(text) => setLoginData({...loginData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={loginData.password}
                  onChangeText={(text) => setLoginData({...loginData, password: text})}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
                
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.switchButton}
                  onPress={() => setIsSignupMode(true)}
                >
                  <Text style={styles.switchButtonText}>
                    Don't have an account? <Text style={styles.switchButtonTextBold}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsLoginOpen(false);
                setIsSignupMode(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Selector Modal */}
      <Modal
        visible={isLocationModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLocationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalIcon}>📍</Text>
              <Text style={styles.locationModalTitle}>Select Delivery Location</Text>
              <TouchableOpacity onPress={() => setIsLocationModalOpen(false)}>
                <Text style={styles.closeModalButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pincodeLabel}>ENTER YOUR PINCODE</Text>
            
            <View style={styles.pincodeInputContainer}>
              <Text style={styles.pincodeIcon}>📍</Text>
              <TextInput
                style={styles.pincodeInput}
                placeholder="Enter 6-digit pincode (e.g., 140417)"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.whyPincodeBox}>
              <Text style={styles.whyPincodeTitle}>📌 Why Pincode?</Text>
              <Text style={styles.whyPincodeItem}>• Quick and accurate city detection</Text>
              <Text style={styles.whyPincodeItem}>• No GPS/location permissions needed</Text>
              <Text style={styles.whyPincodeItem}>• Works on any device</Text>
              <Text style={styles.whyPincodeItem}>• You'll add exact house address next</Text>
            </View>

            <TouchableOpacity 
              style={styles.confirmLocationButton}
              onPress={() => {
                if (pincode.length === 6) {
                  setIsLocationModalOpen(false);
                  showToast(`Delivery location set to pincode: ${pincode}`, 'success');
                } else {
                  showToast('Please enter a valid 6-digit pincode', 'error');
                }
              }}
            >
              <Text style={styles.confirmLocationButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toast.visible && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={styles.toastIcon}>{toast.type === 'success' ? '✓' : '⚠'}</Text>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e53935',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  locationButton: {
    marginTop: 2,
  },
  deliveryText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    margin: 15,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    fontSize: 18,
  },
  clearIcon: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
    padding: 5,
  },
  searchInfoBar: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  searchInfoText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '500',
  },
  categoryCardsContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  categoryCard: {
    width: 140,
    height: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardImage: {
    width: '100%',
    height: '100%',
  },
  categoryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  categoryCardText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroBanner: {
    backgroundColor: '#e53935',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  orderNowButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  orderNowButtonText: {
    color: '#e53935',
    fontSize: 15,
    fontWeight: '600',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  seeAllText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
  },
  locationModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  locationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationModalIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  locationModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#e53935',
  },
  closeModalButton: {
    fontSize: 24,
    color: '#666',
  },
  pincodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e53935',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  pincodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e53935',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  pincodeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pincodeInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  whyPincodeBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  whyPincodeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 10,
  },
  whyPincodeItem: {
    fontSize: 13,
    color: '#1b5e20',
    marginBottom: 5,
    lineHeight: 18,
  },
  confirmLocationButton: {
    backgroundColor: '#e53935',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  statusMessage: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#e53935',
    elevation: 3,
  },
  categoryText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  loader: {
    marginTop: 30,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 15,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    width: '47%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  productContent: {
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 17,
    color: '#e53935',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  productUnit: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: '#e53935',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  featuresSection: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
  },
  cartItem: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e53935',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#e53935',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderItems: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  profileAvatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  logoutButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    elevation: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIconContainer: {
    position: 'relative',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  navText: {
    fontSize: 11,
    color: '#666',
  },
  navTextActive: {
    color: '#e53935',
    fontWeight: '600',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#e53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    backgroundColor: '#e53935',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#666',
    fontSize: 14,
  },
  switchButtonTextBold: {
    color: '#e53935',
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  toastSuccess: {
    backgroundColor: '#4caf50',
  },
  toastError: {
    backgroundColor: '#f44336',
  },
  toastIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
