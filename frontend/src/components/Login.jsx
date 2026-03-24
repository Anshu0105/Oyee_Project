import React, { useState } from 'react';
import api from '../axios';
import { ShieldAlert, Zap, Lock, Globe } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required.');
    
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email });
      const { token, user } = response.data;
      
      localStorage.setItem('oyeee_token', token);
      localStorage.setItem('oyeee_user', JSON.stringify(user));
      
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enter the void.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-discord-dark transition-colors duration-300 font-sans">
      {/* Left Side - Brand & Info */}
      <div className="flex-1 bg-gray-50 dark:bg-discord-darker flex flex-col justify-center px-8 md:px-16 py-12 md:py-20 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 max-w-2xl mx-auto w-full">
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 select-none">
            OYEE<span className="text-discord-brand">.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-mono tracking-widest uppercase mb-12 border-l-4 border-discord-brand pl-4">
            // open · anonymous · zero-identity
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-white dark:bg-discord-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform">
              <Zap className="w-8 h-8 text-discord-brand mb-3" />
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">Real-time</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Lightning fast websockets</div>
            </div>
            <div className="bg-white dark:bg-discord-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform">
              <Lock className="w-8 h-8 text-discord-brand mb-3" />
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">Anonymous</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">No real names, no links</div>
            </div>
            <div className="bg-white dark:bg-discord-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform">
              <Globe className="w-8 h-8 text-discord-brand mb-3" />
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">Local & Uni</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Proximity & Domain rooms</div>
            </div>
            <div className="bg-white dark:bg-discord-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform">
              <ShieldAlert className="w-8 h-8 text-discord-brand mb-3" />
              <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">Aura System</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Upvote messages to gain tier</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-discord-dark p-6 rounded-xl border border-discord-brand/20 dark:border-discord-brand/20 shadow-sm border-l-4 border-l-discord-brand">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">About OYEE</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              A radically open anonymous platform. Connect via university Wi-Fi, campus email, or by proximity. Your identity is randomly generated as a food name. Your worth is determined by your peers through Aura. Every message is a mystery.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-[480px] lg:w-[540px] flex flex-col justify-center px-8 sm:px-12 py-16 bg-white dark:bg-discord-gray shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-wide uppercase">Enter The Void</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">One door. Infinite anonymity.</p>
          </div>
          
          {error && <div className="mb-6 text-red-500 text-sm p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-2">University / Personal Mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-discord-darker border border-gray-300 dark:border-discord-dark rounded-lg px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-discord-brand focus:border-transparent transition-all font-medium"
                placeholder="you@university.edu"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-discord-brand hover:bg-discord-brand_hover text-white font-black text-lg py-4 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 tracking-widest shadow-lg shadow-discord-brand/20 active:scale-[0.98]"
            >
              {loading ? 'ENTERING...' : 'JOIN THE VOID'}
            </button>
          </form>
          
          <div className="mt-10 flex items-center justify-center">
             <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
             <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rules</span>
             <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            No phone numbers · No real names · No links.<br/>
            Any violation guarantees a permanent ban.<br/>
            Your identity is a food. Your secrets are safe.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
