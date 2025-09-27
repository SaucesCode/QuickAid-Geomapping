import { NavLink } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import qaWithout from '../../assets/qa-withoutText.png';
import qaText from '../../assets/quickaid-text.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}
    >
      {/* Top Contact Bar */}
      <div
        className={`border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={qaWithout}
                alt="QuickAid Logo"
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? 'w-12 h-12' : 'w-16 h-16'
                }`}
              />
              <img
                src={qaText}
                alt="QuickAid Text"
                className={`transition-all duration-300 ${
                  isScrolled ? 'w-28' : 'w-32'
                }`}
              />
            </div>

            {/* Contact Info (Right side) */}
            <div className="hidden md:flex items-center justify-center gap-12 text-gray-800 text-sm">
              {/* Working Hours */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-700" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Working hours</span>
                  <span className="font-semibold">Mon - Fri 9am to 5pm</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-700" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Our address</span>
                  <span className="font-semibold">Barangay</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-700" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Call us</span>
                  <span className="font-semibold">09xxxxxxx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav
        className={`bg-gradient-to-r from-blue-900 to-blue-800 text-white transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <ul className="hidden md:flex items-center gap-8">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `font-medium transition-colors duration-200 ${
                      isActive
                        ? 'underline underline-offset-4 text-blue-200'
                        : 'text-white hover:text-blue-200 hover:underline underline-offset-4'
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about-us"
                  className={({ isActive }) =>
                    `font-medium transition-colors duration-200 ${
                      isActive
                        ? 'underline underline-offset-4 text-blue-200'
                        : 'text-white hover:text-blue-200 hover:underline underline-offset-4'
                    }`
                  }
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `font-medium transition-colors duration-200 ${
                      isActive
                        ? 'underline underline-offset-4 text-blue-200'
                        : 'text-white hover:text-blue-200 hover:underline underline-offset-4'
                    }`
                  }
                >
                  Services
                </NavLink>
              </li>
            </ul>

            {/* Apply Button */}
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
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block font-medium py-2 ${
                      isActive ? 'text-blue-200 underline underline-offset-4' : 'text-white hover:text-blue-200'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about-us"
                  className={({ isActive }) =>
                    `block font-medium py-2 ${
                      isActive ? 'text-blue-200 underline underline-offset-4' : 'text-white hover:text-blue-200'
                    }`
                  }
                >
                  About Us
                </NavLink>
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `block font-medium py-2 ${
                      isActive ? 'text-blue-200 underline underline-offset-4' : 'text-white hover:text-blue-200'
                    }`
                  }
                >
                  Services
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
