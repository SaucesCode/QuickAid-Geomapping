import React from 'react';
import './LandingPage.css';
import { motion } from "framer-motion";


// Assets
import qaWithout from '../../assets/qa-withoutText.png';
import qaText from '../../assets/quickaid-text.png';
import worktime from '../../assets/working-time.png';
import location from '../../assets/location.png';
import phone from '../../assets/call.png';

import james from '../../assets/Carl.jpg';
import dswd from '../../assets/dswd-logo.png';
import aics from '../../assets/AICS-OFFICIAL.png';

import EducationIcon from '../../assets/mortarboard.png';
import MedicalIcon from '../../assets/healthcare.png';
import BurialIcon from '../../assets/memorial.png';
import educ from '../../assets/education.png';
import patient from '../../assets/patient.png';

// Beneficiaries Data
const beneficiaries = [
  {
    icon: educ,
    title: 'Students',
    description: 'Individuals who are currently enrolled in educational institutions and require financial assistance for their studies.',
    alt: 'Student Icon',
  },
  {
    icon: patient,
    title: 'Patients',
    description: 'Individuals who are currently undergoing medical treatment.',
    alt: 'Patient Icon',
  },
  {
    icon: BurialIcon,
    title: 'Burial',
    description: 'Individuals who require assistance with burial or funeral services.',
    alt: 'Burial Icon',
  },
];

// Services Data
const services = [
  {
    icon: EducationIcon,
    title: 'Educational Assistance',
  },
  {
    icon: MedicalIcon,
    title: 'Medical Assistance',
  },
  {
    icon: BurialIcon,
    title: 'Burial Assistance',
  },
];

const LandingPage = () => {
  return (
    <div>

      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto flex justify-between items-center py-2">
          <div className="logo-group">
            <img src={qaWithout} alt="QuickAid Logo" className="logo-icon" />
            <img src={qaText} alt="QuickAid Text" className="logo-text" />
          </div>
          <div className="contact-info-container">
            <div className='contact-item'>
              <img src={worktime} alt="Clock" className="contact-icon" />
              <div>
                <span className="contact-label">Working Hours</span><br />
                <span className="contact-value">Mon - Fri 9am to 5pm</span>
              </div>
            </div>
            <div className='contact-item'>
              <img src={location} alt="Location" className="contact-icon" />
              <div>
                <span className="contact-label">Our address</span><br />
                <p className="contact-value">Barangay</p>
              </div>
            </div>
            <div className='contact-item'>
              <img src={phone} alt="Phone" className="contact-icon" />
              <div>
                <span>Call us</span><br />
                <p className="text-sm">09123456789</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="navbar">
          <div className="nav-container">
            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#ServicesSection">Services</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
            <button className="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="AIC">
          <div className="logo-row">
            <img src={dswd} alt="DSWD Logo" className="dswdLogo" />
            <img src={aics} alt="AICS Logo" className="aicsLogo" />
          </div>
          <div className="aicsText">
            Assistance to Individuals in Crisis Situation (AICS)
          </div>
        </div>
        <div className="hero-container">
          <div className="hero-text-content">
            <h1 className="hero-title">Assistance to Individuals in Crisis Situation (AICS)</h1>
            <p className="hero-description">
              AICS (Assistance to Individuals in Crisis Situation) is a DSWD program that provides medical, burial, transport, education, food, or financial aid to individuals or families in need.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn-primary">Get Started</button>
              <button className="hero-btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-image-container">
            <img src={james} alt="Document Icon" className="carl" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="ServicesSection" className="services-section">
        <div className="section-container">
          <div className="services-row">
            <div className="services-text">
              <h2 className="section-title">AICS ASSISTANCE</h2>
              <p className="services-subtitle">SERVICES</p>
              <h3 className="blue-heading">We Provide <br /> Awesome <br /> Services</h3>
              <p className="services-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>
            <div className="services-cards-wrapper">
              <div className="services-bg-bar"></div>
              <div className="services-cards">
                {services.map((service, index) => (
                  <motion.div 
                    key={index}
                    className="service-card"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    <div className="service-icon-circle">
                      <img src={service.icon} alt={service.title} className="service-icon" />
                    </div>
                    <h4 className="service-title">{service.title.toUpperCase()}</h4>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-blue-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Who We Serve</h2>
          <p className="text-center text-lg mb-12">
            Our application management system is designed to assist a determined range of beneficiaries.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {beneficiaries.map((b, index) => (
              <motion.div key={index} 
                className="bg-white text-blue-600 p-6 rounded-xl shadow-md text-center"
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <img src={b.icon} alt={b.alt} className="w-14 h-14 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                <p className="text-sm">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white shadow-md p-4 rounded">
              <h3 className="text-lg font-bold mb-2">Where do I download the AICS Application Form?</h3>
              <p className="text-gray-600">
                You can download the AICS Application Form (AF-AICS) from our official website under the "Downloads" section. The form is available in PDF format and requires Adobe Acrobat Reader for viewing.
              </p>
            </div>
            <div className="bg-white shadow-md p-4 rounded">
              <h3 className="text-lg font-bold mb-2">What documents are required for submission?</h3>
              <p className="text-gray-600">
                The following documents are required for submission: Completed AF-AICS form, Proof of identity (e.g., passport, driver's license), Proof of address, and supporting documents as applicable.
              </p>
            </div>
            <div className="bg-white shadow-md p-4 rounded">
              <h3 className="text-lg font-bold mb-2">How can I contact the AICS Program?</h3>
              <p className="text-gray-600">
                For inquiries, you may contact us via email at aics@example.com or call our hotline at +123 456 7890.
              </p>
            </div>
            <div className="bg-white shadow-md p-4 rounded">
              <h3 className="text-lg font-bold mb-2">How do I get started on the AICS Program?</h3>
              <p className="text-gray-600">
                To get started, visit our website and download the AF-AICS form. Fill it out and submit with all required documents. Our team will review your application within 5 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-600 py-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <img src="/assets/logo-footer.png" alt="Logo" className="w-32 mb-4 md:mb-0" />
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-lg font-bold mb-2">QUICK LINKS</h3>
              <ul>
                <li><a href="#home" className="hover:underline">Home</a></li>
                <li><a href="#about" className="hover:underline">About Us</a></li>
                <li><a href="#services" className="hover:underline">Services</a></li>
                <li><a href="#contact" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">SERVICES</h3>
              <ul>
                <li>Education Assistance</li>
                <li>Medical Assistance</li>
                <li>Burial Assistance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">CONTACT</h3>
              <p>
                Address: 123 Main Street, City, Country<br />
                Phone: +123 456 7890<br />
                Email: info@example.com
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          © 2023 Government Applied Management System (GAMS). All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
