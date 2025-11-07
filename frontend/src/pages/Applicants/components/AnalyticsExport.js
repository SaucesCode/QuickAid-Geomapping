import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";
import {
  Download,
  Calendar,
  Loader2,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Files,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";

export default function AnalyticsExport() {
  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [selectedAssistanceTypes, setSelectedAssistanceTypes] = useState([]);
  const [exportFormat, setExportFormat] = useState("both");

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [dateError, setDateError] = useState("");

  // Fetch available filter options
  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["analytics-filters"],
    queryFn: async () => {
      const response = await api.get("/export/filters/");
      return response.data;
    },
  });

  // Validate dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError("Start date must be before end date");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Export mutation
  const exportAnalytics = async ({ filters, format }) => {
    const response = await api.post("/export/analytics/", {
      format,
      filters,
      branding: {
        organization_name: "DSWD Quezon Province",
        primary_color: "#0066cc",
      },
    });

    const data = response.data;
    if (!data.success) throw new Error(data.error || "Failed to generate report");

    // Download files from base64
    const downloadFileFromBase64 = file => {
      const byteCharacters = atob(file.base64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.content_type });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    };

    if (data.files.pdf) downloadFileFromBase64(data.files.pdf);
    if (data.files.excel) downloadFileFromBase64(data.files.excel);

    return data;
  };

  const analyticsMutation = useMutation({
    mutationFn: exportAnalytics,
    onSuccess: () => {
      alert("✅ Analytics report exported successfully!");
    },
    onError: err => {
      console.error("Analytics export failed:", err);
      alert(`❌ Analytics export failed: ${err.message}`);
    },
  });

  // Handle multi-select for cities
  const toggleCity = city => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  // Handle multi-select for barangays
  const toggleBarangay = barangay => {
    setSelectedBarangays(prev =>
      prev.includes(barangay) ? prev.filter(b => b !== barangay) : [...prev, barangay]
    );
  };

  // Handle multi-select for assistance types
  const toggleAssistanceType = type => {
    setSelectedAssistanceTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCities([]);
    setSelectedBarangays([]);
    setSelectedAssistanceTypes([]);
  };

  // Handle export
  const handleExport = () => {
    if (dateError) {
      alert("Please fix date range errors before exporting");
      return;
    }

    const filters = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      cities: selectedCities.length > 0 ? selectedCities : undefined,
      barangays: selectedBarangays.length > 0 ? selectedBarangays : undefined,
      assistance_types:
        selectedAssistanceTypes.length > 0 ? selectedAssistanceTypes : undefined,
    };

    analyticsMutation.mutate({ filters, format: exportFormat });
  };

  const formatOptions = [
    { value: "pdf", label: "PDF Only", icon: FileText, color: "red" },
    { value: "excel", label: "Excel Only", icon: FileSpreadsheet, color: "green" },
    { value: "both", label: "Both (PDF & Excel)", icon: Files, color: "blue" },
  ];

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-7 h-7 text-blue-600" />
            Export Analytics Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate comprehensive analytics reports with customizable filters
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="space-y-5 mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          {/* Date Range */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  placeholder="Start Date"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  placeholder="End Date"
                />
              </div>
            </div>
            {dateError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {dateError}
              </div>
            )}
          </div>

          {/* Cities */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Cities {selectedCities.length > 0 && `(${selectedCities.length} selected)`}
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-white rounded-xl border border-gray-200">
              {filtersLoading ? (
                <span className="text-sm text-gray-400">Loading...</span>
              ) : filterOptions?.cities?.length > 0 ? (
                filterOptions.cities.map(city => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCities.includes(city)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-400">No cities available</span>
              )}
            </div>
          </div>

          {/* Barangays */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Barangays{" "}
              {selectedBarangays.length > 0 && `(${selectedBarangays.length} selected)`}
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-white rounded-xl border border-gray-200">
              {filtersLoading ? (
                <span className="text-sm text-gray-400">Loading...</span>
              ) : filterOptions?.barangays?.length > 0 ? (
                filterOptions.barangays.map(barangay => (
                  <button
                    key={barangay}
                    onClick={() => toggleBarangay(barangay)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBarangays.includes(barangay)
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {barangay}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-400">No barangays available</span>
              )}
            </div>
          </div>

          {/* Assistance Types */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Assistance Types{" "}
              {selectedAssistanceTypes.length > 0 &&
                `(${selectedAssistanceTypes.length} selected)`}
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-gray-200">
              {filtersLoading ? (
                <span className="text-sm text-gray-400">Loading...</span>
              ) : filterOptions?.assistance_types?.length > 0 ? (
                filterOptions.assistance_types.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleAssistanceType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedAssistanceTypes.includes(type)
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-400">No assistance types available</span>
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(startDate ||
            endDate ||
            selectedCities.length > 0 ||
            selectedBarangays.length > 0 ||
            selectedAssistanceTypes.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Export Format Selection */}
      <div className="mb-6">
        <label className="block mb-3 font-semibold text-gray-700 text-sm">Export Format</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {formatOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setExportFormat(option.value)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  exportFormat === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50 shadow-md`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    exportFormat === option.value
                      ? `text-${option.color}-600`
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`font-medium text-sm ${
                    exportFormat === option.value
                      ? `text-${option.color}-700`
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={analyticsMutation.isPending || dateError || filtersLoading}
        className="w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
      >
        {analyticsMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Report...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download Analytics Report</span>
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Report will include: Summary, Geographic Analysis, Demographics, Trends, Performance &
        Recommendations
      </p>
    </div>
  );
}
