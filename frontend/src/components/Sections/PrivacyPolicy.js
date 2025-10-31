import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, Info, Lock, Share2, Target, Zap } from "lucide-react"; // Importing professional icons

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    // 1. Page Container with Subtle Blue Background
    <div className="bg-blue-50/50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      
      {/* 2. Main Content Card (Elevated and Professional) */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-8 md:p-12 border border-blue-100">
        
        {/* Header Section */}
        <header className="mb-10 pb-4 border-b-2 border-blue-100">
          <div className="flex items-center space-x-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
              QuickAid <span className="text-4xl font-bold text-blue-600">Privacy Policy</span>
            </h1>
          </div>
        </header>

        {/* Introduction */}
        <p className="text-slate-700 mb-8 text-lg leading-relaxed border-l-4 border-blue-300 pl-4 py-2 bg-blue-50/50 rounded-md">
          QuickAid values your privacy. This policy explains how we collect, use,
          and protect your personal information to ensure trust and transparency in the delivery of aid services.
        </p>

        {/* Policy Sections */}
        <section className="space-y-8">

          {/* 1. Information We Collect */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Info className="w-5 h-5 mr-3 text-blue-600" /> 1. Information We Collect
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              We may collect personal details such as name, contact number, address, and demographic information. This data is essential for verifying eligibility and processing your request for urgent assistance.
            </p>
          </div>

          {/* 2. How We Use Information */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Target className="w-5 h-5 mr-3 text-blue-600" /> 2. How We Use Information
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              Information is used solely for verifying eligibility, processing aid requests, and for internal reporting to improve QuickAid services and efficiency. We do not use your data for marketing purposes.
            </p>
          </div>

          {/* 3. Information Sharing */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Share2 className="w-5 h-5 mr-3 text-blue-600" /> 3. Information Sharing
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              Your data will only be shared with authorized government agencies or accredited partners as strictly required by law or to fulfill the aid request. We **will never sell or misuse** your personal information for commercial gain.
            </p>
          </div>

          {/* 4. Data Protection */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Lock className="w-5 h-5 mr-3 text-blue-600" /> 4. Data Protection
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              We apply industry-standard security measures, including end-to-end encryption, access controls, and regular audits, to safeguard your data from unauthorized access, disclosure, alteration, or destruction.
            </p>
          </div>

          {/* 5. Your Rights */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Zap className="w-5 h-5 mr-3 text-blue-600" /> 5. Your Rights
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              You maintain the right to request access, correction, or deletion of your personal data held by us. Please contact our dedicated support team via the contact section for any privacy-related requests.
            </p>
          </div>

          {/* 6. Cookies & Tracking (Simplified for Policy) */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Info className="w-5 h-5 mr-3 text-blue-600" /> 6. Cookies & Tracking
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              Any use of cookies or analytical tracking technologies is strictly limited to improving user experience and understanding operational performance. We do not use them for identifying or profiling individuals outside of our service scope.
            </p>
          </div>

          {/* 7. Policy Updates */}
          <div className="group">
            <h2 className="flex items-center text-2xl font-bold mt-6 mb-3 text-slate-800 border-l-4 border-blue-600 pl-3 transition-colors group-hover:border-blue-700">
              <Target className="w-5 h-5 mr-3 text-blue-600" /> 7. Policy Updates
            </h2>
            <p className="text-slate-700 leading-relaxed pl-8">
              We may update this Privacy Policy as our services evolve or legal requirements change. Changes will be communicated clearly and posted on this page with a revised "Last Updated" date.
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

export default PrivacyPolicy;