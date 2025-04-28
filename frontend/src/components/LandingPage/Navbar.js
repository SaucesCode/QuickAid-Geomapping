import React, { useState, useEffect } from "react";
import { Menu, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">AMS</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#challenges"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Challenges
            </a>
            <a href="#goals" className="text-gray-600 hover:text-blue-600 transition-colors">
              Goals
            </a>
            <a
              href="#services"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Services
            </a>
            <a
              href="#beneficiaries"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Beneficiaries
            </a>
            <a href="#mission" className="text-gray-600 hover:text-blue-600 transition-colors">
              Mission
            </a>
            {/* <div className="staff-login">
              <button onClick={() => alert("Desktop button clicked!")}>Staff Login</button>
            </div> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {/* {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#challenges"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Challenges
            </a>
            <a
              href="#goals"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Goals
            </a>
            <a
              href="#services"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Services
            </a>
            <a
              href="#beneficiaries"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Beneficiaries
            </a>
            <a
              href="#mission"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Mission
            </a>
            <div className="staff-login">
              <button
                className="w-full text-left px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                onClick={() => navigate("/login")}
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
