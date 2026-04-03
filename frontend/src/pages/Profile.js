import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { User, Shield, Info, Trash2, Palette, Sparkles, LogOut, Check, X, CreditCard, Users, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeFetch } from '../config';

const Dashboard = () => {
    const { user, token, updateProfile, deleteAccount, logoutUser } = useUser();
    const { theme: currentTheme, setTheme } = useTheme();
    
    const [socialData, setSocialData] = useState({ friends: [], enemies: [] });
    const [activeTab, setActiveTab] = useState('friends');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const themes = [
        { id: 'wine', name: 'Wine Purple', color: '#FF0055' },
        { id: 'blue', name: 'Crown Blue', color: '#00D4FF' },
        { id: 'green', name: 'Neon Green', color: '#39FF14' },
        { id: 'gold', name: 'Dazzling Gold', color: '#FFD700' },
        { id: 'orange', name: 'Cyber Orange', color: '#FF8C00' }
    ];

    const emojis = ['🥭', '🍜', '🌮', '🍔', '🍕', '🍣', '🍩', '🥓', '🧇', '🥞', '🥨', '🥑', '🥟', '🥪', '🥘', '🍲'];

    useEffect(() => {
        fetchSocial();
    }, []);

    const fetchSocial = async () => {
        try {
            const data = await safeFetch('/api/users/me/social', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSocialData(data);
        } catch (err) { console.error(err); }
    };

    const handleAvatarChange = async (emoji) => {
        await updateProfile({ avatarEmoji: emoji });
    };

    const handleThemeChange = async (themeId) => {
        setTheme(themeId);
        await updateProfile({ theme: themeId });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await deleteAccount(deletePassword);
        } catch (err) {
            setError(err.message || 'Verification failed');
            setIsDeleting(false);
        }
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div className="scroll-container" style={{
            background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-inter)',
            padding: isMobile ? '20px 16px' : '40px 20px', display: 'flex', justifyContent: 'center'
        }}>
            <div style={{ 
                maxWidth: '1200px', width: '100%', 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1fr) 2fr', 
                gap: isMobile ? '24px' : '32px', 
                paddingBottom: '40px' 
            }}>
                
                {/* LEFT PANEL: IDENTITY CARD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-main)', textAlign: 'center', background: 'var(--bg-panel)' }}
                    >
                        <div style={{ 
                            width: isMobile ? '100px' : '120px', height: isMobile ? '100px' : '120px', margin: '0 auto 24px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: isMobile ? '3rem' : '4rem', border: '2px solid var(--accent-primary)',
                            boxShadow: '0 0 30px var(--glass-border)'
                        }}>
                            {user.avatarEmoji || '👤'}
                        </div>
                        
                        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: isMobile ? '2.2rem' : '2.5rem', letterSpacing: '2px', margin: '0 0 8px' }}>
                           {user.auraName || 'UNIDENTIFIED'}
                        </h2>
                        <div style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '32px' }}>
                            CLEARANCE: AGENT
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-main)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', opacity: 0.6 }}>
                                    <Sparkles size={16} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>TOTAL AURA</span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff' }}>{user.aura} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>pts</span></div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-main)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', opacity: 0.6 }}>
                                    <CreditCard size={16} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>SPENDABLE</span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{user.aura} <span style={{ fontSize: '0.9rem', color: '#fff', opacity: 0.5 }}>A</span></div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="interactive"
                            style={{ 
                                width: '100%', marginTop: '32px', padding: '16px', background: 'transparent',
                                border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '16px',
                                color: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >
                            <Trash2 size={18} />
                            Delete Identity
                        </button>
                    </motion.div>

                    {/* SOCIAL STATS MINI PANEL */}
                    <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-main)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-panel)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px' }}>FRIENDS</div>
                            <div style={{ fontWeight: '800' }}>{socialData.friends.length}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '4px' }}>ENEMIES</div>
                            <div style={{ fontWeight: '800' }}>{socialData.enemies.length}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: CUSTOMIZATION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass"
                        style={{ padding: '40px', borderRadius: '40px', border: '1px solid var(--border-main)', background: 'var(--bg-panel)' }}
                    >
                        <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Palette size={24} style={{ color: 'var(--accent-primary)' }} />
                            Identity customization
                        </h3>

                        {/* Theme Selection */}
                        <div style={{ marginBottom: '48px' }}>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px', letterSpacing: '1px' }}>ENVIRONMENT THEME</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {themes.map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => handleThemeChange(t.id)}
                                        style={{
                                            padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                                            border: currentTheme === t.id ? `2px solid ${t.color}` : '1px solid var(--border-main)',
                                            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }} />
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t.name}</span>
                                        {currentTheme === t.id && <Check size={14} style={{ marginLeft: 'auto', color: t.color }} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Avatar Selection */}
                        <div>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px', letterSpacing: '1px' }}>AVATAR FREQUENCY</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {emojis.map(e => (
                                    <button 
                                        key={e}
                                        onClick={() => handleAvatarChange(e)}
                                        style={{
                                            width: '60px', height: '60px', fontSize: '2rem', borderRadius: '16px',
                                            background: user.avatarEmoji === e ? 'var(--glass)' : 'rgba(255,255,255,0.02)',
                                            border: user.avatarEmoji === e ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* SOCIAL LIST PANEL */}
                    <div className="glass" style={{ padding: '40px', borderRadius: '40px', border: '1px solid var(--border-main)', background: 'var(--bg-panel)', flex: 1 }}>
                        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border-main)' }}>
                             <button onClick={() => setActiveTab('friends')} style={{ 
                                 padding: '0 0 16px', background: 'none', border: 'none', cursor: 'pointer',
                                 color: activeTab === 'friends' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                                 fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '1px',
                                 borderBottom: activeTab === 'friends' ? '3px solid var(--accent-primary)' : 'none'
                             }}>FRIENDS</button>
                             <button onClick={() => setActiveTab('enemies')} style={{ 
                                 padding: '0 0 16px', background: 'none', border: 'none', cursor: 'pointer',
                                 color: activeTab === 'enemies' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                                 fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '1px',
                                 borderBottom: activeTab === 'enemies' ? '3px solid var(--accent-primary)' : 'none'
                             }}>ENEMIES</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {socialData[activeTab].length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>
                                    <Ghost size={40} style={{ margin: '0 auto 16px' }} />
                                    <p>No peers discovered in this frequency.</p>
                                </div>
                            ) : socialData[activeTab].map(peer => (
                                <div key={peer._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                    background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid var(--border-main)'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{peer.avatarEmoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800' }}>{peer.auraName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700' }}>{peer.aura} pts</div>
                                    </div>
                                    {peer.equippedBadge && <div style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)' }}>{peer.equippedBadge}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* DELETE IDENTITY MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ 
                                maxWidth: '400px', width: '100%', background: 'var(--bg-panel)', 
                                border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '32px', padding: '40px',
                                textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ color: '#ff4d4d', marginBottom: '24px' }}>
                                <AlertTriangle size={48} style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', marginBottom: '12px' }}>Delete Identity</h2>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '32px' }}>
                                This will permanently delete your account, aura, friends, enemies, and all data from the Void. This action is irreversible.
                            </p>

                            <input 
                                type="password"
                                placeholder="Clearance Password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', marginBottom: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: error ? '1px solid #ff4d4d' : '1px solid var(--border-main)',
                                    borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            {error && <p style={{ color: '#ff4d4d', fontSize: '0.75rem', marginBottom: '20px' }}>{error}</p>}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={!deletePassword || isDeleting}
                                    style={{ 
                                        flex: 1, padding: '14px', borderRadius: '12px', background: '#ff4d4d', 
                                        border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer',
                                        opacity: isDeleting ? 0.5 : 1
                                    }}
                                >
                                    {isDeleting ? 'ERASING...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .glass { background: rgba(10,10,10,0.6); backdrop-filter: blur(20px); }
                .interactive:active { transform: scale(0.98); }
                .danger-btn:hover { background: rgba(255,77,77,0.05) !important; border-color: #ff4d4d !important; }
            `}</style>
        </div>
    );
};

const AlertTriangle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default Dashboard;
