import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import logo from "../../assets/quickaid-text.png";

export default function PrintPageById() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
  document.title = "QuickAid | Applicant Forms";

  // 👇 remove the reset or make it blank
  return () => {
    document.title = "";
  };
}, []);


  // ---- Fetch Applicant ----
  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const response = await api.get(`/applicants/${id}/`);
        setApplicantData(response.data);
      } catch (err) {
        console.error("Error fetching applicant data:", err);
        setError("Failed to load applicant data.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicant();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading applicant data...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );

  if (!applicantData)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">No applicant data found.</p>
      </div>
    );

  // ---- Print/Page Styling ----
  const printStyle = `
    @page {
      size: A4;
      margin: 10mm;
    }
    @media print {
      body {
        background: white !important;
      }
      .page-break {
        page-break-before: always;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  return (
    <>
      <style>{printStyle}</style>

      <div className="min-h-screen bg-gray-50 py-6 px-4">
        {/* PRINT AREA */}
        <div
          ref={printRef}
          className="bg-white shadow-xl rounded-xl overflow-hidden border border-blue-100"
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-6 flex justify-between items-center">
            <img src={logo} alt="QuickAid Logo" className="w-36" />
            <div className="text-right">
              <p className="font-semibold text-sm">Document Date</p>
              <p className="text-blue-100 text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="no-print flex justify-center flex-wrap gap-4 mt-8">
          <button
            onClick={() => navigate("/print/intake", { state: { applicant: applicantData } })}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            🖨️ Print / Download Intake Sheet
          </button>

          <button
            onClick={() =>
              navigate("/print/certificate", { state: { applicant: applicantData } })
            }
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition"
          >
            🖨️ Print / Download Certificate
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-800 transition"
        >
          ← Back
        </button>
      </div>
    </>
  );
}
