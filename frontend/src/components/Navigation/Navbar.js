// Navbar.js
import { NavLink, useNavigate } from "react-router-dom";
import { Clock, MapPin, Phone, Menu, X, LogIn } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffQR from "../StaffQR"; // Ensure path is correct
import qaWithout from "../../assets/qa-withoutText.png";
import qaText from "../../assets/quickaid-text.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        {/* Top Contact Bar */}
        <div
          className={`border-b border-gray-100 transition-all duration-300 ${
            isScrolled ? "py-2" : "py-3"
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
                    isScrolled ? "w-12 h-12" : "w-16 h-16"
                  }`}
                />
                <img
                  src={qaText}
                  alt="QuickAid Text"
                  className={`transition-all duration-300 ${
                    isScrolled ? "w-28" : "w-32"
                  }`}
                />
              </div>

              {/* Contact Info */}
              <div className="hidden md:flex items-center justify-center gap-12 text-gray-800 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-gray-500">Working hours</span>
                    <span className="font-semibold">Mon - Fri 9am to 5pm</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-700" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-gray-500">Our address</span>
                    <span className="font-semibold">Barangay</span>
                  </div>
                </div>
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
            isScrolled ? "py-3" : "py-4"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Desktop Navigation */}
              <ul className="hidden md:flex items-center gap-8">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `font-medium transition-colors duration-200 ${
                        isActive
                          ? "underline underline-offset-4 text-blue-200"
                          : "text-white hover:text-blue-200 hover:underline underline-offset-4"
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
                          ? "underline underline-offset-4 text-blue-200"
                          : "text-white hover:text-blue-200 hover:underline underline-offset-4"
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
                          ? "underline underline-offset-4 text-blue-200"
                          : "text-white hover:text-blue-200 hover:underline underline-offset-4"
                      }`
                    }
                  >
                    Services
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `font-medium transition-colors duration-200 ${
                        isActive
                          ? "underline underline-offset-4 text-blue-200"
                          : "text-white hover:text-blue-200 hover:underline underline-offset-4"
                      }`
                    }
                  >
                    Contact
                  </NavLink>
                </li>
              </ul>

              {/* Buttons (Apply + Staff Login) */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200"
                >
                  Apply Now
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  Staff Login
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-blue-800 rounded-lg transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-blue-800 mt-4"
              >
                <div className="px-4 py-6 space-y-4">
                  {["/", "/about-us", "/services", "/contact"].map((path, idx) => (
                    <NavLink
                      key={idx}
                      to={path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block font-medium py-2 ${
                          isActive
                            ? "text-blue-200 underline underline-offset-4"
                            : "text-white hover:text-blue-200"
                        }`
                      }
                    >
                      {path === "/"
                        ? "Home"
                        : path === "/about-us"
                        ? "About Us"
                        : path === "/services"
                        ? "Services"
                        : "Contact"}
                    </NavLink>
                  ))}

                  <button
                    onClick={() => {
                      setShowModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left font-medium py-2 text-white hover:text-blue-200"
                  >
                    Apply Now
                  </button>

                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left font-medium py-2 text-white hover:text-blue-200 flex items-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Staff Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* StaffQR Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* StaffQR Content */}
            <StaffQR />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
