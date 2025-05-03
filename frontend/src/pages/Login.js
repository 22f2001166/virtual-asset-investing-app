import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Login.css'; // Import the same styling as the signup page

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const { token, role } = res.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);
      window.dispatchEvent(new Event('loginStatusChanged'));

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("Your account has been flagged.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center">
      <motion.div
        className="login-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-white mb-4">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
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

          <Button variant="outline-light" type="submit" className="w-100 fw-semibold py-2 my-3">
            Login
          </Button>
        </Form>
      </motion.div>
    </div>
  );
};

export default Login;
