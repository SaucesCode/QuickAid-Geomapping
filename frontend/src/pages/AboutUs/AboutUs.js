import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';
import { Link } from 'react-router-dom';
import qaWithout from '../../assets/qa-withoutText.png';
import qaText from '../../assets/quickaid-text.png';
import worktime from '../../assets/working-time.png';
import location from '../../assets/location.png';
import phone from '../../assets/call.png';
import Navbar from '../../components/Navigation/Navbar';
import Footer from '../../components/Footer/Footer';
import aics from '../../assets/AICS-OFFICIAL.png';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <Navbar />
      <motion.div 
        className="about-us-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Assistance to Individuals in <span className="highlight">Crisis Situation</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Supporting communities through immediate and compassionate aid
          </motion.p>
        </div>
        <motion.div 
          className="hero-image"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <img src={aics} alt="AICS Logo" className="aics-logo" />
        </motion.div>
      </motion.div>

      <div className="about-us-content">
        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="content-box">
            <div className="section-header">
              <div className="header-line"></div>
              <h2>About AICS Program</h2>
              <div className="header-line"></div>
            </div>
            <div className="content-grid">
              <div className="content-text">
                <p>
                  Assistance to individuals in crisis refers to the support provided to people experiencing a sudden, unexpected, or overwhelming situation that requires immediate attention and help to overcome their physical, emotional, and social needs.
                </p>
                <p>
                  This kind of assistance is typically provided by government agencies, non-profits, or community organizations and includes immediate intervention, which has high priority in identifying the individual and addressing urgent needs.
                </p>
              </div>
              <div className="content-image">
                <div className="image-container">
                  <i className="fas fa-hands-helping"></i>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="key-aspects"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="section-header">
            <div className="header-line"></div>
            <h2>Key Aspects of Our Assistance</h2>
            <div className="header-line"></div>
          </div>
          
          <div className="aspects-grid">
            <motion.div 
              className="aspect-card definition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="aspect-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <h3>Definition of Crisis</h3>
              <p>A situation that involves diverse factors like mental distress, domestic violence, homelessness, unemployment, medical emergencies, or mental health issues</p>
            </motion.div>

            <motion.div 
              className="aspect-card assistance"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="aspect-icon">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h3>Types of Assistance</h3>
              <div className="assistance-types">
                <div className="assistance-type">
                  <i className="fas fa-graduation-cap"></i>
                  <span>Educational Assistance</span>
                </div>
                <div className="assistance-type">
                  <i className="fas fa-hospital"></i>
                  <span>Medical Assistance</span>
                </div>
                <div className="assistance-type">
                  <i className="fas fa-cross"></i>
                  <span>Burial Assistance</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="aspect-card goals"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="aspect-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Goals</h3>
              <ul className="goals-list">
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Ensure immediate safety and stability</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Prevent crisis escalation</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Connect with long-term support</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="impact-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="section-header">
            <div className="header-line"></div>
            <h2>Our Impact</h2>
            <div className="header-line"></div>
          </div>
          
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Communities Served</h3>
              <p>Supporting diverse communities across the region</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Quick Response</h3>
              <p>Immediate assistance when it matters most</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Compassionate Care</h3>
              <p>Dedicated to providing empathetic support</p>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs; 