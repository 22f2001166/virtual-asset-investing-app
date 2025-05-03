import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [cards, setCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editData, setEditData] = useState({
    coins: '',
    amount: '',
    description: '',
  });
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    const fetchCards = async () => {
      const res = await axios.get('http://localhost:5000/api/cards');
      setCards(res.data);
    };

    fetchCards();
  }, []);

  const handleEditClick = (card) => {
    setEditingCardId(card._id);
    setEditData({
      coins: card.coins,
      amount: card.amount,
      description: card.description,
    });
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/cards/${id}`, editData);
      const updatedCards = cards.map((card) =>
        card._id === id ? { ...card, ...editData } : card
      );
      setCards(updatedCards);
      setEditingCardId(null);
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  const handleCancel = () => {
    setEditingCardId(null);
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
        <h4 className="text-white">Hello, Admin 👋</h4>
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
              <div className="card h-100 shadow-lg admin-card">
                <img src={`http://localhost:5000${card.image}`} className="card-img-top" alt={card.name} />
                <div className="card-body">
                  <h5 className="card-title">{card.name}</h5>

                  {editingCardId === card._id ? (
                    <>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                      />
                      <input
                        type="number"
                        name="coins"
                        value={editData.coins}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                      />
                      <input
                        type="number"
                        name="amount"
                        value={editData.amount}
                        onChange={handleInputChange}
                        className="form-control mb-2"
                      />
                      <button className="btn btn-success w-50" onClick={() => handleSave(card._id)}>Save</button>
                      <button className="btn btn-secondary w-50" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <p className="card-text">{card.description}</p>
                      <p className="card-text fw-bold text-success">Coins: {card.coins}</p>
                      <p className="card-text fw-bold text-success">Amount: {card.amount}</p>
                      <button className="btn btn-primary w-100" onClick={() => handleEditClick(card)}>Edit</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
