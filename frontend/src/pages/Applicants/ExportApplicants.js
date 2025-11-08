// src/pages/ExportPage.jsx
import React, { useState } from "react";
import { Download, Database, BarChart3 } from "lucide-react";
import AnalyticsExport from "./components/AnalyticsExport";
import ApplicantExport from "./components/ApplicantsExport";

const ExportApplicants = () => {
  const [activeTab, setActiveTab] = useState("applicants");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Export Center</h1>
              <p className="text-sm text-gray-500 mt-1">
                Download applicant data and analytics reports
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("applicants")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "applicants"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-b-4 border-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Database className="w-5 h-5" />
              Applicant Data (CSV)
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-b-4 border-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics Report
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "applicants" ? <ApplicantExport /> : <AnalyticsExport />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportApplicants;
