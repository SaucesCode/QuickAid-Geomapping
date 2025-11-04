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
  Phone, // Using Phone for Contact Us CTA
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import { Link } from "react-router-dom";

const EducationalAssistance = () => {
  const [activeTab, setActiveTab] = useState("requirements");

  return (
    <>
      <Navbar />
      {/* 1. Main Page Container (Using light blue/slate for professionalism) */}
      <div className="min-h-screen bg-slate-50 pt-32">
        
        {/* 2. Hero Section - Deep Monochromatic Blue */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 relative overflow-hidden shadow-lg">
          <GraduationCap className="absolute right-12 top-12 w-40 h-40 text-blue-500 opacity-10" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl text-blue-100 font-bold mb-4"> {/* Changed from extrabold to bold */}
                  Educational Assistance Program
                </h1>
                <p className="text-lg text-blue-200 max-w-xl font-medium"> {/* Softer text color */}
                  Supporting students and families by providing financial
                  assistance for tuition, school supplies, and other educational needs.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500"> {/* Added border accent */}
                <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-semibold">50,000+</h3> {/* Changed from bold to semibold */}
                <p className="text-slate-600">Students Assisted</p>
              </div>
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500">
                <Banknote className="w-10 h-10 mx-auto mb-3 text-blue-600" /> {/* Changed icon to Banknote for finance */}
                <h3 className="text-2xl font-semibold">₱120M+</h3>
                <p className="text-slate-600">Funds Granted</p>
              </div>
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500">
                <Home className="w-10 h-10 mx-auto mb-3 text-blue-600" /> {/* Changed icon to Home for Coverage */}
                <h3 className="text-2xl font-semibold">2nd District</h3>
                <p className="text-slate-600">Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tabs Section */}
        <section className="py-16 bg-white"> {/* White background for content clarity */}
          <div className="max-w-6xl mx-auto px-6">
            
            {/* Tabs */}
            <div className="flex justify-center space-x-4 mb-10 border-b-2 border-blue-100 pb-2"> {/* Added subtle border */}
              <button
                onClick={() => setActiveTab("requirements")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${ /* Rounded buttons, added shadow */
                  activeTab === "requirements"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100" // Monochromatic color change
                }`}
              >
                <FileText className="w-5 h-5" /> Requirements
              </button>
              <button
                onClick={() => setActiveTab("application")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
                  activeTab === "application"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <ListChecks className="w-5 h-5" /> Application Process
              </button>
              <button
                onClick={() => setActiveTab("benefits")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
                  activeTab === "benefits"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Gift className="w-5 h-5" /> Benefits
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-50 rounded-xl shadow-inner p-8 border border-blue-100"> {/* Soft, inset shadow for content area */}
              {activeTab === "requirements" && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-blue-500 pl-3">
                    Requirements
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { text: "Valid government-issued ID of the applicant/guardian", icon: IdCard },
                      { text: "Proof of Enrollment or Certificate of Registration", icon: ClipboardList },
                      { text: "Barangay Certificate of Residency", icon: Home },
                      { text: "Proof of income (if applicable)", icon: Wallet },
                      { text: "Accomplished application form", icon: FileCheck },
                      { text: "Latest grades/academic standing documentation", icon: GraduationCap }, // Added new requirement for balance
                    ].map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <req.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <p className="text-slate-700 font-medium">{req.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "application" && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-8 border-l-4 border-blue-500 pl-3">
                    Application Process
                  </h2>

                  <div className="relative">
                    {/* Vertical Line - Monochromatic Blue */}
                    <div className="absolute left-6 top-0 h-full w-1 bg-blue-200"></div>

                    <div className="space-y-10 relative">
                      {[
                        {
                          step: "Submit Documents",
                          desc: "Applicants must submit all required documents at the nearest DSWD office or satellite center.",
                          icon: FileSignature,
                        },
                        {
                          step: "Evaluation and Verification",
                          desc: "DSWD staff will review and verify the submitted documents to ensure completeness and authenticity.",
                          icon: FileSearch,
                        },
                        {
                          step: "Approval and Confirmation",
                          desc: "Once verified, the application will be approved based on eligibility criteria and available funds.",
                          icon: CheckCircle,
                        },
                        {
                          step: "Release of Assistance",
                          desc: "Financial or material support will be released through DSWD offices, accredited schools, or partner banks.",
                          icon: Banknote,
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-6 relative">
                          {/* Step Circle - Monochromatic Blue */}
                          <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex-shrink-0">
                            <item.icon className="w-6 h-6" />
                          </div>
                          {/* Step Content */}
                          <div>
                            <p className="text-slate-900 font-bold text-lg">{item.step}</p>
                            <p className="text-slate-600 text-sm mt-2">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "benefits" && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-blue-500 pl-3">
                    Benefits Provided
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
                        className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <benefit.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <p className="text-slate-700 font-medium">{benefit.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Who Can Apply Section (Monochromatic Blue) */}
                  <div className="bg-blue-600 text-white rounded-xl p-8 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">Who Can Apply?</h3>
                    <div className="space-y-4">
                      {[
                        "Indigent individuals and families.",
                        "Students from low-income households who are struggling to pay tuition or school-related expenses.",
                        "Learners affected by emergencies or crises (e.g., calamities, displacement, or family emergencies) that disrupt their education.",
                        "Children of solo parents, persons with disabilities (PWDs), or marginalized sectors needing educational support.",
                        "Students with outstanding academic performance but lacking resources to continue their studies."
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 bg-white text-slate-800 p-4 rounded-lg shadow-sm"
                        >
                          {/* Changed color from green to blue-600 for monochromatic theme */}
                          <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
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

        {/* 4. Call-to-Action (Reversed Color Scheme) */}
        <section className="bg-blue-50 text-blue-900 py-16 border-t border-blue-200">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Applying for Assistance?
            </h2>
            <p className="mb-8 text-slate-700">
              Visit your nearest DSWD Office today or check the online portal for more details on documentary requirements and schedules.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              Contact Us Now
            </Link>
          </div>
        </section>

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

export default EducationalAssistance;