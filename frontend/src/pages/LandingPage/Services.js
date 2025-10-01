import React from "react";
import { GraduationCap, Stethoscope, Cross } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";
import dswdLogo from "../../assets/dswd-logo.png";
// import aicslogo from "../../assets/AICS-OFFICIAL.png";

const AicsWebsite = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Header Section */}
        <section className="bg-white border-b py-6">
          <div className="max-w-6xl mx-auto flex items-center px-4">
            {/* Logos and Title */}
            <div className="flex items-center space-x-6">
              {/* DSWD Logo + Title stacked */}
              <div className="flex flex-col items-start">
                <img
                  src={dswdLogo}
                  alt="DSWD Logo"
                  className="w-40 md:w-48 lg:w-52 -mb-2" // made logo bigger
                />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-800 mt-2">
                  Assistance to Individuals In Crisis Situation (AICS)
                </h1>
              </div>

              {/* AICS Mascot logo */}
              {/* <img
                src={aicslogo}
                alt="AICS Logo"
                className="h-14 object-contain"
              /> */}
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
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-md text-white">
                  <GraduationCap className="w-10 h-10" />
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
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Medical Assistance */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-6 shadow-md text-white">
                  <Stethoscope className="w-10 h-10" />
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
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Funeral Assistance */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-md text-white">
                  <Cross className="w-10 h-10" />
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
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors"
                  >
                    Learn More
                  </Link>
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
