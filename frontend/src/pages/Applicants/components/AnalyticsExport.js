// src/components/exports/AnalyticsExport.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";
import {
  Download,
  Calendar,
  Loader2,
  Filter,
  X,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Files,
  BarChart3,
} from "lucide-react";
import FilterGroup from "./FilterGroup";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../../components/CustomToast";

const AnalyticsExport = () => {
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

  // Export analytics function
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

  // Mutation for analytics export
  const analyticsMutation = useMutation({
    mutationFn: exportAnalytics,
    onSuccess: () => {
      toast.custom(t => <CustomToast t={t} type="analyticsExport" />, { duration: 4000 });
    },
    onError: err => {
      console.error("Analytics export failed:", err);
      toast.error(`Analytics export failed: ${err.message}`, {
        duration: 5000,
      });
    },
  });

  // Toggle item in array
  const toggleItem = (item, setter, state) => {
    setter(state.includes(item) ? state.filter(i => i !== item) : [...state, item]);
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
    { value: "both", label: "Both Formats", icon: Files, color: "blue" },
  ];

  const hasActiveFilters =
    startDate ||
    endDate ||
    selectedCities.length ||
    selectedBarangays.length ||
    selectedAssistanceTypes.length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-indigo-900">
            Generate comprehensive analytics report
          </p>
          <p className="text-xs text-indigo-700 mt-1">
            Includes summary statistics, geographic analysis, demographics, trends, performance
            metrics, and recommendations.
          </p>
        </div>
      </div>

      {/* Export Format Selection */}
      <div>
        <label className="block mb-3 font-semibold text-gray-700 text-sm">Export Format</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {formatOptions.map(option => {
            const Icon = option.icon;
            const isSelected = exportFormat === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setExportFormat(option.value)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? `border-${option.color}-500 bg-${option.color}-50 shadow-md`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? `text-${option.color}-600` : "text-gray-400"
                  }`}
                />
                <span
                  className={`font-medium text-sm ${
                    isSelected ? `text-${option.color}-700` : "text-gray-700"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Filter Options</h3>
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
        <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
          {/* Date Range */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
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
          <FilterGroup
            title="Cities"
            items={filterOptions?.cities || []}
            selected={selectedCities}
            toggle={city => toggleItem(city, setSelectedCities, selectedCities)}
            loading={filtersLoading}
            color="blue"
          />

          {/* Barangays */}
          <FilterGroup
            title="Barangays"
            items={filterOptions?.barangays || []}
            selected={selectedBarangays}
            toggle={b => toggleItem(b, setSelectedBarangays, selectedBarangays)}
            loading={filtersLoading}
            color="green"
          />

          {/* Assistance Types */}
          <FilterGroup
            title="Assistance Types"
            items={filterOptions?.assistance_types || []}
            selected={selectedAssistanceTypes}
            toggle={t => toggleItem(t, setSelectedAssistanceTypes, selectedAssistanceTypes)}
            loading={filtersLoading}
            color="purple"
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleExport}
          disabled={analyticsMutation.isPending || dateError || filtersLoading}
          className="flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
        >
          {analyticsMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalyticsExport;
