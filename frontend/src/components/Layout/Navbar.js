import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, MessageSquare, LayoutGrid, Trophy, ShoppingBag, 
  ChevronDown, Flame, Sparkles, Zap, LogOut, Palette, UserCheck, Settings
} from 'lucide-react';

import { BACKEND_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import AIBotIcon from '../UI/AIBotIcon';
import RippleEffect from '../UI/RippleEffect';
import SummaryModal from '../UI/SummaryModal';
import { motion, AnimatePresence } from 'framer-motion';

const DropdownLink = ({ to, icon: Icon, label }) => (
  <Link to={to} className="interactive" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 12px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    color: 'inherit',
    transition: 'all 0.2s',
  }}>
    <Icon size={16} style={{ opacity: 0.7 }} />
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
  </Link>
);

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
        position: 'relative',
        whiteSpace: 'nowrap'
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
  const navigate = useNavigate();
  const { user, token, logoutUser } = useUser();
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [ripple, setRipple] = useState({ active: false, x: 0, y: 0 });
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Modern Click-Outside & Esc-Key detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);


  const handleBotClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setRipple({ active: true, x, y });
    
    // Summary logic
    fetchSummary();
  };

  const fetchSummary = async () => {
    setIsAiLoading(true);
    try {
      // Extract room ID from URL if applicable
      const match = location.pathname.match(/\/room\/([a-f\d]+)/i);
      const roomId = match ? match[1] : 'global';

      const res = await fetch(`${BACKEND_URL}/api/ai/summarize/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Failed to generate summary. Our AI ghost is sleeping.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const onRippleComplete = () => {
    setRipple({ ...ripple, active: false });
    setIsSummaryModalOpen(true);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

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
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
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
      </div>

      <div className="nav-navigation" style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center',
        flex: '2',
        justifyContent: 'center',
        marginRight: '80px' // Nudging to the left as requested
      }}>
        <NavItem icon={LayoutGrid} label="ROOMS" to="/rooms" />
        <NavItem icon={MessageSquare} label="MESSAGE" to="/messages" />
        <NavItem icon={Trophy} label="LEADERBOARD" to="/leaderboard" />
        <NavItem icon={ShoppingBag} label="AURA STORE" to="/store" />
        <div style={{ margin: '0 8px', height: '24px', width: '1px', background: 'var(--glass-border)', opacity: 0.5 }} />
        <AIBotIcon onClick={handleBotClick} />
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '1' }}>
        {/* New Profile Identity Bar Container */}
        <div className="profile-container" ref={profileDropdownRef} style={{ position: 'relative' }}>
            <div 
              className="interactive"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                padding: '6px 14px 6px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '30px',
                border: '1px solid var(--border-main)',
                background: 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                minWidth: '150px',
                transition: 'all 0.3s ease',
                boxShadow: 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-chat)',
                border: '1px solid var(--accent-primary)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>
                <span style={{ 
                  fontFamily: 'var(--font-bebas)', 
                  fontSize: '1rem', 
                  letterSpacing: '1px', 
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {user.name.toUpperCase()}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.6rem', 
                  opacity: 0.7, 
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={8} fill="currentColor" /> {user.aura}
                </span>
              </div>
              <ChevronDown size={12} style={{ marginLeft: '2px', opacity: 0.5 }} />
            </div>

            {/* Professional Profile Dropdown (Small Version) */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="glass"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    padding: '12px',
                    zIndex: 2000,
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(30px)',
                    color: 'var(--text-main)'
                  }}
                >
                  {/* Header Section */}
                  <div style={{ marginBottom: '12px', padding: '0 4px' }}>
                    <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.2rem', letterSpacing: '1px' }}>{user.name}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{user.email || 'OYEEE_PILOT_MODE'}</div>
                  </div>

                  {/* Stat Ribbon (Condensed) */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '4px', 
                    marginBottom: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '6px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ color: 'var(--streak-orange)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <Flame size={12} fill="currentColor" /> {user.streak || 7}d
                      </div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <Zap size={12} fill="currentColor" /> {user.aura}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items (Compact) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <DropdownLink to="/profile" icon={UserCheck} label="Identity" />
                    <DropdownLink to="/profile/settings" icon={Settings} label="Settings" />
                  </div>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />

                  {/* Footer Actions */}
                  <button onClick={toggleTheme} className="interactive" style={{ 
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}>
                    <Palette size={14} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 500 }}>Aesthetic</span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="interactive" 
                    style={{ 
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      opacity: 0.6,
                      fontSize: '0.85rem'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Exit</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>

      {/* AI Visuals Overlay */}
      <RippleEffect 
        active={ripple.active} 
        onComplete={onRippleComplete} 
        originX={ripple.x} 
        originY={ripple.y} 
      />

      <SummaryModal 
        isOpen={isSummaryModalOpen} 
        onClose={() => setIsSummaryModalOpen(false)} 
        summary={summary}
        isLoading={isAiLoading}
      />

      <style>{`
        .nav-link:hover .nav-underline {
          width: 100% !important;
        }
        @keyframes pulse-aura {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
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
