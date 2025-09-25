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
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-6">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Educational Assistance</h3>
                <p className="text-gray-600">
                  Support for tuition and school supplies
                </p>
              </div>

              {/* Medical Assistance */}
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mb-6">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Medical Assistance</h3>
                <p className="text-gray-600">
                  Healthcare and medical expenses coverage
                </p>
              </div>

              {/* Burial Assistance */}
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-6">
                  <Cross className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Burial Assistance</h3>
                <p className="text-gray-600">
                  Funeral and burial service support
                </p>
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
