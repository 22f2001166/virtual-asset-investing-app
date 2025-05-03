// src/pages/KnowMore.js
import React from 'react';
import { motion } from 'framer-motion'; // Import framer motion
import './KnowMore.css';

const TermsConditions = () => {
  return (
    <div className="knowmore-background d-flex align-items-center justify-content-center">
      <motion.div
        className="knowmore-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Terms & Conditions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          This app is designed to help users learn about wealth management, asset investment, and financial strategies. Any asset used here is not real, and just for app purpose.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          Enjoy and Learn, Lessgoooo!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default TermsConditions;
