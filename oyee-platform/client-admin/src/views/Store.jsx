import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Store = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 87,
    pending: 7,
    auraBurned: 12400,
    avgOrderValue: 142
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats({
        totalOrders: res.data.orderCount,
        pending: res.data.pendingOrders,
        auraBurned: res.data.auraBurned,
        avgOrderValue: Math.round(res.data.auraBurned / res.data.orderCount) || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/order/${orderId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchOrders();
      fetchStats();
    } catch (err) {
      alert('Error updating order status');
    }
  };
  return (
    <div className="panel" id="panel-store">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">STORE & <span>ORDERS</span></div>
          <div className="ph-sub">// inventory · fulfillment · economy</div>
          <div className="ph-line"></div>
        </div>
      </div>
      <div className="g4" style={{marginBottom: '16px'}}>
        <div className="kpi">
          <div className="kpi-stripe red"></div>
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-val">{stats.totalOrders}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe amber"></div>
          <div className="kpi-label">Pending</div>
          <div className="kpi-val amber">{stats.pending}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe green"></div>
          <div className="kpi-label">Aura Burned</div>
          <div className="kpi-val green">{stats.auraBurned.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe blue"></div>
          <div className="kpi-label">Avg Order Value</div>
          <div className="kpi-val blue">{stats.avgOrderValue}</div>
        </div>
      </div>
      <div className="card">
        <div className="ct">ORDER FULFILLMENT</div>
        <div className="cs">// addresses shown only after reveal · auto-purge after shipping</div>
        <table className="dt">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item</th>
              <th>Aura Cost</th>
              <th>Claimed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
               <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px', color: 'var(--ink4)'}}>No orders available.</td></tr>
            ) : orders.map(order => (
              <tr key={order._id}>
                <td style={{fontFamily: 'var(--fm)', fontSize: '10px', fontWeight: 700}}>{order.orderId}</td>
                <td>{order.item}</td>
                <td style={{fontFamily: 'var(--fh)', fontSize: '18px', color: 'var(--red)'}}>{order.auraCost}</td>
                <td style={{fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--ink4)', fontWeight: 700}}>{order.claimedAt ? new Date(order.claimedAt).toLocaleString() : 'Pending'}</td>
                <td>
                  <span className={`badge ${order.status === 'pending' ? 'a' : order.status === 'shipped' ? 'g' : order.status === 'delivered' ? 'gr' : 'y'}`}>
                    {order.status}
                  </span>
                </td>
                <td style={{display: 'flex', gap: '5px', padding: '12px 14px'}}>
                  {order.status === 'pending' && (
                    <>
                      <button className="btn xs p" onClick={() => updateOrderStatus(order._id, 'revealed')}>REVEAL</button>
                      <button className="btn xs s" onClick={() => updateOrderStatus(order._id, 'shipped')}>SHIP</button>
                    </>
                  )}
                  {order.status === 'revealed' && (
                    <button className="btn xs s" onClick={() => updateOrderStatus(order._id, 'shipped')}>SHIP</button>
                  )}
                  {order.status === 'shipped' && (
                    <button className="btn xs s" onClick={() => updateOrderStatus(order._id, 'delivered')}>DELIVER</button>
                  )}
                  {order.status === 'delivered' && (
                    <span style={{fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--ink5)', fontWeight: 700}}>DONE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Store;