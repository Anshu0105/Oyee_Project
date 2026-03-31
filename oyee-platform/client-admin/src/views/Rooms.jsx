import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/room/${roomId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRooms();
    } catch (err) {
      alert('Error updating room status');
    }
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/room/${roomId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRooms();
    } catch (err) {
      alert('Error deleting room');
    }
  };

  const openChatModal = async (roomId) => {
    setSelectedRoomId(roomId);
    fetchMessages(roomId);
  };

  const closeChatModal = () => {
    setSelectedRoomId(null);
    setRoomMessages([]);
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRoomMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/message/${msgId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMessages(selectedRoomId);
    } catch (err) {
      alert('Error deleting message');
    }
  };

  return (
    <div className="panel" id="panel-rooms">
      <div className="ph">
        <div className="ph-left">
          <div className="ph-title">ROOM <span>CONTROL</span></div>
          <div className="ph-sub">// monitor, lock, delete rooms</div>
          <div className="ph-line"></div>
        </div>
        <div className="ph-actions">
          <button className="btn s sm">+ CREATE ROOM</button>
        </div>
      </div>
      <div className="card">
        <table className="dt">
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Type</th>
              <th>Active Users</th>
              <th>Status</th>
              <th>Violations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px', color: 'var(--ink4)'}}>No rooms available.</td></tr>
            ) : rooms.map(room => (
              <tr key={room._id}>
                <td style={{fontWeight: 700}}>{room.name}</td>
                <td>
                  <span className={`badge ${room.type === 'WiFi' ? 'b' : room.type === 'University' ? 'pu' : 'g'}`}>
                    {room.type}
                  </span>
                </td>
                <td style={{fontFamily: 'var(--fh)', fontSize: '20px', color: 'var(--red)'}}>{room.activeUsers}</td>
                <td>
                  <span className={`badge ${room.status === 'Live' ? 'g' : room.status === 'Moderated' ? 'a' : 'gr'}`}>
                    {room.status}
                  </span>
                </td>
                <td style={{fontFamily: 'var(--fh)', fontSize: '18px', color: room.violations > 0 ? 'var(--red)' : 'var(--green)'}}>
                  {room.violations}
                </td>
                <td style={{display: 'flex', gap: '5px', padding: '12px 14px'}}>
                  {room.status === 'Live' && (
                    <button className="btn xs d" onClick={() => updateRoomStatus(room._id, 'Moderated')}>LOCK</button>
                  )}
                  {room.status === 'Moderated' && (
                    <button className="btn xs" onClick={() => updateRoomStatus(room._id, 'Live')}>UNLOCK</button>
                  )}
                  <button className="btn xs" onClick={() => deleteRoom(room._id)}>DELETE</button>
                  <button className="btn xs b" onClick={() => openChatModal(room._id)}>CHAT</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRoomId && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <div className="ct" style={{marginBottom: 0}}>ROOM CHAT LOGS</div>
              <button className="btn xs r" onClick={closeChatModal}>Close</button>
            </div>
            <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px'}}>
              {roomMessages.length === 0 ? <div className="cs">No messages found.</div> : roomMessages.map(msg => (
                <div key={msg._id} style={{background: 'var(--bg2)', padding: '10px', display: 'flex', justifyContent: 'space-between', borderLeft: '3px solid var(--blue)'}}>
                  <div>
                    <div style={{fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--blue)'}}>{msg.user?.username || 'System'}</div>
                    <div style={{fontSize: '14px', marginTop: '4px'}}>{msg.content}</div>
                    <div className="cs" style={{fontSize: '10px', marginTop: '6px'}}>{new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                  <button className="btn xs r" onClick={() => deleteMessage(msg._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;