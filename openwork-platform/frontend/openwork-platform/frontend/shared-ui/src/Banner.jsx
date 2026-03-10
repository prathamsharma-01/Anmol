import React from 'react';
import './shared.css';

export default function Banner() {
  return (
    <div className="sw-banner">
      <div className="sw-banner-inner">
        <h2>Get Everything You Need</h2>
        <p>Fast delivery within 10 minutes</p>
        <button className="sw-order pulse">Order Now</button>
      </div>
    </div>
  );
}
