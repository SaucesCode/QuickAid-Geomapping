import React from "react";
import { GraduationCap, Stethoscope, Cross } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";
import dswdLogo from "../../assets/dswd-logo.png";
import aicslogo from "../../assets/AICS-OFFICIAL.png";
import aicsheader from "../../assets/aics_header_new 2.png";

const AicsWebsite = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50/70 pt-32"> {/* Lighter, professional blue background */}
        {/* Header Section */}
        <section className="bg-white border-b border-blue-100 py-8 shadow-sm"> {/* Soft shadow, blue border */}
          <div className="max-w-6xl mx-auto flex flex-col items-start px-4">
            {/* Logos + Title stacked together */}
            <div className="flex flex-col items-start w-full">
              {/* Logos side by side */}
              <div className="flex items-center gap-4 mb-4 relative z-10 justify-start -ml-10">
  <img
    src={aicsheader}
    alt="DSWD Logo"
    className="w-74 md:w-90 lg:w-106 object-contain"
  />
</div>

            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-blue-50/70"> {/* Consistent light blue background */}
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-6xl font-bold text-center text-blue-500 mb-4"> {/* Bolder blue heading */}
              Our Comprehensive Services
            </h2>
            <p className="text-center text-blue-700 mb-16 max-w-3xl mx-auto text-lg font-medium leading-relaxed"> {/* Darker blue text, increased margin */}
              We provide essential assistance programs designed to empower
              individuals and families through diverse crisis situations, ensuring dignity and timely support.
            </p>

            <div className="grid md:grid-cols-3 gap-10"> {/* Increased gap between cards */}
              {/* Educational Assistance */}
              <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden border border-blue-100"> {/* Sharper shadow, rounded edges, blue border */}
                {/* Monochromatic Blue Gradient Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 w-full"></div>

                {/* Watermark Icon - Blue toned */}
                <GraduationCap className="absolute right-4 top-4 w-16 h-16 text-blue-200 opacity-15" />

                <div className="p-8">
                  {/* Main Icon - Monochromatic Blue */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-400 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-lg">
                    <GraduationCap className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-blue-900 mb-3 text-center"> {/* Dark blue heading */}
                    Educational Assistance
                  </h3>
                  <p className="text-blue-700 text-base mb-4 text-center leading-relaxed"> {/* Darker blue text, better readability */}
                    Financial help for students and families in need of academic
                    support to pursue their educational goals without burden.
                  </p>
                  <ul className="text-left text-blue-800 text-sm space-y-2 pl-5 list-disc"> {/* Darker blue list items */}
                    <li>Tuition fee assistance</li>
                    <li>School supplies and uniforms</li>
                    <li>Transportation allowance</li>
                    <li>Other academic-related expenses</li>
                  </ul>
                  <div className="mt-8 text-center"> {/* Increased top margin */}
                    <Link
                      to="/services/education"
                      className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-8 py-3 rounded-full font-semibold transition-colors shadow-md" // Rounded button, blue hover
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Medical Assistance */}
              <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden border border-blue-100">
                {/* Monochromatic Blue Gradient Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 w-full"></div> {/* Subtle blue-cyan gradient for distinction */}

                {/* Watermark Icon - Blue toned */}
                <Stethoscope className="absolute right-4 top-4 w-16 h-16 text-blue-200 opacity-15" />

                <div className="p-8">
                  {/* Main Icon - Monochromatic Blue */}
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-lg">
                    <Stethoscope className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-blue-900 mb-3 text-center">
                    Medical Assistance
                  </h3>
                  <p className="text-blue-700 text-base mb-4 text-center leading-relaxed">
                    Emergency medical bill support, prescription assistance, and
                    medical equipment funding to ensure immediate health needs are met.
                  </p>
                  <ul className="text-left text-blue-800 text-sm space-y-2 pl-5 list-disc">
                    <li>Hospital bill assistance</li>
                    <li>Prescription drug coverage</li>
                    <li>Medical equipment rental</li>
                    <li>Transportation to medical facilities</li>
                  </ul>
                  <div className="mt-8 text-center">
                    <Link
                      to="/services/medical"
                      className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-8 py-3 rounded-full font-semibold transition-colors shadow-md"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>

              {/* Funeral Assistance */}
              <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden border border-blue-100">
                {/* Monochromatic Blue Gradient Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-2 w-full"></div>

                {/* Watermark Icon - Blue toned */}
                <Cross className="absolute right-4 top-4 w-16 h-16 text-blue-200 opacity-15" />

                <div className="p-8">
                  {/* Main Icon - Monochromatic Blue */}
                  <div className="bg-gradient-to-br from-blue-700 to-blue-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 shadow-lg">
                    <Cross className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-blue-900 mb-3 text-center">
                    Funeral Assistance
                  </h3>
                  <p className="text-blue-700 text-base mb-4 text-center leading-relaxed">
                    Financial support for families coping with funeral and burial
                    expenses during times of loss, providing peace of mind.
                  </p>
                  <ul className="text-left text-blue-800 text-sm space-y-2 pl-5 list-disc">
                    <li>Burial assistance</li>
                    <li>Funeral service coverage</li>
                    <li>Transportation of remains</li>
                    <li>Other related funeral expenses</li>
                  </ul>
                  <div className="mt-8 text-center">
                    <Link
                      to="/services/funeral"
                      className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-8 py-3 rounded-full font-semibold transition-colors shadow-md"
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