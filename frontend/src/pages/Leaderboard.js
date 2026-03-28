import React from 'react';
import { useUser } from '../context/UserContext';

const mockLeaderboard = [
  { rank: 1, name: 'Fluffy Pancake', badge: '⭐', aura: 1247, tier: 'STARBORN', today: '+84' },
  { rank: 2, name: 'Crunchy Mango', badge: '⚡', aura: 672, tier: 'THUNDER', today: '+49' },
  { rank: 3, name: 'Smoky Papaya', badge: '⚡', aura: 589, tier: 'THUNDER', today: '+21' },
  { rank: 4, name: 'Crispy Dragonfruit', badge: '', aura: 421, tier: 'RISING', today: '+14' },
  { rank: 5, name: 'Tangy Persimmon', badge: '', aura: 387, tier: 'RISING', today: '+7' },
  { rank: 6, name: 'Tasty Strawberry', badge: '', aura: 342, tier: 'RISING', today: '+0' },
  { rank: 7, name: 'Spicy Ramen', badge: '', aura: 198, tier: 'GHOST', today: '-3' },
  { rank: 8, name: 'Juicy Guava', badge: '', aura: 154, tier: 'GHOST', today: '+8' },
];

const getRankColor = (rank, isCurrentUser) => {
  if (isCurrentUser) return 'var(--accent-primary)'; 
  if (rank === 1) return '#d4af37';    // Gold
  if (rank === 2) return '#a8a9ad';    // Silver
  if (rank === 3) return '#cd7f32';    // Bronze
  return 'var(--text-dim)';                    
};

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
  const { user } = useUser();

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
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}>
          // ranked by public aura - earned in the void
        </p>
        <div style={{ width: '48px', height: '3px', background: 'var(--accent-primary)', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Leaderboard Table Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Table Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 2fr 1fr 1fr 100px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-bebas)',
          fontSize: '1.2rem',
          color: 'var(--text-dim)',
          letterSpacing: '2px'
        }}>
          <div style={{ textAlign: 'center' }}>#</div>
          <div>IDENTITY</div>
          <div style={{ textAlign: 'center' }}>AURA PTS</div>
          <div>TIER</div>
          <div style={{ textAlign: 'right' }}>TODAY</div>
        </div>

        {/* Table Body */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {mockLeaderboard.map((entry) => {
            const isCurrentUser = entry.name === user.name;
            const rankColor = getRankColor(entry.rank, isCurrentUser);
            
            return (
              <div 
                key={entry.rank}
                className="interactive"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 2fr 1fr 1fr 100px',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--glass-border)',
                  background: isCurrentUser ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                  borderLeft: isCurrentUser ? '4px solid var(--accent-primary)' : '4px solid transparent',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  cursor: 'default'
                }}
              >
                {/* Rank */}
                <div style={{ 
                  textAlign: 'center', 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1.8rem', 
                  color: rankColor 
                }}>
                  {entry.rank}
                </div>

                {/* Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-bebas)', 
                    fontSize: '1.6rem', 
                    color: isCurrentUser ? 'var(--accent-primary)' : 'var(--text-main)',
                    letterSpacing: '1px'
                  }}>
                    {entry.name}
                  </span>
                  {entry.badge && <span style={{ fontSize: '1.2rem' }}>{entry.badge}</span>}
                  {isCurrentUser && (
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.65rem', 
                      color: 'var(--text-dim)',
                      marginLeft: '8px' 
                    }}>
                      (YOU)
                    </span>
                  )}
                </div>

                {/* Aura Points */}
                <div style={{ 
                  textAlign: 'center', 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1.7rem', 
                  color: (isCurrentUser || entry.aura > 400) ? 'var(--accent-primary)' : 'var(--text-main)'
                }}>
                  {entry.aura.toLocaleString()}
                </div>

                {/* Tier */}
                <div style={{ 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1.3rem', 
                  color: getTierColor(entry.tier, isCurrentUser),
                  letterSpacing: '1px'
                }}>
                  {entry.tier}
                </div>

                {/* Today */}
                <div style={{ 
                  textAlign: 'right', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  color: getTodayColor(entry.today)
                }}>
                  {entry.today}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
