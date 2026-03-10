# 🚛 OpenWork Delivery System

## Quick Start Guide

### Prerequisites
- Node.js installed
- MongoDB installed and running
- All npm dependencies installed

### 🚀 One-Command Setup & Start

```bash
node start-delivery-system.js
```

This command will:
1. ✅ Setup sample delivery personnel and orders in MongoDB
2. 🖥️ Start the backend API server (port 8000)
3. 📱 Start the delivery app (port 5174)
4. 👥 Start the customer app (port 5173)

### 🔐 Test Login Credentials

| Name | Phone | Password | Vehicle |
|------|--------|----------|---------|
| Rajesh Kumar | 9876543210 | delivery123 | Bike |
| Priya Sharma | 8765432109 | priya456 | Scooter |
| Amit Singh | 7654321098 | amit789 | Car |

### 🌐 Application URLs

- **Delivery App**: http://localhost:5174
- **Customer App**: http://localhost:5173  
- **Backend API**: http://localhost:8000

### 📋 Testing Steps

1. **Open Delivery App** (http://localhost:5174)
2. **Login** with any credentials above
3. **View Orders** - You should see 3 pending orders
4. **Accept Order** - Click accept on any order
5. **View Details** - Click on the accepted order to see details
6. **Mark Delivered** - Complete the delivery process

### 🔧 Manual Setup (Alternative)

If you prefer to run components separately:

```bash
# 1. Setup database
node setup-delivery-data.js

# 2. Start backend (Terminal 1)
cd backend/api-gateway
node server.js

# 3. Start delivery app (Terminal 2)
cd frontend/delivery-app/web
npm run dev

# 4. Start customer app (Terminal 3)
cd frontend/customer-app
npm run dev
```

### 🔍 Features Implemented

#### 🔐 Authentication System
- ✅ Phone number validation (Indian format)
- ✅ Password validation
- ✅ Real backend integration
- ✅ Error handling & loading states
- ✅ Persistent login with localStorage
- ✅ Secure logout with API call

#### 📦 Order Management
- ✅ Real-time order fetching from database
- ✅ Auto-refresh every 30 seconds
- ✅ Accept order functionality
- ✅ Mark delivered functionality
- ✅ Order status tracking
- ✅ Error handling for API calls

#### 🎨 User Interface
- ✅ Professional login form design
- ✅ Real-time form validation
- ✅ Loading spinners
- ✅ Error message display
- ✅ Responsive design
- ✅ User information display

#### 🗄️ Database Schema
- ✅ delivery_personnel collection
- ✅ orders collection  
- ✅ Proper indexing
- ✅ Sample data for testing

### 🔗 API Endpoints

#### Authentication
- `POST /api/auth/delivery-login` - Login delivery personnel
- `POST /api/auth/delivery-logout` - Logout delivery personnel

#### Orders
- `GET /api/delivery/orders/pending` - Get pending orders
- `GET /api/delivery/orders/assigned/:id` - Get assigned orders
- `PUT /api/delivery/orders/:id/accept` - Accept an order
- `PUT /api/delivery/orders/:id/status` - Update order status

### 📊 MongoDB Collections

#### delivery_personnel
```javascript
{
  name: String,
  phone: String,
  password: String,
  vehicleType: String,
  licenseNumber: String,
  rating: Number,
  totalDeliveries: Number,
  isActive: Boolean,
  isOnline: Boolean,
  createdAt: Date
}
```

#### orders
```javascript
{
  id: Number,
  customer: String,
  customerPhone: String,
  address: String,
  lat: Number,
  lng: Number,
  items: Array,
  total: Number,
  status: String,
  assignedTo: String,
  orderTime: Date,
  estimatedDeliveryTime: Date,
  instructions: String
}
```

### 🛑 Stop All Services

Press `Ctrl+C` in the terminal running `start-delivery-system.js`

### 🐛 Troubleshooting

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in server.js

2. **Port Already in Use**
   - Kill processes on ports 8000, 5173, 5174
   - Use different ports in vite.config.js

3. **Login Issues**
   - Verify sample data exists: Check MongoDB with Compass
   - Re-run: `node setup-delivery-data.js`

4. **API Errors**
   - Check backend server logs
   - Verify CORS settings
   - Test endpoints with Postman

### 🎯 Next Steps

1. **Add Real Payment Integration**
2. **Implement Push Notifications**
3. **Add GPS Tracking**
4. **Create Admin Dashboard**
5. **Add Customer Rating System**
6. **Implement Real-time Chat**

---

**Built with ❤️ by the OpenWork Team**