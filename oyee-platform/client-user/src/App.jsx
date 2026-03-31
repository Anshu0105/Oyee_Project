import React from 'react';
import Rooms from './views/Rooms';

function App() {
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '1rem', color: 'white' }}>
      <h1 style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Oyee User Platform</h1>
      <Rooms />
    </div>
  );
}

export default App;