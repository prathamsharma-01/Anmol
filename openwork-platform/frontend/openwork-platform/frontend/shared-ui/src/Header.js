import React from 'react';
import './shared.css';

export default function Header({ place }) {
  return (
    <header className="sw-header">
      <div className="sw-brand">QuikRy</div>
      <div className="sw-actions">
        <div className="sw-place">{place || 'Set location'}</div>
        <button className="sw-login" onClick={() => { window.location.href = '/login' }}>Login</button>
        <button className="sw-cart">Cart</button>
      </div>
    </header>
  );
}
