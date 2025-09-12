import React from "react";
import { Phone, Mail, MapPin, Heart, GraduationCap, Stethoscope, Home } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const AicsWebsite = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Hero Section */}
        {/* <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <span className="text-blue-600 font-medium text-2xl">DSWD</span>
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Assistance to Individuals in Crisis Situation (AICS)
          </h1>
        </div>
      </section> */}

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Our Services</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              We provide comprehensive support through our streamlined application system.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Educational Assistance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4 mx-auto">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-center">Educational Assistance</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6">
                    Support for students in need of financial assistance for educational
                    expenses including tuition, school supplies, and other academic needs.
                  </p>
                  <div className="text-center">
                    <Link
                      to="/services/education"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Medical Assistance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4 mx-auto">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-center">Medical Assistance</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6">
                    Healthcare support for individuals and families facing medical emergencies
                    and treatment needs.
                  </p>
                  <div className="text-center">
                    <Link
                      to="/services/medical"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Burial Assistance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4 mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-center">Burial Assistance</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6">
                    Financial support for families dealing with funeral and burial expenses
                    during difficult times.
                  </p>
                  <div className="text-center">
                    <Link
                      to="/services/funeral"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AicsWebsite;
