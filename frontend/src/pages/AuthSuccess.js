import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { safeFetch } from '../config';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/auth?error=OAuth_Signal_Lost');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const data = await safeFetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Store token in localStorage via Context logic
        loginUser({
            token,
            user: {
                ...data,
                auraPoints: data.auraPoints || 0
            }
        });

        navigate('/rooms');
      } catch (err) {
        console.error('OAuth manifest failure:', err);
        navigate('/auth?error=Identity_Rejection');
      }
    };

    fetchUserProfile();
  }, [location, navigate, loginUser]);

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#0a0a0a', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff'
    }}>
      <Loader2 size={48} className="spin" style={{ color: '#e91e63', marginBottom: '24px' }} />
      <h2 style={{ letterSpacing: '4px', fontWeight: '900', textTransform: 'uppercase' }}>Manifesting Identity...</h2>
      <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '12px' }}>Connecting to the Void Frequency</p>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuthSuccess;
