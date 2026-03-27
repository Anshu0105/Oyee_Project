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
  if (isCurrentUser) return '#8c1a30'; // Red for current user
  if (rank === 1) return '#d4af37';    // Gold
  if (rank === 2) return '#a8a9ad';    // Silver
  if (rank === 3) return '#cd7f32';    // Bronze
  return '#999999';                    // Default Grey
};

const getTierColor = (tier, isCurrentUser) => {
  if (isCurrentUser) return '#8c1a30';
  switch (tier) {
    case 'STARBORN': return '#8c52ff'; // Purple
    case 'THUNDER': return '#d4af37';  // Gold
    case 'RISING': return '#5cb85c';   // Green
    case 'GHOST': return '#888888';    // Grey
    default: return '#888888';
  }
};

const getTodayColor = (todayStr) => {
  if (todayStr === '+0') return '#888888';
  if (todayStr.startsWith('+')) return '#5cb85c';
  if (todayStr.startsWith('-')) return '#8c1a30';
  return '#888888';
};

const Leaderboard = () => {
  const { user } = useUser();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#111111',
      padding: '40px 32px',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '3.5rem',
          letterSpacing: '4px',
          color: '#111111',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          LEADERBOARD
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#888888',
          letterSpacing: '1px',
        }}>
          // ranked by public aura - earned in the void
        </p>
        <div style={{ width: '48px', height: '3px', background: '#8c1a30', marginTop: '10px', borderRadius: '2px' }} />
      </div>

      {/* Leaderboard Table Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Table Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 2fr 1fr 1fr 100px',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          fontFamily: 'var(--font-bebas)',
          fontSize: '1.2rem',
          color: '#888888',
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
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 2fr 1fr 1fr 100px',
                  padding: '20px 24px',
                  borderBottom: '1px solid #eeeeee',
                  background: isCurrentUser ? '#fff5f7' : 'transparent',
                  borderLeft: isCurrentUser ? '4px solid #8c1a30' : '4px solid transparent',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentUser) e.currentTarget.style.background = '#f9f9f9';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentUser) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Rank */}
                <div style={{ 
                  textAlign: 'center', 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1.6rem', 
                  color: rankColor 
                }}>
                  {entry.rank}
                </div>

                {/* Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-bebas)', 
                    fontSize: '1.4rem', 
                    color: isCurrentUser ? '#8c1a30' : '#111111',
                    letterSpacing: '1px'
                  }}>
                    {entry.name}
                  </span>
                  {entry.badge && <span style={{ fontSize: '1rem' }}>{entry.badge}</span>}
                  {isCurrentUser && (
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.65rem', 
                      color: '#888888',
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
                  fontSize: '1.5rem', 
                  color: (isCurrentUser || entry.aura > 400) ? '#8c1a30' : '#666666'
                }}>
                  {entry.aura.toLocaleString()}
                </div>

                {/* Tier */}
                <div style={{ 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1.2rem', 
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
