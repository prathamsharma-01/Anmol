import React from 'react';
import '../../styles/hightech-theme.css';

const HighTechPanel = () => {
  return (
    <div style={{padding:32, minHeight:'100vh', background:'var(--bg)'}}>
      <div className="ht-geo ht-panel" style={{maxWidth:980, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
          <div>
            <h1 className="ht-heading" style={{fontSize:28}}>Nebula Console</h1>
            <div className="ht-subtitle muted">High-tech dashboard • Live preview</div>
          </div>
          <div className="row">
            <button className="ht-btn">Primary Action</button>
            <button className="ht-btn ghost">Secondary</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:18}}>
          <div>
            <div className="ht-panel neon-outline" style={{padding:16, marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div className="neon-accent" style={{fontSize:14, fontWeight:700}}>SYSTEM STATUS</div>
                  <div style={{marginTop:6}}>
                    <strong style={{fontSize:20}}>All systems nominal</strong>
                    <div className="muted" style={{fontSize:13}}>No incidents detected</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="neon-accent" style={{fontWeight:700}}>97%</div>
                  <div className="muted" style={{fontSize:13}}>Uptime</div>
                </div>
              </div>
            </div>

            <div className="ht-panel" style={{padding:16}}>
              <h3 className="ht-heading" style={{fontSize:16}}>Activity Feed</h3>
              <ul style={{marginTop:12}}>
                <li className="muted">[10:02] Deployment: Frontend v1.4 deployed</li>
                <li className="muted">[09:47] Payment microservice responded in 120ms</li>
                <li className="muted">[08:15] New user registration: +1,234</li>
              </ul>
            </div>
          </div>

          <aside>
            <div className="ht-panel" style={{padding:14, marginBottom:12}}>
              <h4 className="ht-heading" style={{fontSize:14}}>Quick Controls</h4>
              <div className="col" style={{marginTop:12}}>
                <button className="ht-btn">Restart Service</button>
                <button className="ht-btn ghost">Open Logs</button>
              </div>
            </div>

            <div className="ht-panel" style={{padding:14}}>
              <h4 className="ht-heading" style={{fontSize:14}}>Connections</h4>
              <div className="muted" style={{marginTop:8}}>Active: <span className="neon-accent">4,321</span></div>
              <div className="muted">Errors: <span style={{color:'#ff7043'}}>3</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HighTechPanel;
