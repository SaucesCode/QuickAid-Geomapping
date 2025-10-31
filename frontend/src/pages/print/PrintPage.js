import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, UserPlus } from "lucide-react";
import logo from '../../assets/quickaid-text.png'; 

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  // Detect if staff is logged in (using in-memory storage instead of localStorage)
  // Logic remains unchanged
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
      {/* A4 Print Styling:
          - @page size: A4, margin: 10mm
          - Ensures content fits on one page.
      */}
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            color: #000 !important; /* Force all text to black for better print readability */
          }

          @page {
            size: A4;
            /* Using a smaller margin (5mm) to fit more content if necessary, 
              but 10mm is safe for most printers. Sticking to 10mm as requested/provided. */
            margin: 10mm; 
          }

          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }

          /* General Print Optimizations */
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            background-color: transparent !important;
          }
          
          /* Ensures the logo prints */
          .print-logo {
            width: 120px !important; /* Fixed width for print */
            max-width: 100% !important;
            height: auto !important;
          }

          /* Override specific element background to very light blue for accents */
          .bg-blue-50, .bg-blue-100 {
            background-color: #f0f8ff !important; /* Very light, printable blue tint */
          }
          
          /* Keep main accents for visual structure, but make them less intense */
          .bg-blue-600, .bg-blue-700 {
            background-color: #4a90e2 !important; /* Readable blue for accents */
          }

          .no-print { display: none !important; }
          
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

      {/* Blue Monochromatic Background (screen display) */}
      {/* Adjusted py-8 to py-6 to slightly reduce overall vertical height on screen/print preview */}
      <div className="min-h-screen bg-blue-50 py-6 px-4"> 
        {/* Main Content Container */}
        {/* Added a subtle shadow and border for a professional, card-like look */}
        <div className="print-container max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-blue-200 overflow-hidden border border-blue-100">

          {/* Header Section - Darker Monochromatic Blue */}
          <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-6 overflow-hidden"> {/* Reduced py-8 to py-6 */}
            {/* Modern/Professional UI Flair - subtle background shapes */}
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex flex-col">
                {/* Logo Image - Adjusted width to w-36 and added print-logo class */}
                <img 
                  src={logo} 
                  alt="QuickAid Logo"
                  className="w-36 mb-1 print-logo" 
                />

                {/* Subtitle - Lighter blue text for contrast */}
                <p className="text-blue-200 text-sm font-medium">
                  Social Assistance Application
                </p>
              </div>

              <div className="text-right bg-white bg-opacity-20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white border-opacity-30">
                <p className="font-semibold text-white text-sm">Document Date</p>
                {/* Lighter blue text for contrast */}
                <p className="text-blue-200 text-xs mt-1">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Document Title - Monochromatic Blue Accent */}
          <div className="bg-blue-50 px-8 py-4 border-b border-blue-200"> {/* Reduced py-5 to py-4 */}
            <h2 className="text-xl font-bold text-gray-800">
              Applicant Information Record
            </h2>
            {/* Main blue text for accent */}
            <p className="text-blue-600 mt-1 text-sm font-medium">
              Complete application details for assistance processing
            </p>
          </div>

          {/* Main Content - Reduced py-6 to py-5 for slight space saving */}
          <div className="px-8 py-5 text-sm"> 

            {/* Personal Information Section - Monochromatic Blue Accent */}
            <div className="mb-4"> {/* Reduced mb-6 to mb-4 */}
              <div className="flex items-center gap-2 mb-3"> {/* Reduced mb-4 to mb-3 */}
                {/* Accent bar in main blue */}
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div> {/* Reduced h-6 to h-5 */}
                <h3 className="text-lg font-bold text-gray-800">
                  Personal Information
                </h3>
              </div>
              {/* Background of info fields in a lighter blue shade with blue border */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200"> {/* Reduced p-5 to p-4, gap-4 to gap-3 */}
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

            {/* Full Name Display - Monochromatic Blue Accent - Strong highlight */}
            <div className="bg-blue-100 border-l-4 border-blue-600 p-3 mb-4 rounded-r-xl shadow-md"> {/* Reduced p-4 to p-3, mb-6 to mb-4 */}
              <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">Complete Name</p>
              <p className="text-lg font-bold text-gray-900">
                {applicant.background_info.first_name}{" "}
                {applicant.background_info.middle_initial}{" "}
                {applicant.background_info.last_name}
                {applicant.background_info.suffix && ` ${applicant.background_info.suffix}`}
              </p>
            </div>

            {/* Address Section - Monochromatic Blue Accent */}
            <div className="mb-4"> {/* Reduced mb-6 to mb-4 */}
              <div className="flex items-center gap-2 mb-3"> {/* Reduced mb-4 to mb-3 */}
                {/* Accent bar in main blue */}
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div> {/* Reduced h-6 to h-5 */}
                <h3 className="text-lg font-bold text-gray-800">
                  Address Information
                </h3>
              </div>
              {/* Background of info fields in a lighter blue shade */}
              <div className="grid grid-cols-2 gap-3 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-200"> {/* Reduced p-5 to p-4, gap-4 to gap-3 */}
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

              {/* Full Address Display - Subtle Monochromatic Blue Highlight */}
              <div className="p-3 bg-blue-100 rounded-xl border border-blue-200 shadow-md"> {/* Reduced p-4 to p-3 */}
                <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">Complete Address</p>
                <p className="text-gray-900 font-semibold text-base">
                  {applicant.background_info.street_address}, {applicant.background_info.barangay},{" "}
                  {applicant.background_info.barangay_details.city_name},{" "}
                  {applicant.background_info.barangay_details.province_name}
                </p>
              </div>
            </div>

            {/* Assistance Information - Monochromatic Blue Accent */}
            <div className="mb-4"> {/* Reduced mb-6 to mb-4 */}
              <div className="flex items-center gap-2 mb-3"> {/* Reduced mb-4 to mb-3 */}
                {/* Accent bar in main blue */}
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div> {/* Reduced h-6 to h-5 */}
                <h3 className="text-lg font-bold text-gray-800">
                  Assistance Details
                </h3>
              </div>
              {/* Background in lighter blue, border in main blue - Strong highlight for main detail */}
              <div className="bg-blue-100 border-l-4 border-blue-600 p-3 rounded-r-xl shadow-md"> {/* Reduced p-4 to p-3 */}
                <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">Type of Assistance Requested</p>
                <p className="text-lg font-bold text-gray-900">
                  {applicant.type_of_assistance}
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-blue-200 pt-3 mt-4"> {/* Reduced pt-4 to pt-3, mt-6 to mt-4 */}
              <p className="text-xs text-gray-500 text-center font-medium">
                Generated on {new Date().toLocaleString()} via QuickAid
              </p>
            </div>
          </div>

          {/* Action Buttons - Hidden on Print - All buttons now in blue/gray monochromatic */}
          <div className="no-print bg-blue-50 px-8 py-4 border-t border-blue-200"> {/* Reduced py-6 to py-4 */}
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Primary Blue Button - Print Document */}
              <button
                onClick={() => window.print()}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 duration-200 flex items-center gap-2 shadow-blue-400/50 hover:shadow-blue-500/50"
              >
                <Printer size={20} />
                Print Document
              </button>

              {/* Secondary Gray Button (Neutral, allowed in monochromatic) - Back to Dashboard */}
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 duration-200 flex items-center gap-2 shadow-gray-400/50 hover:shadow-gray-500/50"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>

              {/* Tertiary Blue Button - New Applicant */}
              <button
                onClick={() => navigate("/new-applicant")}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 duration-200 flex items-center gap-2 shadow-blue-300/50 hover:shadow-blue-400/50"
              >
                <UserPlus size={20} />
                New Applicant
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Reusable Info Field Component (Blue monochromatic styling)
const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    {/* Label text color adjusted for blue theme */}
    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{label}</p>
    <p className="text-gray-900 font-semibold text-sm">{value}</p>
  </div>
);

export default PrintPage;