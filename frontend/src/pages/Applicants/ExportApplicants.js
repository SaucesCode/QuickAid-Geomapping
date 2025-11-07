import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Download, Calendar, BarChart3, Loader2, ChevronDown } from "lucide-react";
import AnalyticsExport from "./components/AnalyticsExport";

const ExportApplicants = () => {
  // Filter options from API
  const [filters, setFilters] = useState({
    assistance_types: [],
    date_range: { earliest: "", latest: "" },
  });

  // Selected filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assistanceType, setAssistanceType] = useState("");

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get("/export/filters/");
        setFilters(res.data);
        setStartDate(res.data.date_range.earliest);
        setEndDate(res.data.date_range.latest);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  // CSV Export
  const exportCSV = async ({ startDate, endDate, assistanceType }) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) {
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      params.append("end_date", adjustedEnd.toISOString().split("T")[0]);
    }
    if (assistanceType) params.append("assistance_type", assistanceType);

    const response = await api.get(`/export-applicants/?${params.toString()}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "applicants.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const csvMutation = useMutation({
    mutationFn: exportCSV,
    onSuccess: () => alert("✅ CSV exported successfully!"),
    onError: err => {
      console.error("CSV export failed:", err);
      alert("❌ CSV export failed. Please try again.");
    },
  });

  const handleCSVExport = () => {
    csvMutation.mutate({ startDate, endDate, assistanceType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background blur shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                Data Export Tool
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Export applicant data and analytics reports in CSV, PDF, and Excel formats.
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export Section */}
        <div className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-blue-200">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-100 pb-4">
            <Download className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Export Applicants (CSV)</h2>
          </div>

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
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-3 py-3 text-gray-800 placeholder-gray-400
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none shadow-sm bg-gray-50 text-sm"
                />
              </div>
            </div>

            {/* Assistance Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Assistance Type
              </label>
              <div className="relative">
                <select
                  value={assistanceType}
                  onChange={e => setAssistanceType(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 shadow-sm
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none appearance-none pr-10 text-sm"
                >
                  <option value="">All Types</option>
                  {filters.assistance_types.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* CSV Export Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCSVExport}
              disabled={csvMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white
                         bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              {csvMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {csvMutation.isPending ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Analytics Export Section */}
        <div className="max-w-7xl mx-auto">
          <AnalyticsExport />
        </div>
      </div>
    </div>
  );
};

export default ExportApplicants;
