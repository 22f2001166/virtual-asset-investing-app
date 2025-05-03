const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authenticateToken = require('./middlewares/authenticateToken'); // Add this import
const User = require('./models/User'); // Import your User model
const cardRoutes = require('./routes/cardRoutes');
const coinRoutes = require('./routes/coinRoutes');
const assetRoutes = require('./routes/assetRoutes');
const userRoutes = require('./routes/userRoutes')
require('./cronJobs');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Mongo connected');

    // Pre-seed admin account
    await createAdminIfNotExists();

    // Start the server after DB and admin are ready
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error("MongoDB Error:", err));

  // Function to create admin if not already present
const createAdminIfNotExists = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const admin = new User({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin account created with email: admin@gmail.com');
    } else {
      console.log('Admin account already exists.');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
};

// Routes for authentication
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', coinRoutes);
app.use('/api/assets', assetRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api', userRoutes); // adjust path
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/discourse', require('./routes/discourseRoutes'));
app.use('/api/user-assets', assetRoutes);

// Protected routes
app.get('/api/admin', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send("Access forbidden: Admins only");
  }
  res.send("Welcome to Admin Dashboard");
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email coins avatar');
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json({ username: user.username, coins: user.coins, avatar: user.avatar });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send("Server error");
  }
});
