import React from 'react';
import { motion } from 'framer-motion';
import './FeatureCards.css';

const features = [
  {
    icon: 'fas fa-database',
    title: 'Centralized Storage',
    description: 'Automated data management system for efficient storage and retrieval'
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Data Visualization',
    description: 'Advanced tools to support decision-making and service delivery'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'ISO Standards',
    description: 'Compliant with ISO/IEC 25010:2017 quality standards'
  }
];

const FeatureCards = () => {
  return (
    <div className="features-grid">
      {features.map((feature, index) => (
        <motion.div 
          key={index}
          className="feature-card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <div className="feature-icon">
            <i className={feature.icon}></i>
          </div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCards; 