import React, { useState } from "react";
import {
  Stethoscope, // Medical Consultation / General medical
  ClipboardList, // Records / Laboratory
  Users,
  Hospital, // Hospital / Facilities
  Pill, // Medicines
  FileText,
  ListChecks,
  Gift,
  IdCard,
  ArrowLeft,
  Home,
  Wallet,
  FileCheck,
  FileSearch,
  FileSignature,
  CheckCircle,
  Banknote,
} from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const MedicalAssistance = () => {
  const [activeTab, setActiveTab] = useState("requirements");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Hero Section - Blue Theme */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 relative overflow-hidden">
          <Stethoscope className="absolute right-12 top-12 w-40 h-40 text-white opacity-10" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl text-blue-100 font-bold mb-4">
                  Medical Assistance Program
                </h1>
                <p className="text-lg text-blue-100 max-w-xl">
                  Providing immediate and compassionate healthcare support for indigent
                  individuals and families through medicines, hospital assistance, and
                  essential medical services.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">100,000+</h3>
                <p className="text-gray-600">Patients Assisted</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Hospital className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">₱500M+</h3>
                <p className="text-gray-600">Medical Aid Granted</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Gift className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">2nd District</h3>
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
                  <h2 className="text-2xl font-bold text-blue-700 mb-6">Requirements</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        text: "Valid government-issued ID of the applicant/guardian",
                        icon: IdCard,
                      },
                      {
                        text: "Medical certificate or hospital records",
                        icon: ClipboardList,
                      },
                      {
                        text: "Barangay Certificate of Residency",
                        icon: Home,
                      },
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
                          desc: "Medical or financial aid will be released through DSWD offices, hospitals, or partner agencies.",
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
                  <h2 className="text-2xl font-bold text-blue-700 mb-6">Benefits</h2>
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {[
                      {
                        text: "Free medicines for qualified patients",
                        icon: Pill,
                      },
                      {
                        text: "Hospital bill assistance",
                        icon: Hospital,
                      },
                      {
                        text: "Laboratory and diagnostic support",
                        icon: ClipboardList,
                      },
                      {
                        text: "Free medical consultation",
                        icon: Stethoscope,
                      },
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
                        "Indigent individuals and families with limited capacity to pay for healthcare",
                        "Patients facing medical emergencies without sufficient financial resources",
                        "Individuals with chronic illnesses requiring continuous medication or treatment",
                        "Persons with disabilities (PWDs) in need of medical or rehabilitative support",
                        "Victims of calamities or crises requiring urgent medical care",
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

        <div className="p-8 md:p-12 bg-blue-500 min-h-screen flex items-start justify-center">
          {/* Content card - rounded white background */}
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 max-w-4xl w-full relative mt-16">
            {/* 'PAALALA' Header/Pill - positioned absolutely at the top-left */}
            <div className="absolute top-0 left-4 md:left-8 transform -translate-y-1/2">
              <div className="bg-red-600 text-white font-bold text-lg md:text-xl py-2 px-6 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
                PAALALA
              </div>
            </div>

            {/* Content Section */}
            <div className="pt-4 md:pt-8 space-y-4">
              {/* Group 1: NO FIXER & NO EXTRA FEES */}
              <div className="flex items-start space-x-4 md:space-x-6">
                {/* NO FIXER Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center border-2 border-red-600 rounded-full text-red-600 font-extrabold text-center leading-tight">
                  <span className="text-xl">NO</span>
                  <span className="text-xl">FIXER</span>
                </div>

                {/* Combined Text Block for NO FIXER and NO EXTRA FEES (using clean text) */}
                <div className="text-lg text-gray-800 flex-grow pt-1 space-y-4">
                  <p>
                    Ang lahat ng pinansyal na tulong mula sa Crisis Intervention Division ng
                    DSWD ay buong matatanggap ng mga benepisyaryo.
                  </p>
                  <p>
                    Walang sino mang empleyado o hindi empleyado ng ahensya ang awtorisado na
                    magkaltas o magpataw ng ano mang pinansiyal na singil mula rito.
                  </p>
                </div>
              </div>

              {/* Group 2: FAKE DOCUMENTS */}
              <div className="flex items-start space-x-4 md:space-x-6 pt-4">
                {/* FAKE Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center border-2 border-red-600 rounded-lg text-red-600 font-extrabold text-center leading-none">
                  <span
                    className="text-2xl tracking-widest"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    FAKE
                  </span>
                </div>

                {/* Text Block for FAKE DOCUMENTS (using clean text) */}
                {/* This paragraph takes the same width as the combined two above it */}
                <p className="text-lg text-gray-800 flex-grow pt-1">
                  Ang DSWD ay hindi tumatanggap ng mga fake/peke na mga dokumento at ito ay
                  mapatunayan ng DSWD may kaukulang itong parusa at dadaan ito sa tamang
                  proseso upang mabigyan ng tamang aksyon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-full font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Services
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default MedicalAssistance;
