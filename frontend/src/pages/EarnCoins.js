import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import { motion } from 'framer-motion';

const EarnCoins = () => {
  const [coins, setCoins] = useState(null);
  const [message, setMessage] = useState('');
  const [showCoins, setShowCoins] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [spinMessage, setSpinMessage] = useState('');

  const fetchUserCoins = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoins(res.data.coins);
      setTimeout(() => {
        setShowCoins(true);
      }, 1000);
    } catch (err) {
      console.error('Error fetching coins:', err);
    }
  };

  const handleAdComplete = async () => {
    setShowAd(false);
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/earn-coins',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message);
      setShowCoins(false);
      setTimeout(() => {
        fetchUserCoins();
      }, 1000);
    } catch (err) {
      console.error('Error earning coins:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);  // Show backend message
      } else {
        setMessage('Failed to earn coins');
      }
    }
  };

  const showAdThenEarn = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Check if the user is eligible to earn (use /earn-coins route)
      await axios.post(
        'http://localhost:5000/api/earn-coins',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // If eligible, show the ad
      setShowAd(true);
      setMessage('');
      
      // After ad completion, handle the reward
      setTimeout(() => {
        handleAdComplete();
      }, 4000);
  
    } catch (err) {
      console.error('Error with earning coins:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);  // Display the backend message
      } else {
        setMessage('Failed to earn coins');
      }
    }
  };  

  const handleDailyCheckIn = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/daily-check-in',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCheckInMessage(res.data.message);
      fetchUserCoins();
    } catch (err) {
      console.error('Error with daily check-in:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setCheckInMessage(err.response.data.message);  // Show backend message
      } else {
        setCheckInMessage('Failed to redeem');
      }
    }
  };

  const fetchReferralCode = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/referral-code', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReferralCode(res.data.referralCode);
    } catch (err) {
      console.error('Error fetching referral code:', err);
    }
  };
  
  const useReferralCode = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/use-referral',
        { code: referralInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReferralMessage(res.data.message);
      fetchUserCoins();
    } catch (err) {
      console.error('Error using referral code:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setReferralMessage(err.response.data.message);
      } else {
        setReferralMessage('Failed to apply referral code');
      }
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/submit-feedback',
        { feedback: feedbackText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFeedbackMessage(res.data.message);
      setFeedbackText('');
      fetchUserCoins();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFeedbackMessage(err.response.data.message);
      } else {
        setFeedbackMessage('Failed to submit feedback');
      }
    }
  };  

  const handleAvatarSubmit = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/avatar-reward',
        { avatar: selectedAvatar },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvatarMessage(res.data.message);
      fetchUserCoins();
    } catch (err) {
      console.error('Error submitting avatar:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setAvatarMessage(err.response.data.message);
      } else {
        setAvatarMessage('Failed to submit avatar');
      }
    }
  };

  const handleSpinWheel = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/spin-wheel',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSpinMessage(res.data.message);
      fetchUserCoins();  // Fetch updated coin balance
    } catch (err) {
      console.error('Error spinning the wheel:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setSpinMessage(err.response.data.message);  // Show error message
      } else {
        setSpinMessage('Failed to spin the wheel');
      }
    }
  };

  const redeemButton = coins > 20000 ? (
    <button className="btn btn-success mt-2">Redeem Wealth T-shirt</button>
  ) : null;

  useEffect(() => {
    fetchUserCoins();
    fetchReferralCode();
  }, []);

  return (
    <div className="dashboard-background px-3 py-4">
      <div className="welcome-div mb-4 text-center">
        {!showCoins || coins === null ? (
          <h4 className="text-white">Loading your coins...</h4>
        ) : (
          <h4 className="text-white">Your Current Coins: 🪙 {parseFloat(coins).toFixed(2)}</h4>
        )}
      </div>

      <div className="container mt-4 px-1 px-lg-5">
        <div className="row">
          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div
              className="card h-100 shadow user-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">🎁 Earn Coins</h5>
                <p className="card-text">Watch an ad to earn 50 coins instantly!</p>
                <button className="btn btn-primary mt-2" onClick={showAdThenEarn}>
                  Watch Ad
                </button>
                {message && <p className="mt-3 text-success">{message}</p>}
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div
              className="card h-100 shadow user-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">🎁 Daily Check-in</h5>
                <p className="card-text">Check in daily to earn 50 coins!</p>
                <button className="btn btn-success mt-2" onClick={handleDailyCheckIn}>
                  Redeem Now
                </button>
                {checkInMessage && <p className="mt-3">{checkInMessage}</p>}
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div
              className="card h-100 shadow user-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">🎁 Spin the Wheel</h5>
                <p className="card-text">Spin the wheel to win coins!</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleSpinWheel}
                  disabled={spinMessage && spinMessage.includes('You have already spun the wheel')}
                >
                  Spin Now
                </button>
                {spinMessage && <p className="mt-2">{spinMessage}</p>}
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div
              className="card h-100 shadow user-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">💬 Submit Feedback</h5>
                <p className="card-text">Submit Feedback to earn 50 coins!</p>
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Tell us what you think..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                ></textarea>
                <button className="btn btn-success mt-2" onClick={handleSubmitFeedback}>
                  Submit Feedback
                </button>
                {feedbackMessage && <p className="mt-2 text-success">{feedbackMessage}</p>}
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div
              className="card h-100 shadow user-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">🧑‍🎨 Create Your Avatar</h5>
                <p className="card-text">Choose an avatar to earn 50 coins!</p>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {['🐱', '🐶', '🐵', '🐼', '🦊'].map((icon, index) => (
                    <span
                      key={index}
                      className={`avatar-icon p-2 fs-2 rounded ${
                        selectedAvatar === icon ? 'bg-primary text-white' : 'bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedAvatar(icon)}
                    >
                      {icon}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn-info mt-2"
                  onClick={handleAvatarSubmit}
                  disabled={!selectedAvatar}
                >
                  Submit Avatar & Earn Coins
                </button>
                {avatarMessage && <p className="mt-2 text-success">{avatarMessage}</p>}
              </div>
            </motion.div>
          </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="card-body text-center">
                <h5 className="card-title">🎉 Use a Referral Code</h5>
                <div className="bg-light text-dark p-2 rounded fw-bold">{referralCode || 'Generating...'}</div>
                <p className="card-text">Enter your friend's referral code to get coins!</p>
                <div className="d-flex justify-content-center">
                  <input
                    type="text"
                    className="form-control mb-2 w-50"
                    placeholder="Enter referral code"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                  />
                </div>
                <button className="btn btn-warning" onClick={useReferralCode}>
                  Apply
                </button>
                {referralMessage && <p className="mt-2 text-success">{referralMessage}</p>}
              </div>
            </motion.div>
          </div>
        </div>
        {showAd && (
        <div className="ad-overlay text-center d-flex align-items-center justify-content-center">
          <div className="ad-box p-4 bg-dark text-white rounded shadow-lg">
            <h5>📺 Ad is playing...</h5>
            <p className="mt-2">Please wait for a few seconds to earn your reward.</p>
          </div>
        </div>
      )}
    </div>
    <div className="welcome-div mb-4 mt-2 text-center">
      <h4 className="text-white">Your Incentives ✨</h4>
    </div>

    <div className="container mt-4 d-flex flex-column align-items-center">
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Leaderboard Ranking</h5>
            <p className="card-text">Earn bonus coins based on daily leaderboard rankings:</p>
            <ul className="list-unstyled">
              <li>🥇 1st Place: 500 coins</li>
              <li>🥈 2nd Place: 400 coins</li>
              <li>🥉 3rd Place: 300 coins</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Admin Bonus</h5>
            <p className="card-text">Admins may reward you with bonus points based on your performance:</p>
            <ul className="list-unstyled">
              <li>✨ Outstanding contributions</li>
              <li>🎯 Exceptional achievements</li>
              <li>🏆 Special occasions</li>
              <li>If you hold SUV L2 for 5 days, you will get 500 coins (in discourse)</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Flex Cards</h5>
            <p className="card-text">You will get a real card if you:</p>
            <ul className="list-unstyled">
              <li>🃏 Own a Yacht</li>
              <li>🃏 Own a Ship</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">First Purchase</h5>
            <p className="card-text">Special bonuses for your first purchase:</p>
            <ul className="list-unstyled">
              <li>🛒 Bonus for first card purchase</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Tshirt</h5>
            <p className="card-text">You will get a Wealth tshirt when you have:</p>
            <ul className="list-unstyled">
              <li>✨ More than 20000 coins</li>
            </ul>
            {redeemButton}
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Holdings</h5>
            <p className="card-text">If you hold Sedan or SUV:</p>
            <ul className="list-unstyled">
              <li>🛒 You will get 50 coins daily</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Discounts and Cashbacks</h5>
            <p className="card-text">If you buy more than 10 assets:</p>
            <ul className="list-unstyled">
              <li>🛒 You will get 50 coins daily</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Missions</h5>
            <p className="card-text">Buy 3 assets today:</p>
            <ul className="list-unstyled">
              <li>✨ You will receive a shoutout by admin in discourse</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Milestones</h5>
            <p className="card-text">🛒 Complete the milestones and get 30 coins for each one daily:</p>
            <ul className="list-unstyled">
              <li>1. Get a Coupe L1</li>
              <li>2. Get a Custom L1</li>
              <li>3. Get a Classic L1</li>
              <li>4. Get a Roadster L1</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Wild Card (Coming Soon)</h5>
            <p className="card-text">If you have 1500 coins in your pocket:</p>
            <ul className="list-unstyled">
              <li>🃏 You can buy any asset</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Offers (Coming Soon)</h5>
            <p className="card-text">Use coins to get offers</p>
            <ul className="list-unstyled">
              <li>🛒 Get Cashbacks of 100 rs on next recharge using 100 coins</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Renting Assets (Coming Soon)</h5>
            <p className="card-text">Rent bonus</p>
            <ul className="list-unstyled">
              <li>🛒 If you own two same cars, you will get rent bonus</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <div className="mb-4" style={{ width: "100%", maxWidth: "750px" }}>
        <motion.div className="card h-100 shadow user-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="card-body text-center">
            <h5 className="card-title">Real money competition (Coming Soon)</h5>
            <p className="card-text">Earn real money by registering and compete in competition:</p>
            <ul className="list-unstyled">
              <li>🥇 1st Place: 5000 rs</li>
              <li>🥈 2nd Place: 4000 rs</li>
              <li>🥉 3rd Place: 3000 rs</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
  );
};

export default EarnCoins;
