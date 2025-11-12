import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, ArrowLeft, ClipboardList, Award } from "lucide-react";

import logo from "../../assets/quickaid-text.png";

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  // Core Logic: Set document title
  useEffect(() => {
    document.title = "QuickAid | Applicant Documents";

    return () => {
      document.title = "";
    };
  }, []);

  // Core Logic: Navigation guard
  if (!applicant) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  // Format the applicant's name for display
  const applicantName =
    `${applicant.background_info.first_name} ${applicant.background_info.last_name}` ||
    "Applicant N/A";

  return (
    // Reduced vertical padding and changed background to gray-100
    <div className="min-h-screen bg-gray-100 py-8 px-2">
      {/* Container for the document selection interface */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden max-w-4xl mx-auto border border-gray-200">
        {/* TOP BAR / BACK NAVIGATION */}
        {/* Reduced padding */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            // Reduced button padding
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center gap-2 text-sm hover:bg-gray-100 transition border"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <img src={logo} alt="QuickAid Logo" className="w-24 opacity-80" />
        </div>

        {/* DOCUMENT HEADER */}
        {/* Reduced padding and font sizes, blue gradient background */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <h1 className="text-2xl text-white font-bold tracking-tight">
            Document Download Center
          </h1>
          <p className="text-base text-white mt-2">
            <span className="text-white font-semibold">Applicant:</span> {applicantName}
          </p>
          <p className="text-xs text-blue-300 mt-1">
            Generated Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* MAIN ACTION AREA */}
        {/* Reduced padding and section title size */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
            Available Documents
          </h2>

          <div className="flex flex-col md:flex-row justify-center gap-5">
            {/* Intake Sheet Card */}
            {/* Reduced card padding and content sizes, blue theme */}
            <div className="flex-1 max-w-xs border border-blue-200 rounded-xl p-4 bg-blue-50 shadow-sm hover:shadow-md transition duration-300">
              <ClipboardList className="text-blue-600 mb-2" size={24} />
              <h3 className="text-lg font-bold text-blue-800 mb-1">General Intake Sheet</h3>
              <p className="text-xs text-gray-600 mb-3">
                Full record of the applicant's initial registration details and background.
              </p>
              {/* Reduced button padding */}
              <button
                onClick={() => navigate(`/print/intake`, { state: { applicant: applicant } })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                <FileDown size={16} /> Download
              </button>
            </div>

            {/* Certificate Card */}
            {/* Reduced card padding and content sizes, green theme */}
            <div className="flex-1 max-w-xs border border-green-200 rounded-xl p-4 bg-green-50 shadow-sm hover:shadow-md transition duration-300">
              <Award className="text-green-600 mb-2" size={24} />
              <h3 className="text-lg font-bold text-green-800 mb-1">
                Certificate of Eligibility
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Official document certifying the applicant's final qualification status.
              </p>
              {/* Reduced button padding */}
              <button
                onClick={() =>
                  navigate(`/print/certificate`, { state: { applicant: applicant } })
                }
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition"
              >
                <FileDown size={16} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {/* Reduced vertical padding and font size */}
        <div className="border-t border-gray-200 text-center text-[10px] text-gray-500 py-3">
          &copy; {new Date().getFullYear()} QuickAid. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PrintPage;
