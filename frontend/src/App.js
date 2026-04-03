import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import LiveDeclaration from './components/Layout/LiveDeclaration';
import CustomCursor from './components/Common/CustomCursor';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Login from './pages/Login'; // legacy, kept for redirect
import Rooms from './pages/Rooms';
import ChatRoom from './pages/ChatRoom';
import Message from './pages/Message';
import AuraStore from './pages/AuraStore';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { useUser } from './context/UserContext';
import './App.css';

// Protected route — redirects to /auth if no token
const ProtectedRoute = ({ children }) => {
  const { token } = useUser();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

// App shell with navbar (only for authenticated/inner pages)
const AppShell = ({ children }) => (
  <>
    <Navbar />
    <LiveDeclaration />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <CustomCursor />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />

          {/* Protected routes */}
          <Route path="/rooms" element={
            <ProtectedRoute>
              <AppShell><Rooms /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/room/:id" element={
            <ProtectedRoute>
              <AppShell><ChatRoom /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <AppShell><Message /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppShell><Profile /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <AppShell><Leaderboard /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/store" element={
            <ProtectedRoute>
              <AppShell><AuraStore /></AppShell>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;