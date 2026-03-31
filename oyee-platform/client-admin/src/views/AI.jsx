import React from 'react';

export default function AI() {
  return (
    <div className="panel active" id="panel-ai">
      <div className="ph"><div className="ph-left"><div className="ph-title">AI <span>ASSISTANT</span></div><div className="ph-sub">// ask anything · powered by claude</div><div className="ph-line"></div></div></div>
      <div style={{display:'flex',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}}>
        <button className="btn sm btn-icon" onClick={() => window.toast && window.toast('AI', 'Loading Violation Data...')}>🛡️ Violation Analysis</button>
        <button className="btn sm btn-icon" onClick={() => window.toast && window.toast('AI', 'Analyzing Economy Metrics...')}>💰 Economy Advice</button>
        <button className="btn sm btn-icon" onClick={() => window.toast && window.toast('AI', 'Generating new identity terms...')}>🍎 Generate Names</button>
        <button className="btn sm btn-icon" onClick={() => window.toast && window.toast('AI', 'Compiling growth strategies...')}>📣 Growth Tips</button>
        <button className="btn sm btn-icon" onClick={() => window.toast && window.toast('AI', 'Drafting Declaration...')}>📢 Write Declaration</button>
      </div>
      <div className="card" style={{marginBottom:0}}>
        <div className="ct">✦ ADMIN INTELLIGENCE</div><div className="cs">// full platform context · strategic advisor</div>
        <div style={{height:'380px',overflowY:'auto',background:'var(--bg)',border:'1.5px solid var(--border)',padding:'14px',display:'flex',flexDirection:'column',gap:'10px',scrollbarWidth:'thin'}}>
          <div style={{display:'flex',flexDirection:'column',maxWidth:'80%'}}>
            <div style={{padding:'10px 14px',background:'var(--bg2)',border:'1.5px solid var(--border)',borderLeft:'3px solid var(--red)',fontSize:'12px',lineHeight:'1.65',fontWeight:600}}>Welcome, I'm your OYEEE AI assistant with full platform context. Ask me anything about moderation, economy, user growth, bot rules, content strategy, or ask me to write declarations and notifications.</div>
            <div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--ink4)',marginTop:'3px',fontWeight:700}}>OYEEE AI · Ready</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
          <input style={{flex:1,background:'var(--bg)',border:'1.5px solid var(--border)',color:'var(--ink)',padding:'10px 14px',fontFamily:'var(--fb)',fontSize:'12px',fontWeight:600,outline:'none',transition:'border-color .18s'}} placeholder="Ask anything or give instructions..." />
          <button style={{padding:'0 20px',background:'var(--red)',border:'none',color:'#fff',fontFamily:'var(--fh)',fontSize:'14px',letterSpacing:'3px',cursor:'pointer',height:'42px',transition:'all .18s'}}>ASK</button>
        </div>
      </div>
    </div>
  );
}