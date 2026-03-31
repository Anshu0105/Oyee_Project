import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Charts = () => {
  const [activityData, setActivityData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [3200, 3100, 3300, 3400, 3500, 3600, 3241],
        borderColor: 'var(--red)',
        backgroundColor: 'rgba(200,16,46,0.1)',
        tension: 0.4,
      },
      {
        label: 'Messages Sent',
        data: [18000, 17500, 19000, 20000, 21000, 22000, 18400],
        borderColor: 'var(--green)',
        backgroundColor: 'rgba(10,122,60,0.1)',
        tension: 0.4,
      }
    ]
  });

  const [violationData, setViolationData] = useState({
    labels: ['Spam', 'PII', 'Harassment', 'Links', 'Other'],
    datasets: [{
      data: [45, 25, 15, 10, 5],
      backgroundColor: ['#c8102e', '#0a7a3c', '#b85c00', '#0052cc', '#6c757d'],
    }]
  });

  const [economyData, setEconomyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Printed',
        data: [1200, 1100, 1300, 1400, 1500, 1600, 1242],
        backgroundColor: 'var(--green)',
      },
      {
        label: 'Burned',
        data: [800, 900, 700, 600, 500, 400, 124],
        backgroundColor: 'var(--red)',
      }
    ]
  });

  const [roomData, setRoomData] = useState({
    labels: ['WiFi', 'University', 'GPS'],
    datasets: [{
      data: [45, 35, 20],
      backgroundColor: ['#c8102e', '#0a7a3c', '#0052cc'],
    }]
  });

  const [hourlyData, setHourlyData] = useState({
    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Users',
      data: Array.from({length: 24}, () => Math.floor(Math.random() * 200) + 50),
      borderColor: 'var(--blue)',
      backgroundColor: 'rgba(0,82,204,0.1)',
      tension: 0.4,
    }]
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch activity data
        const activityRes = await axios.get('http://localhost:5000/api/admin/activity-data', { headers });
        setActivityData({
          labels: activityRes.data.labels,
          datasets: [
            {
              label: 'Active Users',
              data: activityRes.data.activeUsers,
              borderColor: 'var(--red)',
              backgroundColor: 'rgba(200,16,46,0.1)',
              tension: 0.4,
            },
            {
              label: 'Messages Sent',
              data: activityRes.data.messagesSent,
              borderColor: 'var(--green)',
              backgroundColor: 'rgba(10,122,60,0.1)',
              tension: 0.4,
            }
          ]
        });

        // Fetch violation data
        const violationRes = await axios.get('http://localhost:5000/api/admin/violation-data', { headers });
        setViolationData({
          labels: violationRes.data.labels,
          datasets: [{
            data: violationRes.data.data,
            backgroundColor: ['#c8102e', '#0a7a3c', '#b85c00', '#0052cc', '#6c757d'],
          }]
        });

        // Fetch economy data
        const economyRes = await axios.get('http://localhost:5000/api/admin/economy-data', { headers });
        setEconomyData({
          labels: economyRes.data.labels,
          datasets: [
            {
              label: 'Printed',
              data: economyRes.data.printed,
              backgroundColor: 'var(--green)',
            },
            {
              label: 'Burned',
              data: economyRes.data.burned,
              backgroundColor: 'var(--red)',
            }
          ]
        });

        // Fetch room data
        const roomRes = await axios.get('http://localhost:5000/api/admin/room-data', { headers });
        setRoomData({
          labels: roomRes.data.labels,
          datasets: [{
            data: roomRes.data.data,
            backgroundColor: ['#c8102e', '#0a7a3c', '#0052cc'],
          }]
        });

        // Fetch hourly data
        const hourlyRes = await axios.get('http://localhost:5000/api/admin/hourly-data', { headers });
        setHourlyData({
          labels: hourlyRes.data.labels,
          datasets: [{
            label: 'Users',
            data: hourlyRes.data.data,
            borderColor: 'var(--blue)',
            backgroundColor: 'rgba(0,82,204,0.1)',
            tension: 0.4,
          }]
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <>
      <div className="g2">
        <div className="card">
          <div className="card-accent"></div>
          <div className="ct">USER ACTIVITY — 7 DAYS</div>
          <div className="cs">// daily active users · messages sent</div>
          <div className="chart-wrap">
            <Line data={activityData} options={options} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent blue"></div>
          <div className="ct">VIOLATION BREAKDOWN</div>
          <div className="cs">// types of violations caught by OyeeeBot</div>
          <div className="chart-wrap" style={{maxHeight: '240px', display: 'flex', justifyContent: 'center'}}>
            <Doughnut data={violationData} />
          </div>
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="card-accent green"></div>
          <div className="ct">AURA ECONOMY</div>
          <div className="cs">// printed vs burned · weekly</div>
          <div className="chart-wrap">
            <Bar data={economyData} options={options} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent amber"></div>
          <div className="ct">ROOM DISTRIBUTION</div>
          <div className="cs">// users by room type</div>
          <div className="chart-wrap" style={{maxHeight: '220px', display: 'flex', justifyContent: 'center'}}>
            <Doughnut data={roomData} />
          </div>
        </div>
        <div className="card">
          <div className="card-accent"></div>
          <div className="ct">HOURLY TRAFFIC</div>
          <div className="cs">// users per hour today</div>
          <div className="chart-wrap">
            <Line data={hourlyData} options={options} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Charts;