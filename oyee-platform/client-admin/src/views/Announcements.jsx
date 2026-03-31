import React from 'react';

export default function Announcements() {
  const sendAnn = () => { if(window.toast) window.toast('BROADCAST', 'Announcement sent to all users.'); };
  const updateTicker = () => { if(window.toast) window.toast('TICKER', 'Live ticker updated.'); };

  return (
    <div className="panel active" id="panel-announcements">
      <div className="ph"><div className="ph-left"><div className="ph-title">ANNOUNCE<span>MENTS</span></div><div className="ph-sub">// ticker · banners · maintenance notices</div><div className="ph-line"></div></div></div>
      <div className="g2">
        <div className="card"><div className="card-accent"></div><div className="ct">BROADCAST MESSAGE</div>
          <div className="ig"><label className="il">Type</label><select className="inp"><option>Scrolling Ticker</option><option>Banner Toast</option><option>Room Alert</option><option>Maintenance</option></select></div>
          <div className="ig"><label className="il">Target</label><select className="inp"><option>All Rooms</option><option>WiFi Only</option><option>University Only</option><option>GPS Only</option></select></div>
          <div className="ig"><label className="il">Message</label><textarea className="inp" id="ann-msg" placeholder="Announcement text..."></textarea></div>
          <button className="btn p sm" style={{width:'100%'}} onClick={sendAnn}>📡 BROADCAST NOW</button>
        </div>
        <div className="card"><div className="card-accent amber"></div><div className="ct">LIVE TICKER TEXT</div>
          <div className="ig"><label className="il">Current Ticker</label><textarea className="inp" id="ticker-edit" defaultValue="⚠ NO LINKS · NO PHONE NUMBERS · NO REAL NAMES · VIOLATION = INSTANT BAN · AURA IS EVERYTHING · YOUR NAME IS A FOOD"></textarea></div>
          <div className="ig"><label className="il">Add to Ticker</label><input className="inp" id="ticker-add" placeholder="Add new item to ticker..." /></div>
          <button className="btn p sm" onClick={updateTicker}>UPDATE LIVE TICKER</button>
        </div>
      </div>
    </div>
  );
}