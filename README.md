# Quikry

Quick commerce platform for fast delivery services.

## 🔐 Security Setup (IMPORTANT - Read First!)

**Before running the application**, you must set up environment variables with your credentials. See [SECURITY.md](SECURITY.md) for complete guidelines.

### Quick Setup

1. **Backend Configuration**
   ```bash
   cd openwork-platform/backend/api-gateway
   cp .env.example .env
   # Edit .env and add your actual credentials:
   # - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from https://dashboard.razorpay.com
   # - MONGODB_URI for your MongoDB instance
   ```

2. **Frontend Configuration (Optional)**
   ```bash
   cd openwork-platform/frontend/customer-app
   cp .env.example .env
   # Edit if needed
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend/api-gateway
   npm install

   # Frontend
   cd frontend/customer-app
   npm install
   ```

4. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend/api-gateway
   node server.js

   # Terminal 2 - Frontend
   cd frontend/customer-app
   npm run dev
   ```

## 📋 Features

- **Customer App**: Browse products, add to cart, real-time stock validation, checkout with Razorpay
- **Seller Dashboard**: Inventory management, business analytics with Chart.js, stock tracking
- **Delivery App**: Order management, delivery tracking
- **Customer Service**: Order support and management

## ⚠️ Never Commit Secrets

- ❌ Do not commit `.env` files
- ❌ Do not commit API keys or passwords in code
- ✅ Always use environment variables via `.env` files
- ✅ Keep `.env.example` updated with required variable names (no values)

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Chart.js
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Payment**: Razorpay
- **Maps**: Google Maps API

## 🚀 Deployment

Before deploying to production:
1. Use **production/live** credentials (not test keys)
2. Set environment variables in your hosting platform
3. Never expose `.env` files in deployments
4. Rotate any credentials that were accidentally exposed

---

For security questions or to report vulnerabilities, see [SECURITY.md](SECURITY.md).
