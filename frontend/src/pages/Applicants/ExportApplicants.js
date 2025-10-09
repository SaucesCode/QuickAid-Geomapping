import React, { useState } from "react";
import { api } from "../../services/api";
import { Download, Calendar, FileText } from "lucide-react";

const ExportApplicants = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assistanceType, setAssistanceType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
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

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "applicants.csv");
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Export Applicants
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Assistance Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assistance Type
          </label>
          <select
            value={assistanceType}
            onChange={(e) => setAssistanceType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">All</option>
            <option value="Medical">Medical</option>
            <option value="Burial">Burial</option>
            <option value="Educational">Educational</option>
            <option value="Financial">Financial</option>
          </select>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleExport}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105"
          }`}
        >
          {loading ? (
            <span className="loading loading-spinner loading-md text-white"></span>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {loading ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
};

export default ExportApplicants;
