import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileDown,
  ArrowLeft,
  ClipboardList,
  Award,
  Loader,
  AlertTriangle,
} from "lucide-react";

import { api } from "../../services/api";
import logo from "../../assets/quickaid-text.png";

// Import Design System Components
import {
  PageContainer,
  Card,
  GradientButton,
  OutlineButton,
  LoadingState,
} from "../../components/DesignSystem";

export default function PrintPageById() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Logic: Set document title - KEPT UNCHANGED
  useEffect(() => {
    document.title = "QuickAid | Applicant Documents";

    return () => {
      document.title = "";
    };
  }, []);

  // Core Logic: Fetch Applicant Data - KEPT UNCHANGED
  useEffect(() => {
    const fetchApplicant = async () => {
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
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <LoadingState message="Loading applicant data..." />
        </div>
      </PageContainer>
    );

  if (error)
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
          <Card className="max-w-md text-center bg-red-50 border-red-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-red-800">Error</h2>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <OutlineButton onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </OutlineButton>
          </Card>
        </div>
      </PageContainer>
    );

  if (!applicantData)
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="max-w-md text-center">
            <p className="text-gray-600">No applicant data found for ID: {id}.</p>
          </Card>
        </div>
      </PageContainer>
    );

  // --- Main Render ---

  const applicantName =
    `${applicantData.background_info.first_name} ${applicantData.background_info.last_name}` ||
    "Applicant N/A";

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* REDESIGNED: Top Navigation Bar */}
        <div className="flex justify-between items-center">
          <OutlineButton onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </OutlineButton>
          <img src={logo} alt="QuickAid Logo" className="w-28 opacity-90" />
        </div>

        {/* REDESIGNED: Document Header Card with Blue Accent */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileDown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Document Download Center
              </h1>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-700">Applicant:</span>
                  <span className="text-gray-800 font-medium">{applicantName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-700">Generated:</span>
                  <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* REDESIGNED: Available Documents Section */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Available Documents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intake Sheet Card */}
            <Card className="bg-blue-50 border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <ClipboardList className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">General Intake Sheet</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Full record of the applicant's initial registration details and background.
                </p>
                <GradientButton
                  onClick={() =>
                    navigate("/print/intake", { state: { applicant: applicantData } })
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <FileDown size={16} /> Download Intake Sheet
                </GradientButton>
              </div>
            </Card>

            {/* Certificate Card */}
            <Card className="bg-green-50 border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Certificate of Eligibility
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Official document certifying the applicant's final qualification status.
                </p>
                <GradientButton
                  onClick={() =>
                    navigate("/print/certificate", { state: { applicant: applicantData } })
                  }
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <FileDown size={16} /> Download Certificate
                </GradientButton>
              </div>
            </Card>
          </div>
        </Card>

        {/* REDESIGNED: Footer with Warning */}
        <div className="space-y-3">
          {/* Small Warning Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Important:</span> These documents are only
              accessible during this session. Please download or print all required documents
              before leaving this page.
            </p>
          </div>

          <Card className="text-center">
            <p className="text-xs text-gray-500">
              Viewing documents for Applicant ID:{" "}
              <span className="font-semibold text-blue-600">{id}</span> • &copy;{" "}
              {new Date().getFullYear()} QuickAid. All rights reserved.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
