import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronLeft, Handshake, Shield, AlertTriangle, Zap } from "lucide-react"; // Imported professional icons

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    // 1. Page Container with Subtle Blue/Slate Background
    <div className="bg-slate-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      
      {/* 2. Main Content Card (Elevated and Professional) */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-8 md:p-12 border border-blue-100">
        
        {/* Header Section */}
        <header className="mb-10 pb-4 border-b-2 border-blue-200">
          <div className="flex items-center space-x-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              QuickAid <span className="text-4xl text-blue-600">Terms and Conditions</span>
            </h1>
          </div>
        </header>

        {/* Introduction */}
        <p className="text-slate-700 mb-8 text-lg leading-relaxed border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/70 rounded-md">
          By accessing and using QuickAid, you agree to comply with
          the following terms and conditions. Please read them carefully as they constitute a binding legal agreement.
        </p>

        {/* Policy Sections */}
        <section className="space-y-8">

          {/* 1. Acceptance of Terms */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Handshake className="w-5 h-5 mr-3 text-blue-600" /> 1. Acceptance of Terms
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              By utilizing this platform, you acknowledge and agree to follow these Terms and Conditions. 
              Continued use signifies acceptance of any future amendments. If you do not agree, you must stop using QuickAid immediately.
            </p>
          </div>

          {/* 2. Use of Services */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Shield className="w-5 h-5 mr-3 text-blue-600" /> 2. Proper Use of Services
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              QuickAid is provided to assist individuals in crisis. Misuse of this
              service, including but not limited to, providing false or misleading information, is strictly prohibited and may result in legal action.
            </p>
          </div>

          {/* 3. Eligibility */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Zap className="w-5 h-5 mr-3 text-blue-600" /> 3. Eligibility Requirements
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              Access to and application for assistance via QuickAid is limited to individuals who fully meet the program's defined requirements. We reserve the right to verify all claims of eligibility.
            </p>
          </div>

          {/* 4. Accuracy of Information (Highlighted as a Critical Point) */}
          <div className="group p-4 border border-red-300 rounded-lg bg-red-50/50">
            <h2 className="flex items-center text-2xl font-bold mt-2 mb-3 text-red-700 border-l-4 border-red-500 pl-3 transition-colors">
              <AlertTriangle className="w-5 h-5 mr-3 text-red-600" /> 4. CRITICAL: Accuracy of Information
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              Users bear full responsibility for providing accurate, complete, and truthful information during the application process. False or misleading data will immediately result in the denial of services and potential termination of access to the platform.
            </p>
          </div>

          {/* 5. Service Availability */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Zap className="w-5 h-5 mr-3 text-blue-600" /> 5. Service Availability and Changes
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              QuickAid operates on a "best effort" basis. We reserve the right to update, suspend, or discontinue any part of the services at any time, with or without prior notice, to manage resources or respond to emergencies.
            </p>
          </div>

          {/* 6. Limitation of Liability */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Shield className="w-5 h-5 mr-3 text-blue-600" /> 6. Limitation of Liability
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              To the maximum extent permitted by law, QuickAid is not liable for direct, indirect, or consequential damages resulting from reliance on the service, including but not limited to delays, technical issues, or interruptions in service delivery.
            </p>
          </div>

          {/* 7. Governing Law */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Handshake className="w-5 h-5 mr-3 text-blue-600" /> 7. Governing Law
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.
            </p>
          </div>

        </section>

        {/* Action Button */}
        <div className="mt-12 pt-6 border-t border-blue-100">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to QuickAid Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;