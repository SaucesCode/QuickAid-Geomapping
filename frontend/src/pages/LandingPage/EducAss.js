import React, { useState } from "react";
import {
  GraduationCap,
  FileText,
  ListChecks,
  Gift,
  Users,
  ClipboardList,
  IdCard,
  Home,
  Wallet,
  CheckCircle,
  FileCheck,
  FileSearch,
  FileSignature,
  Banknote,
} from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const EducationalAssistance = () => {
  const [activeTab, setActiveTab] = useState("requirements");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 relative overflow-hidden">
          <GraduationCap className="absolute right-12 top-12 w-40 h-40 text-white opacity-10" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl text-blue-100 font-extrabold mb-4">
                  Educational Assistance Program
                </h1>
                <p className="text-lg text-blue-100 max-w-xl">
                  Supporting students and families by providing financial
                  assistance for tuition, school supplies, and other educational needs.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">50,000+</h3>
                <p className="text-gray-600">Students Assisted</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">₱120M+</h3>
                <p className="text-gray-600">Funds Granted</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Gift className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">Nationwide</h3>
                <p className="text-gray-600">Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            {/* Tabs */}
            <div className="flex justify-center space-x-4 mb-10">
              <button
                onClick={() => setActiveTab("requirements")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === "requirements"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FileText className="w-5 h-5" /> Requirements
              </button>
              <button
                onClick={() => setActiveTab("application")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === "application"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ListChecks className="w-5 h-5" /> Application Process
              </button>
              <button
                onClick={() => setActiveTab("benefits")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === "benefits"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Gift className="w-5 h-5" /> Benefits
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {activeTab === "requirements" && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-6">
                    Requirements
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { text: "Valid government-issued ID of the applicant/guardian", icon: IdCard },
                      { text: "Proof of Enrollment or Certificate of Registration", icon: ClipboardList },
                      { text: "Barangay Certificate of Residency", icon: Home },
                      { text: "Proof of income (if applicable)", icon: Wallet },
                      { text: "Accomplished application form", icon: FileCheck },
                    ].map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
                      >
                        <req.icon className="w-6 h-6 text-blue-600" />
                        <p className="text-gray-700">{req.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "application" && (
  <div>
    <h2 className="text-2xl font-bold text-blue-700 mb-8">
      Application Process
    </h2>

    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 h-full w-1 bg-gray-200"></div>

      <div className="space-y-10 relative">
        {[
          {
            step: "Submit Documents",
            desc: "Applicants must submit all required documents at the nearest DSWD office or satellite center.",
            icon: FileSignature,
          },
          {
            step: "Evaluation",
            desc: "DSWD staff will review and verify the submitted documents to ensure completeness and authenticity.",
            icon: FileSearch,
          },
          {
            step: "Approval",
            desc: "Once verified, the application will be approved based on eligibility criteria and available funds.",
            icon: CheckCircle,
          },
          {
            step: "Release of Assistance",
            desc: "Financial or material support will be released through DSWD offices, accredited schools, or banks.",
            icon: Banknote,
          },
        ].map((item, index) => (
          <div key={index} className="flex items-start gap-6 relative">
            {/* Step Circle */}
            <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-md">
              <item.icon className="w-6 h-6" />
            </div>
            {/* Step Content */}
            <div>
              <p className="text-gray-900 font-semibold text-lg">{item.step}</p>
              <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}



              {activeTab === "benefits" && (
  <div>
    <h2 className="text-2xl font-bold text-blue-700 mb-6">
      Benefits
    </h2>
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      {[
        { text: "Tuition fee coverage for qualified applicants", icon: GraduationCap },
        { text: "Provision of school supplies and uniforms", icon: ClipboardList },
        { text: "Transportation allowance", icon: Users },
        { text: "Other educational expenses to ensure participation", icon: Gift },
      ].map((benefit, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
        >
          <benefit.icon className="w-6 h-6 text-blue-600" />
          <p className="text-gray-700">{benefit.text}</p>
        </div>
      ))}
    </div>

    {/* Who Can Apply Section */}
    <div className="bg-blue-600 text-white rounded-xl p-8">
      <h3 className="text-xl font-bold mb-6">Who Can Apply?</h3>
      <div className="space-y-4">
        {[
          "Indigent individuals and families",
          "Students from low-income households who are struggling to pay tuition, school supplies, or other school-related expenses.",
          "Learners affected by emergencies or crises (e.g., calamities, displacement, or family emergencies) that disrupt their education.",
          "Children of solo parents, persons with disabilities (PWDs), or marginalized sectors needing educational support.",
          "Students with outstanding academic performance but lacking resources to continue their studies."
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-white text-gray-800 p-4 rounded-lg shadow-sm"
          >
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

            </div>
          </div>
        </section>

        {/* Call-to-Action */}
        <section className="bg-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Applying for Assistance?
            </h2>
            <p className="mb-6 text-blue-100">
              Visit your nearest DSWD Office today or check the online portal for more details.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Link
            to="/services"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold transition-colors"
          >
            ← Back to Services
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default EducationalAssistance;
