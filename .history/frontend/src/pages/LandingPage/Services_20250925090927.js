import React from "react";
import { GraduationCap, Stethoscope, Cross } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const AicsWebsite = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              We provide comprehensive assistance programs designed to help individuals and families overcome crisis situations.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Educational Assistance */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-md">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Educational Assistance</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Support for students in need of financial assistance for educational
                  expenses including tuition, school supplies, and other academic needs.
                </p>
                <Link
                  to="/services/education"
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                >
                  Learn More
                </Link>
              </div>

              {/* Medical Assistance */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mb-6 shadow-md">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Medical Assistance</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Healthcare support for individuals and families facing medical emergencies
                  and treatment needs.
                </p>
                <Link
                  to="/services/medical"
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                >
                  Learn More
                </Link>
              </div>

              {/* Burial Assistance */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-6 shadow-md">
                  <Cross className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Burial Assistance</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Financial support for families dealing with funeral and burial expenses
                  during difficult times.
                </p>
                <Link
                  to="/services/funeral"
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                >
                  
                </Link>
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
