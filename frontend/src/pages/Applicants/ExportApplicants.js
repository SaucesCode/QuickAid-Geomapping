import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Download, Calendar, FileText } from "lucide-react";

// --- API helper ---
const exportApplicants = async ({ startDate, endDate, assistanceType }) => {
  const params = new URLSearchParams();

  if (startDate) params.append("start_date", startDate);

  if (endDate) {
    // Add +1 day so backend includes the entire endDate
    const adjustedEnd = new Date(endDate);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    params.append("end_date", adjustedEnd.toISOString().split("T")[0]);
  }

  if (assistanceType) params.append("assistance_type", assistanceType);

  const response = await api.get(`/export-applicants/?${params.toString()}`, {
    responseType: "blob",
  });

  // Trigger file download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "applicants.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const ExportApplicants = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assistanceType, setAssistanceType] = useState("");

  // 🔹 Mutation for export action
  const exportMutation = useMutation({
    mutationFn: exportApplicants,
    onSuccess: () => {
      alert("✅ Data exported successfully!");
    },
    onError: err => {
      console.error("Export failed:", err);
      alert("❌ Export failed. Please try again.");
    },
  });

  const handleExport = () => {
    exportMutation.mutate({ startDate, endDate, assistanceType });
  };

  return (
    <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-blue-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-blue-50 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 leading-tight">
            Data Export Tool
          </h2>
          <p className="text-sm text-blue-700">
            Filter and generate applicants data for analysis.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-bold text-blue-800 mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-blue-300 rounded-xl pl-10 pr-3 py-2.5 text-blue-800 placeholder-blue-400
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-bold text-blue-800 mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-blue-300 rounded-xl pl-10 pr-3 py-2.5 text-blue-800 placeholder-blue-400
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Assistance Type */}
        <div>
          <label className="block text-sm font-bold text-blue-800 mb-2">Assistance Type</label>
          <select
            value={assistanceType}
            onChange={e => setAssistanceType(e.target.value)}
            className="w-full border border-blue-300 rounded-xl p-2.5 text-blue-800 bg-white shadow-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none appearance-none"
          >
            <option value="">All Types</option>
            <option value="Medical">Medical</option>
            <option value="Burial">Burial</option>
            <option value="Educational">Educational</option>
            <option value="Financial">Financial</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform 
            ${
              exportMutation.isPending
                ? "bg-blue-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-300/50 hover:shadow-blue-400/60 hover:scale-[1.02]"
            }`}
        >
          {exportMutation.isPending ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {exportMutation.isPending ? "Exporting..." : "Export Data to CSV"}
        </button>
      </div>
    </div>
  );
};

export default ExportApplicants;
