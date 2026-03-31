import React from 'react';

export default function Aura() {
  return (
    <div className="panel active" id="panel-aura">
      <div className="ph"><div className="ph-left"><div className="ph-title">AURA & <span>ECONOMY</span></div><div className="ph-sub">// aura rules · point values · decay · inflation</div><div className="ph-line"></div></div></div>
      <div className="g4" style={{marginBottom:'16px'}}>
        <div className="kpi"><div className="kpi-stripe green"></div><div className="kpi-label">Total Printed</div><div className="kpi-val green">84.2K</div></div>
        <div className="kpi"><div className="kpi-stripe red"></div><div className="kpi-label">Total Burned</div><div className="kpi-val red">12.4K</div></div>
        <div className="kpi"><div className="kpi-stripe blue"></div><div className="kpi-label">Ratio</div><div className="kpi-val blue">6.8x</div><div className="kpi-delta">Healthy</div></div>
        <div className="kpi"><div className="kpi-stripe amber"></div><div className="kpi-label">Inflation Risk</div><div className="kpi-val green">LOW</div></div>
      </div>
      <div className="g2">
        <div className="card"><div className="card-accent green"></div><div className="ct">AURA POINT VALUES</div>
          <div className="ig"><label className="il">AuraPlus+++ gives (pts)</label><input className="inp" defaultValue="7" type="number" /></div>
          <div className="ig"><label className="il">AuraMinus--- deducts (pts)</label><input className="inp" defaultValue="3" type="number" /></div>
          <div className="ig"><label className="il">Thunder badge threshold</label><input className="inp" defaultValue="500" type="number" /></div>
          <div className="ig"><label className="il">Starborn badge threshold</label><input className="inp" defaultValue="1000" type="number" /></div>
          <button className="btn p sm" onClick={() => window.toast && window.toast('SAVED', 'Economy modifiers updated.')}>SAVE VALUES</button>
        </div>
        <div className="card"><div className="card-accent"></div><div className="ct">ECONOMY HEALTH</div>
          <div className="pb-wrap"><div className="pb-header"><span className="pb-label">Printed (Earned)</span><span className="pb-val">84.2K</span></div><div className="pb"><div className="pf g" style={{width:'87%'}}></div></div></div>
          <div className="pb-wrap"><div className="pb-header"><span className="pb-label">Burned (Spent)</span><span className="pb-val">12.4K</span></div><div className="pb"><div className="pf r" style={{width:'13%'}}></div></div></div>
          <div className="pb-wrap"><div className="pb-header"><span className="pb-label">Held by Users</span><span className="pb-val">71.8K</span></div><div className="pb"><div className="pf b" style={{width:'74%'}}></div></div></div>
          <button className="btn d sm" style={{marginTop:'8px'}} onClick={() => window.toast && window.toast('REBALANCED', 'Economy successfully stabilized.')}>⚖ REBALANCE</button>
        </div>
      </div>
    </div>
  );
}