import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, ArrowLeft } from "lucide-react";

import logo from "../../assets/quickaid-text.png";

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  useEffect(() => {
    document.title = "QuickAid | Applicant Forms";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  if (!applicant) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-blue-100 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-6 flex justify-between items-center">
          <img src={logo} alt="QuickAid Logo" className="w-36" />
          <div className="text-right">
            <p className="font-semibold text-sm">Document Date</p>
            <p className="text-blue-100 text-xs mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="no-print flex justify-center flex-wrap gap-4 mt-8 pb-8">
          <button
            onClick={() => navigate(`/print/intake`, { state: { applicant: applicant } })}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FileDown size={18} /> Download Intake Sheet
          </button>

          <button
            onClick={() => navigate(`/print/certificate`, { state: { applicant: applicant } })}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FileDown size={18} /> Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPage;
