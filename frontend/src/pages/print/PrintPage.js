import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  // Detect if staff is logged in (using in-memory storage instead of localStorage)
  const [isStaffLoggedIn] = React.useState(Boolean(state?.isStaffLoggedIn));

  useEffect(() => {
    document.title = "Quickaid | Print Applicant";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  useEffect(() => {
    if (!applicant) {
      if (isStaffLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [applicant, navigate, isStaffLoggedIn]);

  if (!applicant) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
          
          .no-print { display: none !important; }
          .print-container { 
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          
          body { 
            background: white;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2">
        <div className="print-container max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">QuickAid</h1>
                <p className="text-blue-100 text-xs">Social Assistance Application</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold">Document Date</p>
                <p className="text-blue-100">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="border-b-2 border-blue-600 px-6 py-3">
            <h2 className="text-lg font-bold text-gray-800">
              Applicant Information Record
            </h2>
            <p className="text-gray-600 mt-0.5 text-xs">
              Complete application details for assistance processing
            </p>
          </div>

          {/* Main Content */}
          <div className="px-6 py-4 text-sm">
            
            {/* Personal Information Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <InfoField 
                  label="First Name" 
                  value={applicant.background_info.first_name} 
                />
                <InfoField 
                  label="Middle Initial" 
                  value={applicant.background_info.middle_initial || "N/A"} 
                />
                <InfoField 
                  label="Last Name" 
                  value={applicant.background_info.last_name} 
                />
                <InfoField 
                  label="Suffix" 
                  value={applicant.background_info.suffix || "N/A"} 
                />
                <InfoField 
                  label="Date of Birth" 
                  value={formatDate(applicant.background_info.birthday)} 
                />
                <InfoField 
                  label="Sex" 
                  value={applicant.background_info.sex} 
                />
              </div>
            </div>

            {/* Full Name Display */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-2 mb-4">
              <p className="text-xs text-gray-600 mb-0.5">Complete Name</p>
              <p className="text-base font-semibold text-gray-800">
                {applicant.background_info.first_name}{" "}
                {applicant.background_info.middle_initial}{" "}
                {applicant.background_info.last_name}
                {applicant.background_info.suffix && ` ${applicant.background_info.suffix}`}
              </p>
            </div>

            {/* Address Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                Address Information
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <InfoField 
                  label="Street Address" 
                  value={applicant.background_info.street_address} 
                />
                <InfoField 
                  label="Barangay" 
                  value={applicant.background_info.barangay} 
                />
                <InfoField 
                  label="City/Municipality" 
                  value={applicant.background_info.barangay_details.city_name} 
                />
                <InfoField 
                  label="Province" 
                  value={applicant.background_info.barangay_details.province_name} 
                />
              </div>
              
              {/* Full Address Display */}
              <div className="p-2 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 mb-0.5">Complete Address</p>
                <p className="text-gray-800 font-medium text-sm">
                  {applicant.background_info.street_address}, {applicant.background_info.barangay},{" "}
                  {applicant.background_info.barangay_details.city_name},{" "}
                  {applicant.background_info.barangay_details.province_name}
                </p>
              </div>
            </div>

            {/* Assistance Information */}
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                Assistance Details
              </h3>
              <div className="bg-green-50 border-l-4 border-green-600 p-2">
                <p className="text-xs text-gray-600 mb-0.5">Type of Assistance Requested</p>
                <p className="text-base font-semibold text-gray-800">
                  {applicant.type_of_assistance}
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-gray-300 pt-2 mt-3">
              <p className="text-xs text-gray-500 text-center">
                Generated on {new Date().toLocaleString()} via QuickAid
              </p>
            </div>
          </div>

          {/* Action Buttons - Hidden on Print */}
          <div className="no-print bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                🖨️ Print Document
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                ← Back to Dashboard
              </button>

              <button
                onClick={() => navigate("/new-applicant")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                ➕ New Applicant
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Reusable Info Field Component
const InfoField = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-gray-800 font-medium text-sm">{value}</p>
  </div>
);

export default PrintPage;