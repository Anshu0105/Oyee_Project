import React from 'react';

export default function Bot() {
  return (
    <div className="panel active" id="panel-bot">
      <div className="ph"><div className="ph-left"><div className="ph-title">OYEEEBOT <span>RULES</span></div><div className="ph-sub">// if/then logic · module toggles</div><div className="ph-line"></div></div></div>
      <div className="g2">
        <div className="card"><div className="card-accent"></div><div className="ct">LOGIC BUILDER</div>
          <div className="ig"><label className="il">IF message contains</label><input className="inp" id="li-if" placeholder="keyword or phrase..." /></div>
          <div className="ig"><label className="il">THEN bot replies</label><textarea className="inp" id="li-then" placeholder="Bot reply text..."></textarea></div>
          <button className="btn p sm" style={{width:'100%'}} onClick={() => window.toast && window.toast('RULE ADDED', 'OyeeeBot logic successfully updated.')}>+ ADD RULE</button>
          <div id="logic-list" style={{marginTop:'10px'}}>
             <div style={{background:'var(--bg3)',padding:'10px',marginBottom:'5px',border:'1px solid var(--border)',fontFamily:'var(--fm)',fontSize:'10px',fontWeight:700}}>IF: "how to get aura?"<br/>THEN: "Be nice and chat! Aura is given by others."</div>
             <div style={{background:'var(--bg3)',padding:'10px',marginBottom:'5px',border:'1px solid var(--border)',fontFamily:'var(--fm)',fontSize:'10px',fontWeight:700}}>IF: "who made this?"<br/>THEN: "OYEEE was built for YOU!"</div>
          </div>
        </div>
        <div className="card"><div className="card-accent blue"></div><div className="ct">MODULE TOGGLES</div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">URL Detection</div></div></div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">Phone Detection</div></div></div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">Auto Aura Correction</div></div></div>
          <div className="tgl-row"><div className="tgl"></div><div className="tgl-info"><div className="tgl-lbl">Aggressive Spam Filter</div></div></div>
        </div>
      </div>
    </div>
  );
}