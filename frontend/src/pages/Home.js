import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch feedback from backend
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/get-feedbacks'); // Adjust URL as needed
        setTestimonials(res.data);
      } catch (err) {
        console.error('Error loading feedbacks:', err);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials]);

  return (
    <div className="home-background">
      <Container fluid className="text-center text-white py-4">
        <motion.h1
          className="display-4 fw-bold"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Wealth: An Asset Investing place for you
        </motion.h1>

        <motion.p
          className="lead"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
        Dive into the asset investment world and compete with brilliant minds!
        </motion.p>

        <motion.div
          className="mt-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Button variant="light" size="lg" className="mx-3 shadow-sm mb-2 mb-sm-0" onClick={() => navigate('/know-more')}>
            Know More
          </Button>
          <Button variant="outline-light" size="lg" className="mx-3 shadow-sm" onClick={() => navigate('/terms-conditions')}>
            Terms & Conditions
          </Button>
        </motion.div>

        <motion.div
          className="testimonial-image-container mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/buyimage.png" // Use your actual image path
            alt="Happy Users"
            className="testimonial-banner-img"
          />
        </motion.div>

        <motion.div
          className="testimonial-image-container mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/sellimage.png" // Use your actual image path
            alt="Happy Users"
            className="testimonial-banner-img"
          />
        </motion.div>

        <motion.div
          className="testimonial-image-container mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/earncoinsimage.png" // Use your actual image path
            alt="Happy Users"
            className="testimonial-banner-img"
          />
        </motion.div>

        {testimonials.length > 0 && (
          <motion.div
            className="testimonial-section mt-4"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <h2 className="mb-4">What Our Users Say</h2>
            <div className={`testimonial-fade ${fade ? 'fade-in' : 'fade-out'}`}>
              <p className="testimonial">"{testimonials[index].text}"</p>
              <p className="testimonial">- {testimonials[index].author}</p>
            </div>
          </motion.div>
        )}

        <footer className="text-center text-light mt-5 mb-3" style={{ opacity: 0.8 }}>
          <p>Built for smart investors</p>
          <p>&copy; {new Date().getFullYear()} Wealth. All rights reserved.</p>
        </footer>
      </Container>
    </div>
  );
};

export default Home;