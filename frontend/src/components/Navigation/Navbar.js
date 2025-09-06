
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import the assets
import qaWithout from '../../assets/qa-withoutText.png';
import qaText from '../../assets/quickaid-text.png';
import worktime from '../../assets/working-time.png';
import location from '../../assets/location.png';
import phone from '../../assets/call.png';

const Navbar = () => {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
    }`}>
      {/* Top Contact Bar */}
      <div className={`border-b border-gray-100 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={qaWithout} alt="QuickAid Logo" className={`object-contain transition-all duration-300 ${
                isScrolled ? 'w-12 h-12' : 'w-16 h-16'
              }`} />
              <img src={qaText} alt="QuickAid Text" className={`transition-all duration-300 ${
                isScrolled ? 'w-28' : 'w-32'
              }`} />
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Working Hours</p>
                  <p className="text-sm font-semibold text-gray-900">Mon - Fri 9am to 5pm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-green-50 rounded-full">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Our Address</p>
                  <p className="text-sm font-semibold text-gray-900">Barangay Office</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-purple-50 rounded-full">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Call Us</p>
                  <p className="text-sm font-semibold text-gray-900">09123456789</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className={`bg-gradient-to-r from-blue-900 to-blue-800 text-white transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <ul className="hidden md:flex items-center gap-8">
              <li>
                <Link to="/" className="text-white hover:text-blue-200 font-medium transition-colors duration-200 hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-white hover:text-blue-200 font-medium transition-colors duration-200 hover:underline underline-offset-4">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white hover:text-blue-200 font-medium transition-colors duration-200 hover:underline underline-offset-4">
                  Services
                </Link>
              </li>
              <li>
                {/* <a href="#contact" className="text-white hover:text-blue-200 font-medium transition-colors duration-200 hover:underline underline-offset-4">
                  Contact
                </a> */}
              </li>
            </ul>

            <div className="hidden md:flex items-center gap-4">
              <button className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200">
                Apply Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-blue-800 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-blue-800 mt-4"
            >
              <div className="px-4 py-6 space-y-4">
                <Link to="/" className="block text-white hover:text-blue-200 font-medium py-2">Home</Link>
                <Link to="/about-us" className="block text-white hover:text-blue-200 font-medium py-2">About Us</Link>
                <Link to="/services" className="block text-white hover:text-blue-200 font-medium py-2">Services</Link>
                <a href="#contact" className="block text-white hover:text-blue-200 font-medium py-2">Contact</a>
                <button className="w-full bg-white text-blue-900 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200 mt-4">
                  Apply Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar; 