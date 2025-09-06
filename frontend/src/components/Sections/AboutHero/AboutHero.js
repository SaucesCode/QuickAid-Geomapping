import React from 'react';
import { motion } from 'framer-motion';
import './AboutHero.css';

const AboutHero = () => {
  return (
    <div className="about-hero">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="about-title"
      >
        What is <span className="text-gradient">QUICKAID</span>?
      </motion.h1>
    </div>
  );
};

export default AboutHero; 