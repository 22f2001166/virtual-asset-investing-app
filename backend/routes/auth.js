const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password} = req.body;
  const role = 'user';
  try {

    // Check if email ends with @gmail.com
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).send("Email must be a Gmail address (end with @gmail.com)");
      }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email.");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, role });
    await user.save();

    res.status(201).send("Signup success");
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send("Server error");
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Invalid credentials: User not found");
    }

    if (user.flagged) {
      return res.status(403).send("Your account has been flagged. Contact admin.");
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials: Incorrect password");
    }

    // If everything is okay, generate a token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
