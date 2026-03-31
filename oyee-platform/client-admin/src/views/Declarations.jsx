import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';

const Declarations = () => {
  const [type, setType] = useState('announcement');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [target, setTarget] = useState('All Users (Global)');
  const [duration, setDuration] = useState('30 Minutes');
  const [urgency, setUrgency] = useState('info');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [declarations, setDeclarations] = useState([]);

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/declarations/declarations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeclarations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendDeclaration = async () => {
    try {
      await axios.post('http://localhost:5000/api/declarations/declarations', {
        type, title, message: msg, target, duration, urgency, popup: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Declaration broadcasted!');
      fetchDeclarations();
    } catch (err) {
      alert('Error sending declaration');
    }
  };

  const previewDecl = () => {
    setPreviewOpen(true);
  };

  return (
    <div className="panel" id="panel-declarations">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">LIVE <span>DECLARATIONS</span></div>
          <div className="ph-sub">// broadcast live messages · shown prominently to ALL users on the platform</div>
          <div className="ph-line"></div>
        </div>
      </div>

      <div className="g2">
        <div>
          <div className="card">
            <div className="card-accent"></div>
            <div className="ct">📢 SEND NEW DECLARATION</div>
            <div className="cs">// this will appear LIVE on every user's screen immediately</div>
            <div className="ig">
              <label className="il">Declaration Type</label>
              <select className="inp" value={type} onChange={e => setType(e.target.value)}>
                <option value="announcement">📣 General Announcement</option>
                <option value="warning">⚠️ Warning / Alert</option>
                <option value="event">🎉 Event Notice</option>
                <option value="maintenance">🔧 Maintenance Notice</option>
                <option value="aura">⚡ Aura Hunt / Special Event</option>
                <option value="rule">📜 New Rule / Policy</option>
                <option value="emergency">🚨 Emergency Broadcast</option>
              </select>
            </div>
            <div className="ig">
              <label className="il">Declaration Title</label>
              <input className="inp" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AURA HUNT BEGINS NOW" />
            </div>
            <div className="ig">
              <label className="il">Declaration Message</label>
              <textarea className="inp" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Write the full declaration message that all users will see..."></textarea>
            </div>
            <div className="ig">
              <label className="il">Target Audience</label>
              <select className="inp" value={target} onChange={e => setTarget(e.target.value)}>
                <option>All Users (Global)</option>
                <option>WiFi Room Users Only</option>
                <option>University Room Users Only</option>
                <option>GPS Room Users Only</option>
                <option>Thunder+ Tier Only</option>
                <option>New Users (&lt; 7 days)</option>
              </select>
            </div>
            <div className="ig">
              <label className="il">Display Duration</label>
              <select className="inp" value={duration} onChange={e => setDuration(e.target.value)}>
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>3 Hours</option>
                <option>6 Hours</option>
                <option>24 Hours</option>
                <option>Until Manually Removed</option>
              </select>
            </div>
            <div className="ig">
              <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                  <label className="il">Urgency Level</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                      <input type="radio" name="urgency" value="info" checked={urgency === 'info'} onChange={e => setUrgency(e.target.value)} /> INFO
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                      <input type="radio" name="urgency" value="warning" checked={urgency === 'warning'} onChange={e => setUrgency(e.target.value)} /> WARNING
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                      <input type="radio" name="urgency" value="critical" checked={urgency === 'critical'} onChange={e => setUrgency(e.target.value)} /> CRITICAL
                    </label>
                  </div>
                </div>
                <div style={{flex: 1}}>
                  <label className="il">Show as Popup</label>
                  <div className="tgl-row" style={{padding: '4px 0'}}>
                    <div className="tgl on"></div>
                    <div className="tgl-lbl" style={{fontSize: '12px'}}>Force Popup on Entry</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn p lg btn-icon" style={{flex: 1}} onClick={sendDeclaration}>📢 BROADCAST LIVE DECLARATION</button>
              <button className="btn sm" onClick={previewDecl}>👁 PREVIEW</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-accent"></div>
            <div className="ct">ACTIVE DECLARATIONS</div>
            <div className="cs">// currently live on the user platform</div>
            <div id="active-decls">
              {declarations.filter(d => d.status === 'active').map(d => (
                <div key={d._id} className="decl-live">
                  <div className="decl-live-bar"></div>
                  <div className="decl-header">
                    <div className="decl-live-dot"></div>
                    <div className="decl-label">LIVE DECLARATION</div>
                    <span className="badge r">Active</span>
                  </div>
                  <div style={{fontFamily: 'var(--fh)', fontSize: '18px', letterSpacing: '2px', color: 'var(--red)', marginBottom: '6px'}}>{d.title}</div>
                  <div className="decl-text">{d.message}</div>
                  <div className="decl-meta">TARGET: {d.target} · REMAINING: {d.duration} · Sent by Admin</div>
                  <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                    <button className="btn xs d">✕ REMOVE</button>
                    <button className="btn xs">EDIT</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-accent green"></div>
            <div className="ct">DECLARATION HISTORY</div>
            <div className="cs">// past declarations · last 10</div>
            <div id="decl-history">
              {declarations.slice(0, 10).map(d => (
                <div key={d._id} className="notif-item">
                  <div className="notif-icon-wrap r">📣</div>
                  <div className="notif-body">
                    <div className="notif-title">{d.title}</div>
                    <div className="notif-msg">{d.message}</div>
                    <div className="notif-meta">{new Date(d.createdAt).toLocaleString()} · {d.target}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="PREVIEW">
        <div style={{fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--ink4)', letterSpacing: '2px', marginBottom: '12px'}}>THIS IS HOW USERS WILL SEE THE DECLARATION:</div>
        <div className="decl-live">
          <div className="decl-live-bar"></div>
          <div className="decl-header">
            <div className="decl-live-dot"></div>
            <div className="decl-label">{title || 'DECLARATION TITLE'}</div>
          </div>
          <div className="decl-text">{msg || 'Declaration message will appear here...'}</div>
          <div className="decl-meta">Preview · {target} · {duration}</div>
        </div>
        <div className="mft">
          <button className="btn" onClick={() => setPreviewOpen(false)}>Close</button>
          <button className="btn p" onClick={() => { setPreviewOpen(false); sendDeclaration(); }}>BROADCAST THIS</button>
        </div>
      </Modal>
    </div>
  );
};

export default Declarations;