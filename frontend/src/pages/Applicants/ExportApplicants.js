import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Download, Calendar, BarChart3, Loader2, ChevronDown } from "lucide-react";

// --- API helper (NO CHANGES) ---
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

  // 🔹 Mutation for export action (NO CHANGES)
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
    // Consistent Card Style: Glass-morphism effect
    <div className="p-6 sm:p-8 bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 max-w-4xl mx-auto">
      {/* Header (Consistent Icon Wrapper) */}
      <div className="flex items-center gap-4 pb-4 border-b border-blue-100 mb-6">
        <div className="p-2 rounded-xl bg-blue-100/70 border border-blue-200">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
            Data Export Tool
          </h2>
          <p className="text-sm text-gray-500">
            Filter and generate applicants data for analysis.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              // Consistent Input Styling
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-3 py-3 text-gray-800 placeholder-gray-400
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none shadow-sm bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              // Consistent Input Styling
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-3 py-3 text-gray-800 placeholder-gray-400
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none shadow-sm bg-gray-50 text-sm"
            />
          </div>
        </div>

        {/* Assistance Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Assistance Type</label>
          <div className="relative">
            <select
              value={assistanceType}
              onChange={e => setAssistanceType(e.target.value)}
              // Consistent Select Styling
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 shadow-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none appearance-none pr-10 text-sm"
            >
              <option value="">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Burial">Burial</option>
              <option value="Educational">Educational</option>
              <option value="Financial">Financial</option>
              <option value="Other">Other</option>
            </select>
            {/* Custom chevron for consistent look */}
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Export Button (Consistent Gradient & Loader) */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-md transform 
            ${
              exportMutation.isPending
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-400/50 hover:shadow-lg hover:scale-[1.02]"
            }`}
        >
          {exportMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
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