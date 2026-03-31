import React, { useState } from 'react';
import Modal from '../components/Modal';

const Employees = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [role, setRole] = useState('Moderator');
  const [pw, setPw] = useState('');

  const addEmployee = () => {
    alert('Employee added!');
    setModalOpen(false);
  };

  const employees = [
    { name: 'Arjun Sharma', id: 'EMP-001', role: 'Super Admin', roleKey: 'sup' },
    { name: 'Priya Mehta', id: 'EMP-002', role: 'Moderator', roleKey: 'mod' },
    { name: 'Rahul Das', id: 'EMP-003', role: 'Analyst', roleKey: 'ana' },
    { name: 'Sneha Patel', id: 'EMP-004', role: 'Support', roleKey: 'sup2' },
  ];

  return (
    <div className="panel" id="panel-employees">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">EMPLOYEE <span>MANAGEMENT</span></div>
          <div className="ph-sub">// manage admin accounts · roles · permissions</div>
          <div className="ph-line"></div>
        </div>
        <div className="ph-actions">
          <button className="btn p sm" onClick={() => setModalOpen(true)}>+ ADD EMPLOYEE</button>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ct">STAFF DIRECTORY</div>
          <div className="cs">// all admin portal employees</div>
          <div>
            {employees.map((e, i) => (
              <div key={i} className="emp-row">
                <div className={`emp-av ${e.roleKey}`}>{e.name[0]}</div>
                <div className="emp-info">
                  <div className="emp-name">{e.name}</div>
                  <div className="emp-id">{e.id} &middot; Last login: Today {new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <span className={`badge ${e.roleKey === 'sup' || e.roleKey === 'sup2' ? 'r' : e.roleKey === 'mod' ? 'b' : e.roleKey === 'ana' ? 'pu' : 'a'}`}>{e.role}</span>
                <div className="emp-actions">
                  <button className="btn xs">RESET PW</button>
                  <button className="btn xs d">SUSPEND</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ct">ROLE PERMISSIONS</div>
          <div className="cs">// what each role can access</div>
          <table className="dt">
            <thead>
              <tr>
                <th>Role</th>
                <th>Moderate</th>
                <th>Declare</th>
                <th>Notify</th>
                <th>Economy</th>
                <th>Employees</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge r">Super Admin</span></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td><span className="badge b">Moderator</span></td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td><span className="badge pu">Analyst</span></td>
                <td>❌</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
                <td>❌</td>
              </tr>
              <tr>
                <td><span className="badge a">Support</span></td>
                <td>✅</td>
                <td>❌</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="ADD EMPLOYEE">
        <div className="ig">
          <label className="il">Full Name</label>
          <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="Employee full name" />
        </div>
        <div className="ig">
          <label className="il">Employee ID</label>
          <input className="inp" value={id} onChange={e => setId(e.target.value)} placeholder="EMP-005" />
        </div>
        <div className="ig">
          <label className="il">Role</label>
          <select className="inp" value={role} onChange={e => setRole(e.target.value)}>
            <option>Moderator</option>
            <option>Analyst</option>
            <option>Support</option>
            <option>Super Admin</option>
          </select>
        </div>
        <div className="ig">
          <label className="il">Password</label>
          <input className="inp" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Temporary password" />
        </div>
        <div className="mft">
          <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn p" onClick={addEmployee}>CREATE ACCOUNT</button>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;