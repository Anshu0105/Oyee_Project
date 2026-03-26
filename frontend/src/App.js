import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import LiveDeclaration from './components/Layout/LiveDeclaration';
import CustomCursor from './components/Common/CustomCursor';
import Packman from './components/Common/Packman';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import ChatRoom from './pages/ChatRoom';
import Message from './pages/Message';
import { useUser } from './context/UserContext';
import './App.css';

function App() {
  const { user } = useUser();

  return (
    <Router>
      <div className="App">
        <CustomCursor />
        <Packman mood={user.mood} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <>
              <Navbar />
              <LiveDeclaration />
              <Routes>
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/room/:id" element={<ChatRoom />} />
                <Route path="/messages" element={<Message />} />
                <Route path="/profile" element={<div>Profile (Coming Soon)</div>} />
                <Route path="/leaderboard" element={<div>Leaderboard (Coming Soon)</div>} />
                <Route path="/store" element={<div>Store (Coming Soon)</div>} />
                <Route path="/" element={<Navigate to="/rooms" />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;