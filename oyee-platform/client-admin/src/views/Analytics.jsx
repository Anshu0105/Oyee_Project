import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 3241,
    avgSession: '14m',
    retention7d: '62%',
    botCatchRate: '99.1%',
    userGrowth: '+18.4%',
    sessionChange: '+2m',
    retentionChange: '+5%'
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/analytics-kpis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalyticsData(res.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, []);
  return (
    <div className="panel" id="panel-analytics">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">PLATFORM <span>ANALYTICS</span></div>
          <div className="ph-sub">// deep insights · user behaviour · growth trends</div>
          <div className="ph-line"></div>
        </div>
        <div className="ph-actions">
          <select className="inp" style={{width: '140px', fontSize: '10px', padding: '7px 10px'}}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="btn sm" onClick={() => window.toast && window.toast('EXPORT', 'Analytics snapshot rendering to PDF.')}>↓ Export PDF</button>
          <button className="btn s sm" onClick={() => window.toast && window.toast('EXPORT', 'Analytics data exporting to Excel (.xlsx)')}>↓ Export Excel</button>
        </div>
      </div>

      <div className="g4" style={{marginBottom: '16px'}}>
        <div className="kpi">
          <div className="kpi-stripe red"></div>
          <div className="kpi-label">Total Users</div>
          <div className="kpi-val">{analyticsData.totalUsers.toLocaleString()}</div>
          <div className="kpi-delta up">↑ {analyticsData.userGrowth}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe green"></div>
          <div className="kpi-label">Avg Session</div>
          <div className="kpi-val green">{analyticsData.avgSession}</div>
          <div className="kpi-delta up">↑ {analyticsData.sessionChange}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe blue"></div>
          <div className="kpi-label">Retention 7d</div>
          <div className="kpi-val blue">{analyticsData.retention7d}</div>
          <div className="kpi-delta up">↑ {analyticsData.retentionChange}</div>
        </div>
        <div className="kpi">
          <div className="kpi-stripe amber"></div>
          <div className="kpi-label">Bot Catch Rate</div>
          <div className="kpi-val">{analyticsData.botCatchRate}</div>
          <div className="kpi-delta up">↑ Excellent</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-accent"></div>
          <div className="ct">USER GROWTH TREND</div>
          <div className="cs">// new vs returning · monthly</div>
          <div className="chart-wrap">
            <Line data={{
              labels: ['W1', 'W2', 'W3', 'W4'],
              datasets: [
                { label: 'New', data: [1200, 1900, 3000, 5000], borderColor: 'var(--red)', backgroundColor: 'rgba(200,16,46,0.1)', fill: true, tension: 0.4 },
                { label: 'Returning', data: [8000, 8500, 9200, 10500], borderColor: 'var(--blue)', backgroundColor: 'transparent', tension: 0.4 }
              ]
            }} options={{ plugins: { legend: { display: true } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent green"></div>
          <div className="ct">MESSAGES BY TIME</div>
          <div className="cs">// peak activity hours</div>
          <div className="chart-wrap">
            <Bar data={{
              labels: ['00', '04', '08', '12', '16', '20'],
              datasets: [
                { label: 'Messages', data: [5000, 2000, 8000, 15000, 22000, 25000], backgroundColor: 'var(--green)' }
              ]
            }} />
          </div>
        </div>
      </div>

      <div className="g4" style={{marginBottom: '16px'}}>
        <div className="card">
          <div className="card-accent gold"></div>
          <div className="ct">ACTIVE TIERS</div>
          <div className="cs">// user level distribution</div>
          <div className="chart-wrap" style={{maxHeight:'160px',display:'flex',justifyContent:'center'}}>
            <Doughnut data={{
              labels: ['Base', 'Plus', 'Pro', 'Elite', 'Mythic'],
              datasets: [{ data: [60, 20, 10, 7, 3], backgroundColor: ['#6c757d', '#0052cc', '#0a7a3c', '#d4a017', '#c8102e'] }]
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent blue"></div>
          <div className="ct">ENTRY POINTS</div>
          <div className="cs">// how users join rooms</div>
          <div className="chart-wrap" style={{maxHeight:'160px',display:'flex',justifyContent:'center'}}>
            <Doughnut data={{
              labels: ['Direct', 'Invite', 'Match', 'Proximity'],
              datasets: [{ data: [40, 25, 20, 15], backgroundColor: ['#0052cc', '#b85c00', '#0a7a3c', '#c8102e'] }]
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent"></div>
          <div className="ct">DEVICE TYPES</div>
          <div className="cs">// mobile vs web apps</div>
          <div className="chart-wrap" style={{maxHeight:'160px',display:'flex',justifyContent:'center'}}>
            <Doughnut data={{
              labels: ['iOS', 'Android', 'Web'],
              datasets: [{ data: [55, 35, 10], backgroundColor: ['#c8102e', '#0052cc', '#6c757d'] }]
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent amber"></div>
          <div className="ct">AURA DISTRIBUTION</div>
          <div className="cs">// economy wealth map</div>
          <div className="chart-wrap" style={{maxHeight:'160px',display:'flex',justifyContent:'center'}}>
            <Doughnut data={{
              labels: ['Poor', 'Mid', 'Rich', 'Whale'],
              datasets: [{ data: [45, 40, 12, 3], backgroundColor: ['#6c757d', '#0052cc', '#0a7a3c', '#d4a017'] }]
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;