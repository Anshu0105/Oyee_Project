import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Moderation = () => {
  const [violations, setViolations] = useState([]);
  const [moderationStats, setModerationStats] = useState({
    pendingReports: 12,
    shadowBanned: 34,
    hardBanned: 7,
    botCatches: 248
  });

  useEffect(() => {
    fetchViolations();
    fetchModerationStats();
  }, []);

  const fetchViolations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/moderation/violations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setViolations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModerationStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/moderation-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setModerationStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const doShadow = async () => {
    const username = document.getElementById('sb-u').value;
    const duration = document.getElementById('sb-d').value;
    if (!username) return alert('Please enter a username');

    try {
      await axios.post('http://localhost:5000/api/admin/shadow-ban', { username, duration }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Shadow ban applied!');
      fetchModerationStats();
    } catch (err) {
      alert('Error applying shadow ban');
    }
  };

  const doHard = async () => {
    const username = document.getElementById('sb-u').value;
    if (!username) return alert('Please enter a username');

    try {
      await axios.post('http://localhost:5000/api/admin/hard-ban', { username }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Hard ban applied!');
      fetchModerationStats();
    } catch (err) {
      alert('Error applying hard ban');
    }
  };

  const doGrant = async () => {
    const username = document.getElementById('ac-u').value;
    const points = parseInt(document.getElementById('ac-p').value);
    const reason = document.getElementById('ac-r').value;
    if (!username || !points) return alert('Please fill all fields');

    try {
      await axios.post('http://localhost:5000/api/admin/adjust-aura', { username, points, reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Aura granted!');
    } catch (err) {
      alert('Error granting aura');
    }
  };

  const doDeduct = async () => {
    const username = document.getElementById('ac-u').value;
    const points = -Math.abs(parseInt(document.getElementById('ac-p').value));
    const reason = document.getElementById('ac-r').value;
    if (!username || !points) return alert('Please fill all fields');

    try {
      await axios.post('http://localhost:5000/api/admin/adjust-aura', { username, points, reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Aura deducted!');
    } catch (err) {
      alert('Error deducting aura');
    }
  };

  return (
    <div className="panel" id="panel-moderation">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">SAFETY & <span>MODERATION</span></div>
          <div className="ph-sub">// live violations · shadow ban · aura correction</div>
          <div className="ph-line"></div>
        </div>
      </div>
      <div className="g4" style={{marginBottom: '16px'}}>
        <div className="kpi">
          <div className="kpi-stripe red"></div>
          <div className="kpi-label">Pending Reports</div>
          <div className="kpi-val red">{moderationStats.pendingReports}</div>
          <div className="kpi-delta dn">↑ +12 vs avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe amber"></div>
          <div className="kpi-label">Shadow Banned</div>
          <div className="kpi-val">{moderationStats.shadowBanned}</div>
          <div className="kpi-delta up">↓ -3 this week</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe red"></div>
          <div className="kpi-label">Hard Banned</div>
          <div className="kpi-val red">{moderationStats.hardBanned}</div>
          <div className="kpi-delta">0 change</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe green"></div>
          <div className="kpi-label">Bot Catches</div>
          <div className="kpi-val green">{moderationStats.botCatches}</div>
          <div className="kpi-delta up">99.2% accuracy</div>
        </div>
      </div>
      <div className="g2">
        <div className="card" style={{maxHeight: '500px', overflowY: 'auto'}}>
          <div className="card-accent"></div>
          <div className="ct">🚨 LIVE VIOLATIONS</div>
          <div className="cs">// flagged by OyeeeBot in real-time</div>
          <div id="mod-feed">
            {violations.map(v => (
              <div key={v._id} className="vi">
                <div className="vi-av">🚫</div>
                <div className="vi-body">
                  <div className="vi-name">{v.user}</div>
                  <div className="vi-msg" dangerouslySetInnerHTML={{__html: v.message.replace(new RegExp(v.flagged, 'gi'), `<mark>$&</mark>`)}}></div>
                  <div className="vi-meta">Flagged: {v.flagged} · {new Date(v.time).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-accent amber"></div>
            <div className="ct">SHADOW BAN</div>
            <div className="ig">
              <label className="il">Food Identity</label>
              <input className="inp" id="sb-u" placeholder="e.g. Spicy Ramen" />
            </div>
            <div className="ig">
              <label className="il">Duration</label>
              <select className="inp" id="sb-d">
                <option>1 Hour</option>
                <option>6 Hours</option>
                <option>24 Hours</option>
                <option>7 Days</option>
                <option>Permanent</option>
              </select>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn d" style={{flex: 1}} onClick={doShadow}>👁 SHADOW BAN</button>
              <button className="btn" style={{flex: 1}} onClick={doHard}>⛔ HARD BAN</button>
            </div>
          </div>
          <div className="card">
            <div className="card-accent green"></div>
            <div className="ct">AURA CORRECTION</div>
            <div className="ig">
              <label className="il">User</label>
              <input className="inp" id="ac-u" placeholder="Food name..." />
            </div>
            <div className="ig">
              <label className="il">Points (negative to deduct)</label>
              <input className="inp" id="ac-p" type="number" placeholder="+50 or -20" />
            </div>
            <div className="ig">
              <label className="il">Reason</label>
              <input className="inp" id="ac-r" placeholder="Reason..." />
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn s" style={{flex: 1}} onClick={doGrant}>+ GRANT</button>
              <button className="btn d" style={{flex: 1}} onClick={doDeduct}>- DEDUCT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;