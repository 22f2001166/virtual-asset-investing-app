// src/pages/UsersList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [userAssets, setUserAssets] = useState([]); // <-- new
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    setUserRole(role);

    const fetchUsersAndAssets = async () => {
      try {
        const [usersRes, assetsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/user-assets') // <-- fetch user assets
        ]);

        const nonAdminUsers = usersRes.data.filter((user) => user.role !== 'admin');
        nonAdminUsers.sort((a, b) => b.coins - a.coins);

        setUsers(nonAdminUsers);
        setUserAssets(assetsRes.data); // <-- set assets
      } catch (err) {
        console.error('Failed to fetch users or assets', err);
      }
    };

    fetchUsersAndAssets();
  }, []);


  const handleAddCoins = async (userId) => {
    const coinAmount = prompt("Enter the number of coins to add:");
    const token = sessionStorage.getItem('token'); // assuming token is stored here
  
    if (coinAmount && !isNaN(coinAmount)) {
      try {
        const response = await axios.patch(
          `http://localhost:5000/api/users/${userId}/add-coins`,
          { coins: parseInt(coinAmount) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200) {
          setUsers(users.map((user) =>
            user._id === userId ? { ...user, coins: user.coins + parseInt(coinAmount) } : user
          ));
        }
      } catch (err) {
        console.error('Error updating coins:', err);
        alert('Failed to add coins. Make sure you are logged in as admin.');
      }
    } else {
      alert('Invalid number of coins.');
    }
  };

  const handleToggleFlag = async (userId) => {
    const token = sessionStorage.getItem('token');
  
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/users/${userId}/toggle-flag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        setUsers(users.map((user) =>
          user._id === userId ? { ...user, flagged: response.data.flagged } : user
        ));
      }
    } catch (err) {
      console.error('Error toggling flag:', err);
      alert('Failed to flag/unflag user.');
    }
  };
  

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssetCount = (userId) => {
    return userAssets.filter((asset) => asset.userId === userId).length;
  };

  return (
    <div className="dashboard-background px-3 py-4">
        <div className="welcome-div mb-4 text-center">
            <h4 className="text-white">All Users</h4>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <input
            type="text"
            className="form-control w-25 w-md-50 w-lg-25"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="container mt-4 px-1 px-lg-5">
            <div className="table-responsive">
            <table className="table table-white table-striped table-bordered rounded">
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Coins</th>
                    <th>Assets</th>
                    <th>Status</th>
                    {userRole === 'admin' && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{parseFloat(user.coins).toFixed(2)}</td>
                    <td>{getAssetCount(user._id)}</td>
                    <td>
                        {!user.flagged ? (
                          <span className="badge bg-success ms-2">Active</span>
                        ) : (
                          <span className="badge bg-danger ms-2">Flagged</span>
                        )}
                    </td>
                    {userRole === 'admin' && (
                      <td>
                        <button className="btn btn-primary btn-sm me-2" style={{ fontSize: '0.75rem', padding: '4px 12px' }} onClick={() => handleAddCoins(user._id)}>
                          Add Coins
                        </button>
                        <button
                          className={`btn btn-${user.flagged ? 'danger' : 'warning'} btn-sm`}
                          style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                          onClick={() => handleToggleFlag(user._id)}
                        >
                          {user.flagged ? 'Unflag' : 'Flag'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
};

export default UsersList;
