// API Configuration
// Change this URL to update backend endpoint everywhere
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products/available`,
  CHECK_STOCK: `${API_BASE_URL}/api/products/check-stock`,
  
  // Orders
  ORDERS_SAVE: `${API_BASE_URL}/api/orders/save`,
  ORDERS_USER: (userId) => `${API_BASE_URL}/api/orders/user/${userId}`,
  
  // Payment
  PAYMENT_CREATE: `${API_BASE_URL}/api/payment/create-order`,
  
  // Support
  SUPPORT_CREATE: `${API_BASE_URL}/api/support/create`,
  SUPPORT_ALL: `${API_BASE_URL}/api/support/all`,
  SUPPORT_UPDATE: (ticketId) => `${API_BASE_URL}/api/support/${ticketId}/status`,
  
  // User Addresses
  USER_ADDRESSES: (userId) => `${API_BASE_URL}/api/user/addresses/${userId}`,
  USER_ADDRESS_UPDATE: (userId, addressId) => `${API_BASE_URL}/api/user/addresses/${userId}/${addressId}`,
  USER_ADDRESS_DELETE: (userId, addressId) => `${API_BASE_URL}/api/user/addresses/${userId}/${addressId}`,
  USER_ADDRESS_DEFAULT: (userId, addressId) => `${API_BASE_URL}/api/user/addresses/${userId}/${addressId}/set-default`,
};

export default API_BASE_URL;
