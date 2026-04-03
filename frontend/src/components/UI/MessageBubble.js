import React from 'react';
import { FileText, Download } from 'lucide-react';

const MessageBubble = ({ msg, isSent }) => {
  return (
    <div style={{ alignSelf: isSent ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start' }}>
      
      {msg.type === 'file' ? (
        <div className="glass" style={{
          padding: '16px', 
          background: isSent ? 'rgba(66, 153, 225, 0.1)' : 'rgba(255,255,255,0.05)', 
          border: `1px solid ${isSent ? '#4299e1' : 'var(--glass-border)'}`, 
          borderRadius: isSent ? '12px 0 12px 12px' : '0 12px 12px 12px', 
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ background: isSent ? '#4299e1' : 'var(--text-main)', color: '#000', padding: '12px', borderRadius: '8px' }}>
            <FileText size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', wordBreak: 'break-all' }}>{msg.fileName}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.7 }}>{msg.fileSize}</div>
          </div>
          <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
            <div style={{ background: 'transparent', border: '1px solid currentColor', padding: '8px', borderRadius: '50%', cursor: 'pointer', opacity: 0.8 }} className="hover-lift">
              <Download size={18} />
            </div>
          </a>
        </div>
      ) : (
        <div style={{ 
          padding: '16px 20px', 
          background: isSent ? 'rgba(233, 30, 99, 0.1)' : 'transparent', 
          border: '1px solid var(--glass-border)',
          color: 'var(--text-main)', fontFamily: 'var(--font-inter)', fontSize: '0.95rem', lineHeight: '1.5',
          borderRadius: isSent ? '12px 0 12px 12px' : '0 12px 12px 12px',
          wordBreak: 'break-word'
        }}>
          {msg.content}
        </div>
      )}
      
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '6px' }}>
        {new Date(msg.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageBubble;
