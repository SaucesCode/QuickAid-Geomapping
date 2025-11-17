import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, ArrowLeft, ClipboardList, Award } from "lucide-react";

import logo from "../../assets/quickaid-text.png";

const PrintPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const applicant = state?.applicant;

    // Core Logic: Navigation guard
    if (!applicant) {
        // Use replace to prevent back button from going to a null state
        navigate("/dashboard", { replace: true });
        return null;
    }

    // Format the applicant's name for display
    const applicantName = applicant.full_name || "Applicant N/A";

    return (
        // Changed main page background from gray-100 to white
        <div className="min-h-screen bg-white py-10 px-4">
            {/* Container for the entire print/download interface */}
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-5xl mx-auto border border-gray-300">
                
                {/* TOP BAR / BACK NAVIGATION (no-print) */}
                <div className="no-print bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        // Changed button colors to use gray for a neutral look
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center gap-2 text-sm hover:bg-gray-100 transition border border-gray-300"
                    >
                        <ArrowLeft size={16} className="text-gray-700" /> Back to Dashboard
                    </button>
                    {/* Kept logo but made it slightly darker for contrast */}
                    <img src={logo} alt="QuickAid Logo" className="w-28 opacity-90" />
                </div>

                {/* DOCUMENT HEADER */}
                {/* Changed gradient background to a light gray and text to black */}
                <div className="px-8 py-8 bg-gray-100 text-gray-800 border-b border-gray-300">
                    <h1 className="text-3xl text-gray-900 font-bold tracking-tight">
                        Document Download Center
                    </h1>
                    <p className="text-gray-700 mt-2 text-lg">
                        <span className="font-semibold">Applicant:</span> {applicantName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Generated Date: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* MAIN ACTION AREA */}
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-8 border-b border-gray-300 pb-3">
                        Available Documents
                    </h2>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        
                        {/* Intake Sheet Card */}
                        <div className="flex-1 max-w-xs border border-gray-300 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                            {/* Changed icon and title colors to dark gray */}
                            <ClipboardList className="text-gray-700 mb-3" size={32} />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Intake Sheet</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Full record of the applicant's initial registration details and background.
                            </p>
                            {/* Changed button to a dark monochromatic color (black/gray) */}
                            <button
                                onClick={() => navigate(`/print/intake`, { state: { applicant: applicant } })}
                                className="w-full px-5 py-2.5 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-black transition"
                            >
                                <FileDown size={18} /> Download
                            </button>
                        </div>

                        {/* Certificate Card */}
                        <div className="flex-1 max-w-xs border border-gray-300 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                            {/* Changed icon and title colors to dark gray */}
                            <Award className="text-gray-700 mb-3" size={32} />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate of Eligibility</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Official document certifying the applicant's final qualification status.
                            </p>
                            {/* Changed button to a dark monochromatic color (black/gray) */}
                            <button
                                onClick={() => navigate(`/print/certificate`, { state: { applicant: applicant } })}
                                className="w-full px-5 py-2.5 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-black transition"
                            >
                                <FileDown size={18} /> Download
                            </button>
                        </div>

                    </div>
                </div>

                {/* FOOTER (Optional, for more professional look) */}
                <div className="no-print border-t border-gray-300 text-center text-xs text-gray-500 py-4 mt-8">
                    &copy; {new Date().getFullYear()} QuickAid. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default PrintPage;