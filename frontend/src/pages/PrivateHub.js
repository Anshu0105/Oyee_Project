import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FastForward, Key, Users, ArrowLeft, Loader2, CheckCircle, Copy } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BACKEND_URL } from '../config';

const PrivateHub = () => {
    const navigate = useNavigate();
    const { token } = useUser();
    const [mode, setMode] = useState('selection'); // selection, create, join, success
    const [hubName, setHubName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdRoom, setCreatedRoom] = useState(null);

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/rooms/create-with-code`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: hubName })
            });
            const data = await res.json();
            if (data.success) {
                setRoomCode(data.room.roomCode);
                setCreatedRoom(data.room);
                setMode('success');
            } else {
                setError(data.error || 'Initialization failed.');
            }
        } catch (err) {
            setError('Connection failure. Sector unreachable.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (inputCode.length !== 4) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/rooms/join-with-code`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: inputCode })
            });
            const data = await res.json();
            if (data.success) {
                navigate(`/room/${data.room._id}`);
            } else {
                setError(data.error || 'Access denied. Invalid code.');
            }
        } catch (err) {
            setError('Synchronization failure.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomCode);
        // Visual feedback could be added here
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0b',
            color: '#e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-inter)'
        }}>
            {/* Background HUD Elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '1px', background: 'var(--accent-primary)', position: 'absolute', top: '20%' }} />
                <div style={{ width: '100%', height: '1px', background: 'var(--accent-primary)', position: 'absolute', top: '50%' }} />
                <div style={{ width: '100%', height: '1px', background: 'var(--accent-primary)', position: 'absolute', top: '80%' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '40px',
                    zIndex: 10
                }}
            >
                <AnimatePresence mode="wait">
                    {mode === 'selection' && (
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ textAlign: 'center' }}
                        >
                            <Shield size={64} color="var(--accent-primary)" style={{ marginBottom: '24px', opacity: 0.8 }} />
                            <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3.5rem', letterSpacing: '4px', marginBottom: '12px' }}>PRIVATE HUB</h1>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '40px' }}>// SECURE_COMMUNICATION_PROTOCOL_v2.0</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <button 
                                    className="neural-button"
                                    onClick={() => setMode('create')}
                                    style={{ padding: '20px', fontSize: '1.1rem' }}
                                >
                                    <FastForward size={20} /> INITIALIZE NEW HUB
                                </button>
                                <button 
                                    className="glass interactive"
                                    onClick={() => setMode('join')}
                                    style={{ padding: '20px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '12px' }}
                                >
                                    <Key size={20} /> INFILTRATE EXISTING
                                </button>
                                <button 
                                    onClick={() => navigate('/rooms')}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '20px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                                >
                                    BACK_TO_TERMINAL
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'create' && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div onClick={() => setMode('selection')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '32px' }}>
                                <ArrowLeft size={16} /> <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>GO BACK</span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', marginBottom: '8px' }}>INITIALIZE HUB</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '32px' }}>Define the sector identity for your private frequency.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', opacity: 0.8 }}>HUB_NAME</label>
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="Sector-Alpha-9"
                                    value={hubName}
                                    onChange={(e) => setHubName(e.target.value)}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid var(--glass-border)', 
                                        padding: '16px', 
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1.2rem',
                                        outline: 'none'
                                    }}
                                />
                                {error && <p style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
                                <button 
                                    className="neural-button"
                                    disabled={loading}
                                    onClick={handleCreate}
                                    style={{ marginTop: '24px', padding: '16px' }}
                                >
                                    {loading ? <Loader2 className="spin" size={20} /> : 'GENERATE_4-DIGIT_CODE'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <CheckCircle size={56} color="var(--accent-green)" style={{ marginBottom: '24px' }} />
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.8rem', marginBottom: '8px' }}>HUB INITIALIZED</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '40px' }}>Your private frequency is now active. Share this code.</p>
                            
                            <div style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid var(--glass-border)', 
                                padding: '32px', 
                                borderRadius: '24px',
                                marginBottom: '40px',
                                position: 'relative'
                            }}>
                                <div style={{ 
                                    fontFamily: 'var(--font-mono)', 
                                    fontSize: '5rem', 
                                    letterSpacing: '12px', 
                                    color: 'var(--accent-primary)',
                                    textShadow: '0 0 30px rgba(233, 30, 99, 0.3)'
                                }}>
                                    {roomCode}
                                </div>
                                <button 
                                    onClick={copyToClipboard}
                                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                                >
                                    <Copy size={16} />
                                </button>
                            </div>

                            <button 
                                className="neural-button"
                                onClick={() => navigate(`/room/${createdRoom._id}`)}
                                style={{ width: '100%', padding: '20px' }}
                            >
                                ENTER THE VOID
                            </button>
                        </motion.div>
                    )}

                    {mode === 'join' && (
                        <motion.div 
                            key="join"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div onClick={() => setMode('selection')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '32px' }}>
                                <ArrowLeft size={16} /> <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>GO BACK</span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', marginBottom: '8px' }}>INFILTRATE HUB</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '32px' }}>Synchronize with a private Sector using a 4-digit code.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input 
                                        autoFocus
                                        type="text"
                                        maxLength={4}
                                        placeholder="0000"
                                        value={inputCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setInputCode(val);
                                            if (val.length === 4) {
                                                // Automatic join could be triggered here
                                            }
                                        }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid var(--glass-border)', 
                                            padding: '24px', 
                                            borderRadius: '16px',
                                            color: 'var(--accent-primary)',
                                            fontSize: '3rem',
                                            fontFamily: 'var(--font-mono)',
                                            textAlign: 'center',
                                            letterSpacing: '10px',
                                            width: '240px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                {error && <p style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '12px' }}>{error}</p>}
                                <button 
                                    className="neural-button"
                                    disabled={loading || inputCode.length !== 4}
                                    onClick={handleJoin}
                                    style={{ marginTop: '32px', width: '100%', padding: '16px' }}
                                >
                                    {loading ? <Loader2 className="spin" size={20} /> : 'SYNCHRONIZE'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default PrivateHub;
