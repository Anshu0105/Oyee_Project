import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('All Tiers');
  const [status, setStatus] = useState('All Status');
  const [users, setUsers] = useState([]);
  
  // Edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editTier, setEditTier] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditTier(user.tier || 'Ghost');
  };

  const closeEditModal = () => {
    setEditUser(null);
  };

  const saveUser = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/user/${editUser._id}`, {
        username: editUsername,
        role: editRole,
        tier: editTier
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      alert('Error updating user');
    }
  };

  const filterUsers = () => {
    // Basic frontend filtering placeholder
  };

  return (
    <div className="panel" id="panel-users">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">ALL <span>USERS</span></div>
          <div className="ph-sub">// search, edit, ban, aura controls</div>
          <div className="ph-line"></div>
        </div>
        <div className="ph-actions">
          <button className="btn sm" onClick={() => window.toast && window.toast('EXPORT', 'User data exporting to CSV.')}>↓ CSV</button>
          <button className="btn s sm" onClick={() => window.toast && window.toast('EXPORT', 'User data exporting to Excel (.xlsx)')}>↓ Excel</button>
        </div>
      </div>
      <div className="card">
        <div style={{display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap'}}>
          <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food name..." style={{maxWidth: '200px'}} onInput={filterUsers} />
          <select className="inp" value={tier} onChange={e => setTier(e.target.value)} style={{width: '130px'}}>
            <option>All Tiers</option>
            <option>Ghost</option>
            <option>Rising</option>
            <option>Thunder</option>
            <option>Starborn</option>
          </select>
          <select className="inp" value={status} onChange={e => setStatus(e.target.value)} style={{width: '140px'}}>
            <option>All Status</option>
            <option>Active</option>
            <option>Shadow Banned</option>
            <option>Hard Banned</option>
          </select>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>#</th>
              <th>Identity</th>
              <th>Aura</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u._id.slice(-4)}</td>
                <td>{u.username}</td>
                <td>{u.aura}</td>
                <td><span className={`badge ${u.role === 'employee' ? 'a' : 'gr'}`}>{u.role === 'employee' ? 'Admin' : 'Student'}</span></td>
                <td><span className={`badge ${!u.banned ? 'g' : 'r'}`}>{!u.banned ? 'Active' : 'Banned'}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{display: 'flex', gap: '4px', padding: '12px 14px'}}>
                  <button className="btn xs" onClick={() => openEditModal(u)}>EDIT</button>
                  <button className="btn xs d">BAN</button>
                  <input className="inp" type="number" placeholder="±pts" style={{width: '58px'}} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '400px'}}>
            <div className="ct">EDIT USER</div>
            <div className="ig">
              <label className="il">Username (Food Identity)</label>
              <input className="inp" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            </div>
            <div className="ig">
              <label className="il">Role</label>
              <select className="inp" value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="student">Student/User</option>
                <option value="employee">Admin/Employee</option>
              </select>
            </div>
            <div className="ig">
              <label className="il">Tier</label>
              <select className="inp" value={editTier} onChange={e => setEditTier(e.target.value)}>
                <option value="Ghost">Ghost</option>
                <option value="Rising">Rising</option>
                <option value="Thunder">Thunder</option>
                <option value="Starborn">Starborn</option>
              </select>
            </div>
            <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
              <button className="btn g" style={{flex: 1}} onClick={saveUser}>SAVE</button>
              <button className="btn d" style={{flex: 1}} onClick={closeEditModal}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;