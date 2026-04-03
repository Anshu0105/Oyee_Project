import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FastForward, Key, Users, ArrowLeft, Loader2, CheckCircle, Copy, Hash, Lock, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BACKEND_URL } from '../config';

const PrivateHub = () => {
    const navigate = useNavigate();
    const { token } = useUser();
    const [mode, setMode] = useState('selection'); // selection, create, join, success
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdRoom, setCreatedRoom] = useState(null);

    const handleCreate = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/rooms/create-with-code`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: `PRIVATE HUB ${Math.floor(1000 + Math.random() * 9000)}` })
            });
            const data = await res.json();
            if (data.success) {
                setRoomCode(data.room.roomCode);
                setCreatedRoom(data.room);
                setMode('success');
            } else {
                setMode('selection');
                setError(data.error || 'Initialization failed.');
            }
        } catch (err) {
            setMode('selection');
            setError('Connection failure. Sector unreachable.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (mode === 'create') {
            handleCreate();
        }
    }, [mode, handleCreate]);

    const handleJoin = async (forceCode = null) => {
        const codeToJoin = forceCode || inputCode;
        if (codeToJoin.length !== 4) return;
        
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/rooms/join-with-code`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: codeToJoin })
            });
            const data = await res.json();
            if (data.success) {
                navigate(`/room/${data.room._id}`);
            } else {
                setInputCode('');
                setError(data.error || 'Access denied. Invalid code.');
            }
        } catch (err) {
            setError('Synchronization failure.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeypadPress = (num) => {
        if (inputCode.length < 4) {
            const newCode = inputCode + num;
            setInputCode(newCode);
            if (newCode.length === 4) {
                handleJoin(newCode);
            }
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomCode);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050506',
            color: '#e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-inter)'
        }}>
            {/* Immersive Digital Grid Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <svg width="100%" height="100%" style={{ opacity: 0.15 }}>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                
                {/* Moving Pulse Rings */}
                <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '400px', height: '400px', border: '1px solid var(--accent-primary)', borderRadius: '50%'
                    }}
                />
                 <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1.5, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '600px', height: '600px', border: '1px solid var(--accent-primary)', borderRadius: '50%'
                    }}
                />
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: '100%', maxWidth: '480px', padding: '40px', zIndex: 10 }}
            >
                <AnimatePresence mode="wait">
                    {mode === 'selection' && (
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 40px' }}>
                                <Shield size={80} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 20px rgba(var(--accent-rgb), 0.4))' }} />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                    style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, border: '2px dashed var(--accent-primary)', borderRadius: '50%', opacity: 0.3 }}
                                />
                            </div>
                            
                            <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '4.5rem', letterSpacing: '8px', lineHeight: 1, marginBottom: '8px' }}>PRIVATE HUB</h1>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '48px', color: 'var(--accent-primary)', opacity: 0.6, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                                <Lock size={12} />
                                <span>END_TO_END_ENCRYPTED_VOV_PROTOCOL</span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setMode('create')}
                                    style={{ 
                                        padding: '24px', background: 'var(--accent-primary)', border: 'none', color: '#fff', borderRadius: '16px',
                                        fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '2px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                    }}
                                >
                                    <Zap size={20} /> INITIALIZE HUB
                                </motion.button>
                                
                                <motion.button 
                                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setMode('join')}
                                    style={{ 
                                        padding: '24px', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '16px',
                                        fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', letterSpacing: '2px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                    }}
                                >
                                    <Hash size={20} /> INFILTRATE
                                </motion.button>
                            </div>

                            <button 
                                onClick={() => navigate('/rooms')}
                                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '40px', cursor: 'pointer', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px', margin: '40px auto 0' }}
                            >
                                <ArrowLeft size={14} /> TERMINATE_SESSION
                            </button>
                        </motion.div>
                    )}

                    {mode === 'create' && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <Loader2 className="spin" size={64} color="var(--accent-primary)" style={{ margin: '0 auto 32px' }} />
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px' }}>GENERATING_SECTOR_KEY</h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', opacity: 0.6 }}>// SYNCHRONIZING WITH VOID CLUSTER...</p>
                        </motion.div>
                    )}

                    {mode === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ marginBottom: '32px' }}>
                                <CheckCircle size={48} color="#48bb78" style={{ margin: '0 auto 16px' }} />
                                <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px' }}>ACCESS GRANTED</h2>
                            </div>
                            
                            <div style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '2px solid var(--accent-primary)', 
                                padding: '40px 20px', 
                                borderRadius: '24px',
                                marginBottom: '48px',
                                position: 'relative',
                                boxShadow: '0 0 30px rgba(var(--accent-rgb), 0.2)'
                            }}>
                                <motion.div 
                                    animate={{ opacity: [1, 0.7, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: '6rem', 
                                        letterSpacing: '15px', 
                                        color: 'var(--accent-primary)',
                                        textShadow: '0 0 20px var(--accent-primary)'
                                    }}
                                >
                                    {roomCode}
                                </motion.div>
                                <button 
                                    onClick={copyToClipboard}
                                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <Copy size={20} />
                                </button>
                                <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#050506', padding: '0 12px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                    SECURE_FRQ_LOCKED
                                </div>
                            </div>

                            <button 
                                className="neural-button"
                                onClick={() => navigate(`/room/${createdRoom._id}`)}
                                style={{ width: '100%', padding: '24px', fontSize: '1.4rem' }}
                            >
                                ENTER SECTOR
                            </button>
                        </motion.div>
                    )}

                    {mode === 'join' && (
                        <motion.div 
                            key="join"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ textAlign: 'center' }}
                        >
                             <div onClick={() => setMode('selection')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '32px', width: 'fit-content' }}>
                                <ArrowLeft size={16} /> <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>BACK</span>
                            </div>
                            
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '8px' }}>INFILTRATE</h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginBottom: '40px' }}>// ENTER_4-DIGIT_SYNC_CODE</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px' }}>
                                {[0, 1, 2, 3].map((idx) => (
                                    <div key={idx} style={{ 
                                        width: '60px', height: '80px', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: `2px solid ${inputCode[idx] ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)', fontSize: '2.5rem',
                                        color: 'var(--accent-primary)',
                                        boxShadow: inputCode[idx] ? '0 0 15px rgba(var(--accent-rgb), 0.2)' : 'none'
                                    }}>
                                        {inputCode[idx] || ''}
                                    </div>
                                ))}
                            </div>

                            {error && <p style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginBottom: '24px' }}>{error}</p>}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0, 'OK'].map((btn) => (
                                    <motion.button
                                        key={btn}
                                        whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            if (btn === 'DEL') setInputCode(inputCode.slice(0, -1));
                                            else if (btn === 'OK') handleJoin();
                                            else if (typeof btn === 'number') handleKeypadPress(btn.toString());
                                        }}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                                            color: '#fff', height: '60px', borderRadius: '12px',
                                            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1.2rem'
                                        }}
                                    >
                                        {btn}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default PrivateHub;
