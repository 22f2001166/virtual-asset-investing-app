import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './UserDashboard.css'; // Import the shared styles

const UserAssets = () => {
  const [assets, setAssets] = useState([]);
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/assets/my-assets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data);
    };
    fetchAssets();
  }, []);

  const handleSell = async (cardId) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/assets/sell/${cardId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Asset sold successfully! New Coins: ' + res.data.newCoins);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sell asset');
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortOption === 'alphabetical') return a.name.localeCompare(b.name);
    if (sortOption === 'price') return b.coins - a.coins;
    if (sortOption === 'amount') return b.amountOwned - a.amountOwned;
    return 0;
  });
  

  return (
    <div className="dashboard-background px-3 py-4">
      <div className="welcome-div mb-4 text-center">
        <h4 className="text-white">Your Assets</h4>
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
          {sortedAssets.map((card) => (
            <div key={card._id} className="col-md-6 col-lg-4 mb-4">
              <motion.div
                className="card h-100 shadow user-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: card._id * 0.1 }}
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
                  <p className="card-text fw-bold text-success">Amount: {card.amountOwned}</p>
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => handleSell(card._id)}
                  >
                    Sell
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

export default UserAssets;
