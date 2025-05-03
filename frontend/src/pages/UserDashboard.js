import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './UserDashboard.css'; // your custom styles

const UserDashboard = () => {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [avatar, setAvatar] = useState(null); // Store avatar here
  const [notifications, setNotifications] = useState([]);
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(res.data);
        // Mark them as read once fetched
        if (res.data.length > 0) {
          await axios.patch(
            'http://localhost:5000/api/notifications/mark-read',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsername(res.data.username || 'User');
        setAvatar(res.data.avatar); // Set avatar from user data
      } catch (err) {
        setError('Access Denied or Session Expired');
        console.error('User fetch error:', err);
      }
    };

    const fetchCards = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/cards');
        setCards(res.data);
      } catch (err) {
        console.error('Error fetching cards:', err);
      }
    };

    fetchNotifications();
    fetchUserData();
    fetchCards();
  }, []);

  const handleBuy = async (cardId) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/assets/buy/${cardId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let message = `Purchase successful! Remaining Coins: ${res.data.newCoins}`;
      if (res.data.firstPurchaseBonus) {
        message += `\n${res.data.firstPurchaseBonus}`;
      }
      const purchasedCard = res.data.card;
      if (purchasedCard && (purchasedCard.name.includes('Yacht') || purchasedCard.name.includes('Ship'))) {
        message += `\nYou will receive your real card soon!`;
      }
      alert(message);
      window.location.reload(); // or update coins state manually
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortOption) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'price':
        return parseFloat(b.coins) - parseFloat(a.coins);
      case 'amount':
        return parseFloat(b.amount) - parseFloat(a.amount);
      default:
        return 0;
    }
  });

  return (
    <div className="dashboard-background px-3 py-4">
      <div className="welcome-div mb-4 text-center">
      {error ? (
          <h4 className="text-danger">{error}</h4>
        ) : username !== null ? (
          <h4 className="text-white">
            Hello, {username}
            {avatar && <span className="ms-2 fs-3">{avatar}</span>} {/* Display Avatar */}
          </h4>
        ) : null }

      {notifications.length > 0 && (
        <div className="alert alert-success text-start mx-auto" style={{ maxWidth: '500px' }}>
          {notifications.map((note, i) => (
            <div key={i}>
              {note.message}
            </div>
          ))}
        </div>
      )}
      </div>

      <div className="d-flex justify-content-center mb-4">
        <select
          className="form-select w-auto"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">-- Sort By --</option>
          <option value="alphabetical">Alphabetical Order</option>
          <option value="price">Coins (Price)</option>
          <option value="amount">Amount Owned</option>
        </select>
      </div>

      <div className="container mt-4 px-1 px-lg-5">
        <div className="row">
          {sortedCards.map((card, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <motion.div
                className="card h-100 shadow user-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img
                  src={`http://localhost:5000${card.image}`}
                  className="card-img-top"
                  alt={card.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{card.name}</h5>
                  <p className="card-text">{card.description}</p>
                  <p className="card-text fw-bold text-success">Coins: {card.coins}</p>
                  <p className="card-text fw-bold text-success">Amount: {card.amount}</p>
                  <button className="btn btn-success mt-2" onClick={() => handleBuy(card._id)}>
                    Buy 🛒
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
