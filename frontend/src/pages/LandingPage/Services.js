import React from "react";
import { GraduationCap, Stethoscope, Cross } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";
import dswdLogo from "../../assets/dswd-logo.png";
import aicslogo from "../../assets/AICS-OFFICIAL.png";

const AicsWebsite = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Header Section */}
        <section className="bg-white border-b py-6">
          <div className="max-w-6xl mx-auto flex flex-col items-start px-4">
            {/* Logos + Title stacked together */}
            <div className="flex flex-col items-start">
              {/* Logos side by side */}
              <div className="flex items-center gap-2 relative">
                <img
                  src={dswdLogo}
                  alt="DSWD Logo"
                  className="w-32 md:w-40 lg:w-44 object-contain"
                />
                <img
                  src={aicslogo}
                  alt="AICS Logo"
                  className="w-20 md:w-20 lg:w-30 object-contain"
                />
              </div>

              {/* Title overlaps logos more */}
              <h1 className="text-2xl md:text-4xl lg:text-4xl font-extrabold text-blue-800 leading-tight -mt-2">
                Assistance to Individuals In Crisis Situation (AICS)
              </h1>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              We provide comprehensive assistance programs designed to help
              individuals and families overcome crisis situations.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Educational Assistance */}
              <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 w-full"></div>

                {/* Watermark Icon */}
                <GraduationCap className="absolute right-4 top-4 w-16 h-16 text-blue-200 opacity-10" />

                <div className="p-8">
                  {/* Main Icon */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-md">
                    <GraduationCap className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    Educational Assistance
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Financial help for students and families in need of academic
                    support.
                  </p>
                  <ul className="text-left text-gray-700 text-sm space-y-2 pl-5 list-disc">
                    <li>Tuition fee assistance</li>
                    <li>School supplies and uniforms</li>
                    <li>Transportation allowance</li>
                    <li>Other academic-related expenses</li>
                  </ul>
                  <div className="mt-6 text-center">
                    <Link
                      to="/services/education"
                      className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-2 rounded-md font-semibold transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Medical Assistance */}
              <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal-600 h-2 w-full"></div>

                {/* Watermark Icon */}
                <Stethoscope className="absolute right-4 top-4 w-16 h-16 text-green-200 opacity-10" />

                <div className="p-8">
                  {/* Main Icon */}
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-md">
                    <Stethoscope className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    Medical Assistance
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Emergency medical bill support, prescription assistance, and
                    medical equipment funding.
                  </p>
                  <ul className="text-left text-gray-700 text-sm space-y-2 pl-5 list-disc">
                    <li>Hospital bill assistance</li>
                    <li>Prescription drug coverage</li>
                    <li>Medical equipment rental</li>
                    <li>Transportation to medical facilities</li>
                  </ul>
                  <div className="mt-6 text-center">
                    <Link
                      to="/services/medical"
                      className="inline-block bg-green-50 hover:bg-green-100 text-green-700 px-6 py-2 rounded-md font-semibold transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Funeral Assistance */}
              <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 w-full"></div>

                {/* Watermark Icon */}
                <Cross className="absolute right-4 top-4 w-16 h-16 text-pink-200 opacity-10" />

                <div className="p-8">
                  {/* Main Icon */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-md">
                    <Cross className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    Funeral Assistance
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Financial support for families coping with funeral and burial
                    expenses.
                  </p>
                  <ul className="text-left text-gray-700 text-sm space-y-2 pl-5 list-disc">
                    <li>Burial assistance</li>
                    <li>Funeral service coverage</li>
                    <li>Transportation of remains</li>
                    <li>Other related funeral expenses</li>
                  </ul>
                  <div className="mt-6 text-center">
                    <Link
                      to="/services/funeral"
                      className="inline-block bg-pink-50 hover:bg-pink-100 text-pink-700 px-6 py-2 rounded-md font-semibold transition-colors"
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
