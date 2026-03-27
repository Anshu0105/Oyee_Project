import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare, LayoutGrid, Trophy, ShoppingBag, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

const NavItem = ({ icon: Icon, label, children, to }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="nav-item-container" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{ position: 'relative' }}
    >
      <Link to={to} className="nav-link interactive" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        color: 'inherit',
        textDecoration: 'none',
        fontFamily: 'var(--font-bebas)',
        fontSize: '1.2rem',
        letterSpacing: '2px',
        transition: 'color 0.3s'
      }}>
        <Icon size={18} />
        {label}
        {children && <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
      </Link>

      {children && isOpen && (
        <div className="dropdown glass" style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          minWidth: '200px',
          padding: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          animation: 'fadeUp 0.3s ease'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  return (
    <nav className="glass" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      height: '64px',
      margin: '12px',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 100
    }}>
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="brand interactive" style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '2rem',
          letterSpacing: '4px',
          color: 'var(--accent-primary)'
        }}>
          OYEEE<span>.</span>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '8px' }}>
          <NavItem icon={LayoutGrid} label="ROOMS" to="/rooms" />
          <NavItem icon={MessageSquare} label="MESSAGE" to="/messages" />
          <NavItem icon={Trophy} label="LEADERBOARD" to="/leaderboard" />
          <NavItem icon={ShoppingBag} label="AURA STORE" to="/store" />
          
          <NavItem icon={User} label="PROFILE" to="/profile">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px' }}>Identity: {user.name}</div>
            
            {user.claimedItems && user.claimedItems.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Aura Stash:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '4px 0' }}>
                  {user.claimedItems.map(item => (
                    <span key={item.id} title={item.name} style={{ fontSize: '1.2rem', cursor: 'help' }}>
                      {item.emoji}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />
            <Link to="/profile/promotions" className="interactive" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem' }}>Promotions (Ads)</Link>
            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Last Rooms Joined:</div>
            {user.lastRooms.map(room => (
              <button key={room} className="interactive" style={{ 
                background: 'none', border: 'none', color: 'var(--accent-primary)', textAlign: 'left', padding: '4px 0', fontSize: '0.9rem' 
              }}>Rejoin {room}</button>
            ))}
          </NavItem>
        </div>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>AURA POINTS</span>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>{user.aura}</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="interactive glass"
          style={{
            padding: '8px 12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          {theme === 'wine' ? 'PURPLE-FREEZE' : 'CROWN-YELLOW'}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
