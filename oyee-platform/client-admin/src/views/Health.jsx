import React from 'react';

export default function Health() {
  return (
    <div className="panel active" id="panel-health">
      <div className="ph"><div className="ph-left"><div className="ph-title">SYSTEM <span>HEALTH</span></div><div className="ph-sub">// nodes · uptime · latency</div><div className="ph-line"></div></div></div>
      <div className="g4" style={{marginBottom:'16px'}}>
        <div className="kpi"><div className="kpi-stripe green"></div><div className="kpi-label">Uptime</div><div className="kpi-val green">99.8%</div></div>
        <div className="kpi"><div className="kpi-stripe green"></div><div className="kpi-label">Avg Latency</div><div className="kpi-val green">24ms</div></div>
        <div className="kpi"><div className="kpi-stripe blue"></div><div className="kpi-label">Active Nodes</div><div className="kpi-val blue">18</div></div>
        <div className="kpi"><div className="kpi-stripe amber"></div><div className="kpi-label">Peak/hr</div><div className="kpi-val">1,840</div></div>
      </div>
      <div className="card">
        <div className="ct">MODULE STATUS</div>
        <table className="dt">
          <thead><tr><th>Module</th><th>Health Bar</th><th>Status</th><th>Last Check</th></tr></thead>
          <tbody>
          <tr><td style={{fontWeight:700}}>OyeeeBot Core</td><td style={{width:'200px'}}><div className="pb"><div className="pf g" style={{width:'98%'}}></div></div></td><td><span className="badge g">98%</span></td><td style={{fontFamily:'var(--fm)',fontSize:'9px',fontWeight:700,color:'var(--ink4)'}}>2m ago</td></tr>
          <tr><td style={{fontWeight:700}}>Aura Engine</td><td><div className="pb"><div className="pf g" style={{width:'100%'}}></div></div></td><td><span className="badge g">100%</span></td><td style={{fontFamily:'var(--fm)',fontSize:'9px',fontWeight:700,color:'var(--ink4)'}}>2m ago</td></tr>
          <tr><td style={{fontWeight:700}}>Room Mesh</td><td><div className="pb"><div className="pf a" style={{width:'91%'}}></div></div></td><td><span className="badge a">91%</span></td><td style={{fontFamily:'var(--fm)',fontSize:'9px',fontWeight:700,color:'var(--ink4)'}}>5m ago</td></tr>
          <tr><td style={{fontWeight:700}}>GPS Cluster</td><td><div className="pb"><div className="pf a" style={{width:'84%'}}></div></div></td><td><span className="badge a">84%</span></td><td style={{fontFamily:'var(--fm)',fontSize:'9px',fontWeight:700,color:'var(--ink4)'}}>5m ago</td></tr>
          <tr><td style={{fontWeight:700}}>Store API</td><td><div className="pb"><div className="pf g" style={{width:'100%'}}></div></div></td><td><span className="badge g">100%</span></td><td style={{fontFamily:'var(--fm)',fontSize:'9px',fontWeight:700,color:'var(--ink4)'}}>2m ago</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}