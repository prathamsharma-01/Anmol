import React, { useState } from 'react';
import './shared.css';

export default function LoginCard() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="sw-login-card">
      <div className="sw-login-left">
        <h3>Welcome back</h3>
        <p>Login to continue shopping fast.</p>
      </div>
      <div className="sw-login-right">
        <input placeholder="Mobile number" value={mobile} onChange={e => setMobile(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="sw-login-btn">Login</button>
      </div>
    </div>
  );
}
