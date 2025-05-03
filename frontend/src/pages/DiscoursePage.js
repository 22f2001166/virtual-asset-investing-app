import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const DiscoursePage = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const token = sessionStorage.getItem('token');

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/discourse');
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const postMessage = async () => {
    if (!newMsg) return;
    try {
      await axios.post(
        'http://localhost:5000/api/discourse',
        { message: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg('');
      fetchMessages();
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="dashboard-background px-3 py-4">
      <div className="welcome-div text-center mb-4">
        <h3 className="text-white">📢 Discourse Board</h3>
      </div>

      
      <div className="d-flex justify-content-center mb-4 text-center">
        <div className="dashboard-card w-100" style={{ maxWidth: '800px' }}>
          <textarea
            className="form-control mb-3"
            rows="3"
            placeholder="Type your message here..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{ resize: 'none', borderRadius: '12px' }}
          />
          <button className="btn btn-primary w-50" onClick={postMessage}>
            Post Message
          </button>
        </div>
      </div>

      <div className="container d-flex justify-content-center">
        <div
          className="dashboard-card w-100"
          style={{
            maxWidth: '800px',
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          {messages.length === 0 ? (
            <p className="text-white text-center">No messages yet.</p>
          ) : (
            <ul className="list-unstyled">
              {messages.map((msg) => (
                <li
                  key={msg._id}
                  className="p-3 mb-2 rounded"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderLeft: '4px solid #007bff',
                  }}
                >
                  <strong className="text-white">{msg.createdBy?.username || 'Admin'}</strong>
                  <p className="text-white mb-1">{msg.message}</p>
                  <small className="text-white">{new Date(msg.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoursePage;
