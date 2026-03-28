import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare, LayoutGrid, Trophy, ShoppingBag, ChevronDown, Flame } from 'lucide-react';
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
        transition: 'all 0.3s',
        position: 'relative'
      }}>
        <Icon size={18} />
        {label}
        {children && <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
        <span className="nav-underline" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '0%',
          height: '2px',
          background: 'var(--accent-primary)',
          transition: 'width 0.3s ease'
        }} />
      </Link>

      {children && isOpen && (
        <div className="dropdown glass" style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          minWidth: '220px',
          padding: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeUp 0.3s ease',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { toggleTheme } = useTheme();
  const { user } = useUser();

  return (
    <nav className="glass" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: '70px',
      margin: '20px',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '10px',
      zIndex: 900
    }}>
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/rooms" className="brand interactive" style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '2.2rem',
          letterSpacing: '4px',
          color: 'var(--accent-primary)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}>
          OYEEE<span style={{ color: 'var(--accent-primary)' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
           <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '1px' }}>LIVE</span>
           <div className="live-dot" />
        </div>
      </div>

      <div className="nav-center" style={{ display: 'flex', gap: '12px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <NavItem icon={LayoutGrid} label="ROOMS" to="/rooms" />
        <NavItem icon={MessageSquare} label="MESSAGE" to="/messages" />
        <NavItem icon={Trophy} label="LEADERBOARD" to="/leaderboard" />
        <NavItem icon={ShoppingBag} label="AURA STORE" to="/store" />
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Streak Counter */}
        <div className="streak-counter" title={`${user.streak || 7} day streak`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 152, 0, 0.2)',
          color: 'var(--streak-orange)',
          fontFamily: 'var(--font-bebas)',
          fontSize: '1.1rem',
          boxShadow: '0 0 15px rgba(255, 152, 0, 0.1)',
          animation: 'pulse-streak 2s infinite'
        }}>
          <Flame size={18} fill="currentColor" />
          <span>{user.streak || 7}</span>
        </div>

        {/* Profile with RGB Outline */}
        <div style={{ position: 'relative' }}>
          <NavItem 
            icon={() => (
              <div className="rgb-profile" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-chat)',
                overflow: 'hidden'
              }}>
                <User size={24} />
              </div>
            )} 
            to="/profile"
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '12px' }}>Aura: {user.aura} pts</div>
            
            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }} />
            <Link to="/profile/settings" className="interactive" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem' }}>Settings</Link>
            <Link to="/profile/promotions" className="interactive" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem' }}>Promotions</Link>
            
            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '8px 0' }} />
            <button onClick={toggleTheme} className="interactive" style={{ 
              background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.9rem', padding: 0, textAlign: 'left', cursor: 'pointer' 
            }}>Switch Aesthetic</button>
          </NavItem>
        </div>
      </div>

      <style>{`
        .nav-link:hover .nav-underline {
          width: 100% !important;
        }
        @keyframes pulse-streak {
          0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
