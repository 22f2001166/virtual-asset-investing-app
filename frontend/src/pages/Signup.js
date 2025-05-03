import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Signup.css'; // Import custom styling

const Signup = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error
    try {
      await axios.post('http://localhost:5000/api/auth/signup', form);
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data); // Show backend error
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="signup-background d-flex justify-content-center align-items-center">
      <motion.div
        className="signup-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-white mb-4">Create Account</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label className="text-white">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label className="text-white">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label className="text-white">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>

          <Button variant="outline-light" type="submit" className="w-100 fw-semibold py-2">
            Sign Up
          </Button>
        </Form>
      </motion.div>
    </div>
  );
};

export default Signup;
