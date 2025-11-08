import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Reduced icon sizes from 32 to 24 or 16 where appropriate
import { FileDown, ArrowLeft, ClipboardList, Award, Loader } from "lucide-react"; 

import { api } from "../../services/api";
import logo from "../../assets/quickaid-text.png";

export default function PrintPageById() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [applicantData, setApplicantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Core Logic: Set document title
    useEffect(() => {
        document.title = "QuickAid | Applicant Documents";

        return () => {
            document.title = "";
        };
    }, []);

    // Core Logic: Fetch Applicant Data
    useEffect(() => {
        const fetchApplicant = async () => {
            // Small timeout to show loading state if fetch is too fast
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/applicants/${id}/`);
                setApplicantData(response.data);
            } catch (err) {
                console.error("Error fetching applicant data:", err);
                setError("Failed to load applicant data. Please check the ID.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicant();
    }, [id]);

    // --- Render Guards ---

    if (loading)
        return (
            // Reduced loader size and container padding
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <Loader size={28} className="text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium text-sm">Loading applicant data...</p>
            </div>
        );

    if (error)
        return (
            // Reduced padding and button size
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <p className="text-lg text-red-600 font-semibold p-6 bg-white rounded-lg shadow-lg border border-red-200 text-center">
                    {error}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-5 px-5 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 transition"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );

    if (!applicantData)
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-gray-600 p-6 bg-white rounded-lg shadow-lg text-sm">
                    No applicant data found for ID: {id}.
                </p>
            </div>
        );

    // --- Main Render ---

    const applicantName = applicantData.full_name || `Applicant ${id}`;

    return (
        // Reduced vertical padding and max-width from 5xl to 4xl
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
                {/* Reduced padding and font sizes */}
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
                        {/* Reduced card padding and content sizes */}
                        <div className="flex-1 max-w-xs border border-blue-200 rounded-xl p-4 bg-blue-50 shadow-sm hover:shadow-md transition duration-300">
                            <ClipboardList className="text-blue-600 mb-2" size={24} />
                            <h3 className="text-lg font-bold text-blue-800 mb-1">Intake Sheet</h3>
                            <p className="text-xs text-gray-600 mb-3">
                                Full record of the applicant's initial registration details and background.
                            </p>
                            {/* Reduced button padding */}
                            <button
                                onClick={() => navigate("/print/intake", { state: { applicant: applicantData } })}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                            >
                                <FileDown size={16} /> Download
                            </button>
                        </div>

                        {/* Certificate Card */}
                        {/* Reduced card padding and content sizes */}
                        <div className="flex-1 max-w-xs border border-green-200 rounded-xl p-4 bg-green-50 shadow-sm hover:shadow-md transition duration-300">
                            <Award className="text-green-600 mb-2" size={24} />
                            <h3 className="text-lg font-bold text-green-800 mb-1">Certificate of Eligibility</h3>
                            <p className="text-xs text-gray-600 mb-3">
                                Official document certifying the applicant's final qualification status.
                            </p>
                            {/* Reduced button padding */}
                            <button
                                onClick={() => navigate("/print/certificate", { state: { applicant: applicantData } })}
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
                    Viewing documents for Applicant ID: {id}
                </div>
            </div>
        </div>
    );
}