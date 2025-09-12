import React from 'react';
import { motion } from 'framer-motion';
import './AboutDescription.css';

const AboutDescription = () => {
  return (
    <motion.div 
      className="main-description"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <p>
        QUICKAID addresses the inefficiencies of the traditional, manual AICS application process by providing a secure and user-friendly digital platform. Applicants can submit their requests for medical, educational or burial assistance through our web application management system, while social workers and administrative personnel can manage and evaluate these applications more efficiently through an integrated backend system.
      </p>
    </motion.div>
  );
};

export default AboutDescription; 