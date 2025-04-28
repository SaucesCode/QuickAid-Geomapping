import React from 'react';
import { FileText, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-teal-400" />
              <span className="ml-2 text-xl font-bold">AMS</span>
            </div>
            <p className="text-gray-400 mb-4">
              Streamlining beneficiary applications for faster processing and better service delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Home</a></li>
              <li><a href="#challenges" className="text-gray-400 hover:text-teal-400 transition-colors">Challenges</a></li>
              <li><a href="#goals" className="text-gray-400 hover:text-teal-400 transition-colors">Goals</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-teal-400 transition-colors">Services</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Educational Assistance</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Medical Assistance</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Burial Assistance</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Application Process</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>123 Main Street</li>
              <li>City, State 12345</li>
              <li>contact@ams.com</li>
              <li>(123) 456-7890</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Application Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;