import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Know More</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">What are the services we provide?</Link></li>
              {/* <li><Link to="/about-us" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link></li> */}
              <li><Link to="/about-quickaid" className="text-gray-400 hover:text-white transition-colors duration-200">What is QUICKAID?</Link></li>

              {/* <li><Link to="/#services" className="text-gray-400 hover:text-white transition-colors duration-200">Services</Link></li> */}
              {/* <li><Link to="/#faqs" className="text-gray-400 hover:text-white transition-colors duration-200">Frequently Ask Questions</Link></li> */}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Frequently Ask Questions</li>
              <li>AICS Accomplishment</li>
              
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>123 Main Street, City, Country</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>+123 456 7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>Mon - Fri 9am to 5pm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          © {new Date().getFullYear()} Government Applied Management System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;


