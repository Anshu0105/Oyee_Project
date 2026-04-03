import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import LiveDeclaration from './components/Layout/LiveDeclaration';
import CustomCursor from './components/Common/CustomCursor';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Rooms from './pages/Rooms';
import ChatRoom from './pages/ChatRoom';
import Message from './pages/Message';
import AuraStore from './pages/AuraStore';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { useUser } from './context/UserContext';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <>
              <Navbar />
              <LiveDeclaration />
              <Routes>
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/room/:id" element={<ChatRoom />} />
                <Route path="/messages" element={<Message />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/store" element={<AuraStore />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;