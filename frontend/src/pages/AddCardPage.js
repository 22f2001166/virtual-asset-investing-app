import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AddCardPage = () => {
  const [cardData, setCardData] = useState({
    name: '',
    coins: '',
    amount: '',
    image: '',
    description: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setCardData({ ...cardData, image: e.target.files[0] });
    } else {
      setCardData({ ...cardData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('name', cardData.name);
    formData.append('coins', cardData.coins);
    formData.append('amount', cardData.amount)
    formData.append('description', cardData.description);
    formData.append('image', cardData.image);

    try {
      await axios.post('http://localhost:5000/api/cards/add', formData);
      setSuccess('Card added successfully!');
      setCardData({ name: '', coins: '', amount: '', description: '', image: null });
      navigate('/admin');
    } catch (err) {
      setError('Failed to add card');
    }
  };

  return (
    <div className="dashboard-background px-3 py-4">
      <div className="welcome-div mb-4 text-center">
        <h4 className="text-white">Add New Card</h4>
      </div>

      <div className="d-flex justify-content-center align-items-center">
        <div className="dashboard-card">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label className="text-white mb-1">Card Name</label>
              <input
                type="text"
                name="name"
                value={cardData.name}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-white mb-1">Coins</label>
              <input
                type="number"
                name="coins"
                min="0"
                value={cardData.coins}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-white mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                min="0"
                value={cardData.amount}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-white mb-1">Description</label>
              <textarea
                name="description"
                value={cardData.description}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
                rows = {6}
                required
              />
            </div>

            <div className="mb-3">
              <label className="text-white mb-1">Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
                required
              />
            </div>

            <button type="submit" className="btn btn-outline-light w-100 fw-semibold py-2">Add Card</button>

            {success && <p className="text-success mt-3">{success}</p>}
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCardPage;
