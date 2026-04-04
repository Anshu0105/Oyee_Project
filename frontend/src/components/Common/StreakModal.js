import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eachDayOfInterval, format, startOfYear, endOfYear, subYears, isSameMonth, startOfMonth } from 'date-fns';
import { X, Flame, Zap, Calendar, Info } from 'lucide-react';

const StreakCalendar = ({ data }) => {
  const end = new Date();
  const start = subYears(end, 1);
  const days = eachDayOfInterval({ start, end });

  const dataMap = {};
  data.forEach(d => {
    dataMap[d.date] = d.count;
  });

  const getColor = (count) => {
    if (!count) return 'rgba(255, 255, 255, 0.05)';
    if (count < 3) return '#0e4429';
    if (count < 6) return '#006d32';
    if (count < 10) return '#26a641';
    return '#39d353';
  };

  const getGlow = (count) => {
    if (count >= 10) return '0 0 10px rgba(57, 211, 83, 0.4)';
    return 'none';
  };

  // Group by months for labels
  const months = [];
  days.forEach(day => {
    if (day.getDate() === 1 || day === days[0]) {
        const m = format(day, 'MMM');
        if (!months.find(x => x.name === m)) months.push({ name: m, index: days.indexOf(day) });
    }
  });

  return (
    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '0.7rem', opacity: 0.5, paddingLeft: '14px' }}>
         {months.map((m, i) => <span key={i}>{m.name}</span>)}
      </div>
      <div style={{ 
          display: 'grid', 
          gridTemplateRows: 'repeat(7, 1fr)', 
          gridAutoFlow: 'column',
          gap: '4px',
          height: '110px'
      }}>
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const count = dataMap[key] || 0;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.001 }}
              title={`${key}: ${count} activity`}
              style={{
                width: '11px',
                height: '11px',
                backgroundColor: getColor(count),
                borderRadius: '2px',
                boxShadow: getGlow(count),
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.4, zIndex: 10 }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', fontSize: '0.65rem', opacity: 0.5 }}>
         <span>Less</span>
         {[0, 2, 5, 8, 12].map(c => (
             <div key={c} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getColor(c) }} />
         ))}
         <span>More</span>
      </div>
    </div>
  );
};

export const StreakModal = ({ isOpen, onClose, data, userStats }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '850px', background: '#111',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px',
              padding: '40px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                   <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.5rem', letterSpacing: '2px', marginBottom: '8px' }}>ACTIVITY FREQUENCY</h2>
                   <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Visualizing your neural activity within the Void.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--streak-orange)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Flame size={40} fill="currentColor" />
                        {userStats.streak || 0}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px' }}>CURRENT STREAK</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <StatCard icon={Zap} label="TOTAL ACTIONS" value={data.reduce((a, b) => a + b.count, 0)} color="#39d353" />
                <StatCard icon={Calendar} label="ACTIVE DAYS" value={data.filter(d => d.count > 0).length} color="#00D4FF" />
                <StatCard icon={Info} label="AVERAGE DAILY" value={(data.reduce((a, b) => a + b.count, 0) / (data.length || 1)).toFixed(1)} color="#FF0055" />
            </div>

            <StreakCalendar data={data} />

            <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                <strong style={{ color: '#fff' }}>Neural Tip:</strong> Consistency increases your Aura visibility in the collective. Every message sent reinforces your identity persistence.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: 0.5 }}>
            <Icon size={14} color={color} />
            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>{value}</div>
    </div>
);
