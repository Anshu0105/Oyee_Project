import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    type: 'info',
    title: '',
    body: '',
    segment: 'all',
    user: '',
    scheduled: false
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const sendNotification = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/notification', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Notification sent!');
      setFormData({
        type: 'info',
        title: '',
        body: '',
        segment: 'all',
        user: '',
        scheduled: false
      });
      fetchNotifications();
    } catch (err) {
      alert('Error sending notification');
    }
  };
  return (
    <div className="panel" id="panel-notifications">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">PUSH <span>NOTIFICATIONS</span></div>
          <div className="ph-sub">// send targeted notifications to users · in-app + push alerts</div>
          <div className="ph-line"></div>
        </div>
      </div>

      <div className="g2">
        <div>
          <div className="card">
            <div className="card-accent blue"></div>
            <div className="ct">🔔 SEND NOTIFICATION</div>
            <div className="cs">// target specific users or groups</div>
            <div className="ig">
              <label className="il">Type</label>
              <select className="inp" name="type" value={formData.type} onChange={handleInputChange}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="ig">
              <label className="il">Title</label>
              <input className="inp" name="title" value={formData.title} onChange={handleInputChange} placeholder="Notification title" />
            </div>
            <div className="ig">
              <label className="il">Message</label>
              <textarea className="inp" name="body" value={formData.body} onChange={handleInputChange} placeholder="Notification body" rows="3"></textarea>
            </div>
            <div className="ig">
              <label className="il">Target Segment</label>
              <select className="inp" name="segment" value={formData.segment} onChange={handleInputChange}>
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="new">New Users</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
            {formData.segment === 'specific' && (
              <div className="ig">
                <label className="il">Username</label>
                <input className="inp" name="user" value={formData.user} onChange={handleInputChange} placeholder="Specific username" />
              </div>
            )}
            <div className="ig">
              <label className="il">
                <input type="checkbox" name="scheduled" checked={formData.scheduled} onChange={handleInputChange} /> Schedule for later
              </label>
            </div>
            <button className="btn p lg btn-icon" style={{width: '100%', marginTop: '4px'}} onClick={sendNotification}>🔔 SEND NOTIFICATION</button>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-accent blue"></div>
            <div className="ct">NOTIFICATION QUEUE</div>
            <div className="cs">// pending + recent sends</div>
            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
              {notifications.map(n => (
                <div key={n._id} className="notif-item">
                  <div className={`notif-icon-wrap ${n.type === 'error' ? 'r' : n.type === 'success' ? 'g' : 'b'}`}>
                    {n.type === 'error' ? '⚠️' : n.type === 'success' ? '✅' : 'i'}
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-meta">{n.segment} · {new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`badge ${n.sent ? 'g' : 'y'}`}>{n.sent ? 'SENT' : 'PENDING'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-accent green"></div>
            <div className="ct">NOTIFICATION ANALYTICS</div>
            <div className="cs">// delivery rates · opens</div>
            <div className="g2" style={{marginTop: '16px'}}>
              <div className="kpi">
                <div className="kpi-stripe green"></div>
                <div className="kpi-label">Delivery Rate</div>
                <div className="kpi-val green">98.2%</div>
              </div>
              <div className="kpi">
                <div className="kpi-stripe blue"></div>
                <div className="kpi-label">Open Rate</div>
                <div className="kpi-val blue">74.5%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;