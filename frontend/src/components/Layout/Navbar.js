import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare, LayoutGrid, Trophy, ShoppingBag, ChevronDown } from 'lucide-react';
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
        color: 'var(--text-main)',
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
  const { user } = useUser();

  return (
    <nav className="glass" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: '72px',
      margin: '16px',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      {/* LEFT: BRAND & LIVE INDICATOR */}
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div className="brand interactive" style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '2.4rem',
          letterSpacing: '4px',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'baseline'
        }}>
          OYEEE<span style={{ color: 'var(--accent-primary)' }}>.</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <span style={{ 
            fontFamily: 'var(--font-bebas)', 
            color: 'var(--accent-primary)', 
            fontSize: '1rem', 
            letterSpacing: '2px',
            opacity: 0.8
          }}>
            LIVE
          </span>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--accent-primary)', 
            animation: 'pulse 1.5s infinite' 
          }} />
        </div>
      </div>

      {/* CENTER: NAV LINKS */}
      <div className="nav-center" style={{ display: 'flex', gap: '8px', flex: 2, justifyContent: 'center' }}>
        <NavItem icon={LayoutGrid} label="ROOMS" to="/rooms" />
        <NavItem icon={MessageSquare} label="MESSAGE" to="/messages" />
        <NavItem icon={Trophy} label="LEADERBOARD" to="/leaderboard" />
        <NavItem icon={ShoppingBag} label="AURA STORE" to="/store" />
      </div>

      {/* RIGHT: STREAK & AVATAR */}
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
        
        {/* Flame Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', 
          background: 'rgba(255, 140, 0, 0.1)', 
          padding: '6px 16px', borderRadius: '20px', 
          border: '1px solid rgba(255, 140, 0, 0.2)',
          color: '#ff8c00', fontWeight: 'bold'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>7</span>
        </div>
        
        {/* Avatar Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Link to="/profile" className="interactive" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '42px', 
            borderRadius: '50%', border: '2px solid #ff8c00', 
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 12px rgba(255, 140, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            <User size={20} />
          </Link>
          <ChevronDown size={14} style={{ opacity: 0.6, color: 'var(--text-main)' }} />
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(233, 30, 99, 0); }
          100% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
