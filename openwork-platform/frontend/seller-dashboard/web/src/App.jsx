import React, { useState } from 'react'
import { Header, Banner, Footer } from '../../../shared-ui/src/index.jsx'
import AgentManagement from './AgentManagement'
import DarkStoreManagement from './DarkStoreManagement'
import './AgentManagement.css'
import './Toolbar.css'

export default function App(){
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div>
      <Header 
        showCart={false}
        showLocationButton={false}
        showLoginButton={false}
      />
      <div style={{maxWidth:1400, margin:'0 auto', padding:16}}>
        <Banner />
        
        {/* Toolbar with Tab Buttons */}
        <div className="seller-toolbar">
          <button 
            className={`toolbar-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <span className="btn-icon">📦</span>
            Inventory
          </button>
          <button 
            className={`toolbar-btn ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            <span className="btn-icon">🚗</span>
            Delivery Agents
          </button>
        </div>

        {/* Content */}
        {activeTab === 'inventory' && <DarkStoreManagement />}
        {activeTab === 'agents' && <AgentManagement />}
      </div>
      <Footer />
    </div>
  )
}
