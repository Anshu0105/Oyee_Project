import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/adminApi';

export default function Analytics() {
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    // Simulated data that looks like the screenshot
    const fakeData = Array(30).fill(0).map((_, i) => ({
      date: i,
      users: 10 + Math.random() * 2
    }));
    setGrowthData(fakeData);
  }, []);

  const tooltipStyle = { 
    background: '#121216', 
    border: '1px solid rgba(255,0,60,0.3)', 
    borderRadius: 2, 
    fontFamily: 'Share Tech Mono',
    fontSize: 12
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">NEW USERS (7D)</div>
          <div className="stat-value">18</div>
          <div className="stat-trend up">↑ +12%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">RETENTION</div>
          <div className="stat-value green">67%</div>
          <div className="stat-trend up">↑ +4%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AVG SESSION</div>
          <div className="stat-value gold">14M</div>
          <div className="stat-trend up">↑ +2m</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">BANS (7D)</div>
          <div className="stat-value">5</div>
          <div className="stat-trend down">↑ +2</div>
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header" style={{ padding: '12px 20px' }}>
            <div className="stat-label" style={{ color: '#fff', fontSize: 13 }}>USER GROWTH (30 DAYS)</div>
          </div>
          <div className="chart-area" style={{ height: 260, padding: '20px 20px 0 20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="step" dataKey="users" stroke="#00ff88" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header" style={{ padding: '12px 20px' }}>
            <div className="stat-label" style={{ color: '#fff', fontSize: 13 }}>AURA ECONOMY</div>
          </div>
          <div style={{ padding: 24 }}>
            <div className="stat-label">TOTAL ISSUED</div>
            <div className="stat-value gold" style={{ fontSize: 32, marginTop: 4, marginBottom: 24 }}>8,492</div>
            
            <div className="stat-label">IN CIRCULATION</div>
            <div className="stat-value green" style={{ fontSize: 32, marginTop: 4 }}>1,842</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header" style={{ padding: '12px 20px' }}>
          <div className="stat-label" style={{ color: '#fff', fontSize: 13 }}>PEAK ACTIVITY HEATMAP</div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 4, height: 40 }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} style={{ 
                flex: 1, 
                background: `rgba(255, 0, 60, ${0.1 + (Math.random() * 0.9)})`,
                borderRadius: 2
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-dim)' }}>
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
