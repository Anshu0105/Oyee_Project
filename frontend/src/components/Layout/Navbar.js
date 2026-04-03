import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MessageSquare, LayoutGrid, Trophy, ShoppingBag, ChevronDown, Flame, Settings, Gift, Palette, LogOut, Check, X, Bot } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BotPanel from '../Bot/BotPanel';

const LogoutModal = ({ onConfirm, onCancel }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      style={{
        background: '#121212', border: '1px solid rgba(255,0,85,0.2)', padding: '32px',
        borderRadius: '24px', width: '100%', maxWidth: '360px', textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ 
        width: '60px', height: '60px', background: 'rgba(255,0,85,0.1)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF0055',
        margin: '0 auto 20px'
      }}>
        <LogOut size={28} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Leaving so soon?</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '32px' }}>Are you sure you want to log out of the Void?</p>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={onCancel}
          style={{ 
            flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', 
            borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          style={{ 
            flex: 1, padding: '14px', background: '#FF0055', border: 'none', 
            borderRadius: '12px', color: '#fff', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,0,85,0.3)'
          }}
        >
          Logout
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const NavItem = ({ icon: Icon, label, children, to }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="nav-item-container" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{ position: 'relative' }}
    >
      <Link to={to} className="nav-link interactive" style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'inherit',
        textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '1px', transition: 'all 0.3s'
      }}>
        <Icon size={18} />
        {label}
        {children && <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
      </Link>
      <AnimatePresence>
        {children && isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="dropdown glass" 
            style={{
              position: 'absolute', top: '100%', left: '0', minWidth: '220px', padding: '16px',
              zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
              borderRadius: '16px', border: '1px solid var(--glass-border)'
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme } = useTheme();
  const { user, logoutUser } = useUser();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBotPanel, setShowBotPanel] = useState(false);
  const [aestheticOn, setAestheticOn] = useState(true);
  const dropdownRef = useRef(null);

  const currentRoomId = location.pathname.startsWith('/room/') ? location.pathname.split('/room/')[1] : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAesthetic = (e) => {
    e.stopPropagation();
    setAestheticOn(!aestheticOn);
    toggleTheme();
  };

  return (
    <>
      <nav className="glass" style={{
        display: 'flex', alignItems: 'center', padding: '0 32px', height: '70px', margin: '20px',
        justifyContent: 'space-between', position: 'sticky', top: '10px', zIndex: 900
      }}>
        <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/rooms" className="brand interactive" style={{
            fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.05em', color: 'var(--accent-primary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center'
          }}>
            OYEEE.
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span style={{ fontWeight: '500', fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '1px' }}>LIVE</span>
             <div className="live-dot" />
          </div>
        </div>

        <div className="nav-center" style={{ display: 'flex', gap: '8px', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <NavItem icon={LayoutGrid} label="ROOMS" to="/rooms" />
          <NavItem icon={MessageSquare} label="MESSAGE" to="/messages" />
          <NavItem icon={Trophy} label="LEADERBOARD" to="/leaderboard" />
          <NavItem icon={ShoppingBag} label="AURA STORE" to="/store" />
        </div>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => setShowBotPanel(true)}
            style={{
                width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,0,85,0.1)',
                border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-primary)', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,0,85,0.2)'
            }}
          >
            <Bot size={22} />
          </motion.div>

          <div className="streak-counter" title={`${user.streak || 7} day streak`} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
            background: 'rgba(255, 152, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 152, 0, 0.2)',
            color: 'var(--streak-orange)', fontWeight: '700', fontSize: '1rem'
          }}>
            <Flame size={16} fill="currentColor" />
            <span>{user.streak || 7}</span>
          </div>

          <div 
            style={{ position: 'relative' }} 
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <div 
              onClick={() => navigate('/profile')}
              style={{
                width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${showProfileDropdown ? '#FF0055' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.3s', overflow: 'hidden'
              }}
            >
              {user.avatarEmoji ? <span style={{ fontSize: '1.2rem' }}>{user.avatarEmoji}</span> : <User size={20} />}
            </div>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '260px',
                    background: '#121212', border: '1px solid rgba(255,0,85,0.2)', borderRadius: '20px',
                    padding: '24px', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(255,0,85,0.05)',
                    overflow: 'visible' // Fix for glow/shadow
                  }}
                >
                  {/* HEADER */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#fff', marginBottom: '2px' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#FF0055', fontWeight: '700' }}>Aura: {user.aura} pts</div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 -24px 16px' }} />

                  {/* MENU ITEMS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <MenuLink icon={Settings} label="Settings" to="/profile/settings" />
                    <MenuLink icon={Gift} label="Promotions" to="/profile/promotions" />
                    
                    <div 
                      onClick={handleToggleAesthetic}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                        background: 'transparent'
                      }}
                      className="nav-dropdown-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                        <Palette size={18} />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Aesthetic</span>
                      </div>
                      <div style={{ 
                        width: '36px', height: '18px', background: aestheticOn ? '#FF0055' : 'rgba(255,255,255,0.1)',
                        borderRadius: '20px', position: 'relative', transition: 'all 0.3s'
                      }}>
                        <motion.div 
                          animate={{ x: aestheticOn ? 18 : 2 }}
                          initial={false}
                          style={{
                            position: 'absolute', top: '2px', width: '14px', height: '14px',
                            background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px -24px' }} />

                    <div 
                      onClick={() => setShowLogoutConfirm(true)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,255,255,0.4)',
                        marginTop: '4px'
                      }}
                      className="nav-dropdown-item logout-hover"
                    >
                      <LogOut size={18} />
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Log Out</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <style>{`
          .nav-dropdown-item:hover { background: rgba(255,255,255,0.03); color: #fff !important; }
          .logout-hover:hover { color: #FF0055 !important; background: rgba(255,0,85,0.05); }
          @keyframes pulse-streak {
            0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
          }
        `}</style>
      </nav>

      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutModal onConfirm={logoutUser} onCancel={() => setShowLogoutConfirm(false)} />
        )}
      </AnimatePresence>

      <BotPanel isOpen={showBotPanel} onClose={() => setShowBotPanel(false)} currentRoomId={currentRoomId} />
    </>
  );
};

const MenuLink = ({ icon: Icon, label, to }) => (
  <Link 
    to={to} 
    style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
      borderRadius: '12px', textDecoration: 'none', color: 'rgba(255,255,255,0.7)', 
      fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s' 
    }}
    className="nav-dropdown-item"
  >
    <Icon size={18} opacity={0.6} />
    {label}
  </Link>
);

export default Navbar;
