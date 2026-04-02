import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import LiveDeclaration from './components/Layout/LiveDeclaration';
import CustomCursor from './components/Common/CustomCursor';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import ChatRoom from './pages/ChatRoom';
import Message from './pages/Message';
import AuraStore from './pages/AuraStore';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <CustomCursor />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <>
              <Navbar />
              <LiveDeclaration />
              <Routes>
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/room/:id" element={<ChatRoom />} />
                <Route path="/chat/:id" element={<ChatRoom />} />
                <Route path="/messages" element={<Message />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/store" element={<AuraStore />} />
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;