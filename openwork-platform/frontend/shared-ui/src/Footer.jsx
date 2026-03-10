import React from 'react';
import './shared.css';

export default function Footer() {
  return (
    <footer className="sw-footer">
      <div className="sw-footer-inner">
        <div className="sw-brand">QuikRy</div>
        <div className="sw-col">
          <h4>Popular Searches</h4>
          <p className="muted">Avocado | Strawberry | Pomegranate | Beetroot | Potato</p>
        </div>
        <div className="sw-col">
          <h4>Company</h4>
          <ul>
            <li>Home</li>
            <li>Delivery Areas</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
