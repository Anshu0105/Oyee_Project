import React from 'react';

export default function Audit() {
  return (
    <div className="panel active" id="panel-audit">
      <div className="ph"><div className="ph-left"><div className="ph-title">AUDIT <span>LOG</span></div><div className="ph-sub">// immutable record of all admin actions</div><div className="ph-line"></div></div><div className="ph-actions"><button className="btn sm" onClick={() => window.toast && window.toast('EXPORT', 'Audit log exporting to CSV.')}>↓ Export CSV</button><button className="btn s sm" onClick={() => window.toast && window.toast('EXPORT', 'Audit data exporting to Excel.')}>↓ Export Excel</button></div></div>
      <div className="card">
        <table className="dt">
          <thead><tr><th>Action</th><th>User</th><th>Details</th><th>Time</th></tr></thead>
          <tbody>
            <tr>
              <td><span className="badge r">BANNED USER</span></td>
              <td><span style={{color:'var(--red)',fontWeight:700,fontFamily:'var(--fm)'}}>EMP-001</span></td>
              <td>Banned user "Spicy Tuna" for violation.</td>
              <td style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--ink4)',fontWeight:700}}>Just now</td>
            </tr>
            <tr>
              <td><span className="badge pu">ECONOMY TWEAK</span></td>
              <td><span style={{color:'var(--red)',fontWeight:700,fontFamily:'var(--fm)'}}>EMP-002</span></td>
              <td>Adjusted AuraPlus threshold to 7.</td>
              <td style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--ink4)',fontWeight:700}}>1H ago</td>
            </tr>
            <tr>
              <td><span className="badge pu">SYSTEM</span></td>
              <td><span style={{color:'var(--green)',fontWeight:700,fontFamily:'var(--fm)'}}>SYS-AUTO</span></td>
              <td>Daily backup and log rotation complete.</td>
              <td style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--ink4)',fontWeight:700}}>12H ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}