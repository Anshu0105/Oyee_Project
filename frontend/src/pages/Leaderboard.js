import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import UserProfileModal from '../components/UI/UserProfileModal';
import { BACKEND_URL, safeFetch } from '../config';
const getRankColor = (rank, isCurrentUser) => {
  if (isCurrentUser) return 'var(--accent-primary)'; 
  if (rank === 1) return '#d4af37';    // Gold
  if (rank === 2) return '#a8a9ad';    // Silver
  if (rank === 3) return '#cd7f32';    // Bronze
  return 'var(--text-dim)';                    
};

const calculateTier = (aura) => {
  if (aura > 1000) return 'STARBORN';
  if (aura > 500) return 'THUNDER';
  if (aura > 200) return 'RISING';
  return 'GHOST';
}

const getTierColor = (tier, isCurrentUser) => {
  if (isCurrentUser) return 'var(--accent-primary)';
  switch (tier) {
    case 'STARBORN': return '#8c52ff'; // Purple
    case 'THUNDER': return '#d4af37';  // Gold
    case 'RISING': return 'var(--accent-green)';   
    case 'GHOST': return 'var(--text-dim)';    
    default: return 'var(--text-dim)';
  }
};

const getTodayColor = (todayStr) => {
  if (todayStr === '+0') return 'var(--text-dim)';
  if (todayStr.startsWith('+')) return 'var(--accent-green)';
  if (todayStr.startsWith('-')) return 'var(--accent-primary)';
  return 'var(--text-dim)';
};

const Leaderboard = () => {
  const { user: currentUser, token } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (!token) return;
    
    safeFetch('/api/users/leaderboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(data => {
       if (Array.isArray(data)) {
         setLeaderboard(data);
       }
    })
    .catch(err => console.error("Failed to sync leaderboard:", err));
  }, [token]);


  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      padding: '40px 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '3.5rem',
          letterSpacing: '4px',
          color: 'var(--text-main)',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          LEADERBOARD
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          // ranked by public aura - earned in the void
        </p>
        <div style={{ width: '48px', height: '3px', background: 'var(--accent-primary)', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Leaderboard Table Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Table Header Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 100px', padding: '16px 24px', borderBottom: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: 'var(--text-dim)', letterSpacing: '2px'
        }}>
          <div style={{ textAlign: 'center' }}>#</div>
          <div>IDENTITY</div>
          <div style={{ textAlign: 'center' }}>AURA PTS</div>
          <div>TIER</div>
          <div style={{ textAlign: 'right' }}>TREND</div>
        </div>

        {/* Table Body */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaderboard.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>Void is empty...</div>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry._id === currentUser.id;
              const rankColor = getRankColor(rank, isCurrentUser);
              const tier = calculateTier(entry.aura);
              const todayStr = entry.weeklyAuraGain >= 0 ? `+${entry.weeklyAuraGain}` : `${entry.weeklyAuraGain}`;
              
              return (
                <div 
                  key={entry._id}
                  className="interactive hover-lift"
                  onClick={() => setSelectedUserId(entry._id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 100px', padding: '20px 24px',
                    borderBottom: '1px solid var(--glass-border)',
                    background: isCurrentUser ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                    borderLeft: isCurrentUser ? '4px solid var(--accent-primary)' : '4px solid transparent',
                    alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer'
                  }}
                >
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', color: rankColor }}>
                    {rank}
                  </div>
  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{entry.avatarEmoji}</span>
                    <span style={{ 
                      fontFamily: 'var(--font-bebas)', fontSize: '1.6rem', color: isCurrentUser ? 'var(--accent-primary)' : 'var(--text-main)', letterSpacing: '1px'
                    }}>
                      {entry.auraName}
                    </span>
                    {entry.equippedBadge && <span style={{ fontSize: '1.2rem' }}>{entry.equippedBadge}</span>}
                    {isCurrentUser && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                        (YOU)
                      </span>
                    )}
                  </div>
  
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-bebas)', fontSize: '1.7rem', color: isCurrentUser ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                    {entry.aura.toLocaleString()}
                  </div>
  
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.3rem', color: getTierColor(tier, isCurrentUser), letterSpacing: '1px' }}>
                    {tier}
                  </div>
  
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 'bold', color: getTodayColor(todayStr) }}>
                    {todayStr}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Dynamic Profile Overlays */}
      <UserProfileModal 
         isOpen={selectedUserId !== null} 
         userId={selectedUserId} 
         token={token}
         currentUserId={currentUser.id}
         onClose={() => setSelectedUserId(null)} 
      />
    </div>
  );
};

export default Leaderboard;
