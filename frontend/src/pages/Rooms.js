import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, GraduationCap, MapPin, MessageSquare, UserSquare2 } from 'lucide-react';

const RoomCard = ({ icon: Icon, title, desc, badge, online, onClick }) => (
  <div className="glass interactive hover-lift" onClick={onClick} style={{
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid var(--glass-border)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ color: 'var(--accent-primary)' }}><Icon size={40} /></div>
    <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', letterSpacing: '2px' }}>{title}</h3>
    <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.6' }}>{desc}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
      <span style={{ 
        fontSize: '0.7rem', padding: '4px 10px', background: 'var(--glass-border)', borderRadius: '4px', letterSpacing: '1px' 
      }}>{badge}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>● {online} online</span>
    </div>
  </div>
);

const Rooms = () => {
  const navigate = useNavigate();

  const rooms = [
    { id: 'wifi', title: 'WIFI ROOM', icon: Wifi, desc: 'Connect with everyone on the same local network. Same router = same room.', badge: 'AUTO-DETECT', online: 42 },
    { id: 'uni', title: 'UNIVERSITY ROOM', icon: GraduationCap, desc: 'Exclusive to your institution. Verified via university mail domain.', badge: 'MAIL VERIFIED', online: 189 },
    { id: 'nearby', title: 'NEARBY ROOMS', icon: MapPin, desc: 'Discover chat rooms within your physical radius. GPS locked.', badge: 'GPS BASED', online: 23 },
    { id: 'dm', title: 'DM', icon: MessageSquare, desc: 'Direct anonymous messages. Connect with your campus peers privately.', badge: 'PRIVATE CHAT', online: 'Active' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '3rem', letterSpacing: '4px' }}>JOIN A ROOM</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.6 }}>// select your entry point into the void</p>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-primary)', marginTop: '16px' }} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {rooms.map(room => (
          <RoomCard key={room.id} {...room} onClick={() => navigate(`/room/${room.id}`)} />
        ))}
      </div>
    </div>
  );
};

export default Rooms;
