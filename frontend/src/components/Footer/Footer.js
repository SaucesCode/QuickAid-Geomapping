import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from '../../assets/qa-withoutText.png'; // adjust path based on your folder

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12 items-start">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center text-center">
            <img 
              src={Logo} 
              alt="QuickAid Logo" 
              className="w-40 h-40 mb-4" // Bigger logo
            />
            <p className="text-gray-400 text-sm max-w-xs">
              Helping individuals in crisis with care and compassion.
            </p>
          </div>

          {/* Know More */}
          <div>
            <h3 className="text-lg font-bold mb-4">Know More</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/services" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  What are the services we provide?
                </Link>
              </li>
              <li>
                <Link 
                  to="/about-quickaid" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  What is QUICKAID?
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/aics-accomplishment" className="text-gray-400 hover:text-white transition-colors duration-200">
                  AICS Accomplishment
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>inquiry@dswd.gov.ph</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>ciu@dswd.gov.ph</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>8962-2813 / 8951-7433</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>Monday – Friday (except holidays)<br/>8:00 am – 5:00 pm</span>
              </div>
            </div>
          </div>

        </div>

        {/* Social Media */}
        <div className="border-t border-gray-800 pt-8 flex justify-center">
          <div className="flex space-x-6 text-gray-400">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} QuickAid. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
