import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const CustomerApp = lazy(() => import('../../customer-app/src/App.jsx'));
const DeliveryApp = lazy(() => import('../../delivery-app/web/src/App.jsx'));
const SellerApp = lazy(() => import('../../seller-dashboard/web/src/App.jsx'));
const CustomerServiceApp = lazy(() => import('../../customer-service-dashboard/web/src/App.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/customer" style={{ marginRight: 12 }}>Customer</Link>
        <Link to="/delivery" style={{ marginRight: 12 }}>Delivery</Link>
        <Link to="/seller" style={{ marginRight: 12 }}>Seller</Link>
        <Link to="/support">Customer Service</Link>
      </nav>

      <Suspense fallback={<div>Loading app...</div>}>
        <Routes>
          <Route path="/" element={<div style={{ padding: 20 }}>Welcome to Openwork unified shell.</div>} />
          <Route path="/customer/*" element={<CustomerApp />} />
          <Route path="/delivery/*" element={<DeliveryApp />} />
          <Route path="/seller/*" element={<SellerApp />} />
          <Route path="/support/*" element={<CustomerServiceApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
