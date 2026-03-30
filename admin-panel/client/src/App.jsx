import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import Messages from './pages/Messages';
import Moderation from './pages/Moderation';
import Leaderboard from './pages/Leaderboard';
import Store from './pages/Store';
import AuraLog from './pages/AuraLog';
import Broadcast from './pages/Broadcast';
import Settings from './pages/Settings';

function ProtectedLayout({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
        <Route path="/rooms" element={<ProtectedLayout><Rooms /></ProtectedLayout>} />
        <Route path="/messages" element={<ProtectedLayout><Messages /></ProtectedLayout>} />
        <Route path="/moderation" element={<ProtectedLayout><Moderation /></ProtectedLayout>} />
        <Route path="/leaderboard" element={<ProtectedLayout><Leaderboard /></ProtectedLayout>} />
        <Route path="/store" element={<ProtectedLayout><Store /></ProtectedLayout>} />
        <Route path="/aura-log" element={<ProtectedLayout><AuraLog /></ProtectedLayout>} />
        <Route path="/broadcast" element={<ProtectedLayout><Broadcast /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
