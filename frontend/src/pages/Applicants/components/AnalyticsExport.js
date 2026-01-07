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
  ChevronDown,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "../../../components/CustomToast";

const AnalyticsExport = () => {
  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [selectedAssistanceTypes, setSelectedAssistanceTypes] = useState([]);
  const [exportFormat, setExportFormat] = useState("both");

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [dateError, setDateError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch available filter options
  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["analytics-filters", selectedCity],
    queryFn: async () => {
      const cityParam = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : "";
      const response = await api.get(`/export/filters/${cityParam}`);
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

  // Toggle item in array
  const toggleItem = (item, setter, state) => {
    setter(state.includes(item) ? state.filter(i => i !== item) : [...state, item]);
  };

  // Handle city selection (single-select)
  const handleCityToggle = city => {
    if (selectedCity === city) {
      setSelectedCity("");
      setSelectedBarangays([]);
    } else {
      setSelectedCity(city);
      setSelectedBarangays([]);
      setOpenDropdown(null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCity("");
    setSelectedBarangays([]);
    setSelectedAssistanceTypes([]);
  };

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
      toast.custom(t => <CustomToast t={t} type="analyticsExport" />, {
        duration: 4000,
        position: "top-right",
      });
    },
    onError: err => {
      console.error("Analytics export failed:", err);
      toast.error(`Analytics export failed: ${err.message}`, {
        duration: 4000,
        position: "top-right",
      });
    },
  });

  // Handle export
  const handleExport = () => {
    if (dateError) {
      toast.error("⚠ Please fix the date range first.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    const filters = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      city: selectedCity || undefined,
      barangays: selectedBarangays.length > 0 ? selectedBarangays : undefined,
      assistance_types:
        selectedAssistanceTypes.length > 0 ? selectedAssistanceTypes : undefined,
    };

    analyticsMutation.mutate({ filters, format: exportFormat });
  };

  // Custom Dropdown Component (matches ApplicantsExport)
  const CustomDropdown = ({
    title,
    items = [],
    selected = [],
    onSelect,
    onClear,
    disabled = false,
    loading = false,
    singleSelect = false,
    placeholder = "Select...",
    showNames = false,
  }) => {
    const isOpen = openDropdown === title;
    const hasSelection = selected.length > 0;

    const getDisplayText = () => {
      if (loading) return "Loading...";
      if (!hasSelection) return placeholder;
      if (singleSelect) return selected[0];
      return `${selected.length} selected`;
    };

    return (
      <div className="relative">
        <label className="block mb-2 font-semibold text-gray-700 text-sm">{title}</label>
        <button
          type="button"
          onClick={() => !disabled && setOpenDropdown(isOpen ? null : title)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 text-left border rounded-lg bg-white transition-all flex items-center justify-between ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          } ${isOpen ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-300"}`}
        >
          <span className={`text-sm truncate ${hasSelection ? "text-gray-900" : "text-gray-500"}`}>
            {getDisplayText()}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {hasSelection && !disabled && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                onClick={e => {
                  e.stopPropagation();
                  onClear();
                }}
              />
            )}
            {!hasSelection && (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </button>

        {showNames && selected.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.map((item, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
              >
                {item}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                  onClick={() => onSelect(item)}
                />
              </span>
            ))}
          </div>
        )}

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No options available</div>
            ) : (
              <div className="py-1">
                {items.map((item, idx) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (!e.target.closest(".relative")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatOptions = [
    { value: "pdf", label: "PDF Only", icon: FileText },
    { value: "excel", label: "Excel Only", icon: FileSpreadsheet },
    { value: "both", label: "Both Formats", icon: Files },
  ];

  const hasActiveFilters =
    startDate ||
    endDate ||
    selectedCity ||
    selectedBarangays.length > 0 ||
    selectedAssistanceTypes.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-900">Generate comprehensive analytics report</p>
          <p className="text-xs text-indigo-700 mt-1">
            Includes summary statistics, geographic analysis, demographics, trends, performance
            metrics, and recommendations.
          </p>
        </div>
      </div>

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
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                <span className={`font-medium text-sm ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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

      {showFilters && (
        <div className="space-y-5 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                />
                {startDate && (
                  <button onClick={() => setStartDate("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  max={filterOptions?.date_range?.latest}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                />
                {endDate && (
                  <button onClick={() => setEndDate("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {dateError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {dateError}
              </div>
            )}
          </div>

          <CustomDropdown
            title="City"
            items={filterOptions?.cities || []}
            selected={selectedCity ? [selectedCity] : []}
            onSelect={handleCityToggle}
            onClear={() => {
              setSelectedCity("");
              setSelectedBarangays([]);
            }}
            loading={filtersLoading}
            singleSelect={true}
            placeholder="Search city..."
          />

          <CustomDropdown
            title="Barangays"
            items={filterOptions?.barangays || []}
            selected={selectedBarangays}
            onSelect={b => toggleItem(b, setSelectedBarangays, selectedBarangays)}
            onClear={() => setSelectedBarangays([])}
            loading={filtersLoading}
            disabled={!selectedCity}
            placeholder="Select city first"
            showNames={true}
          />

          <CustomDropdown
            title="Assistance Types"
            items={filterOptions?.assistance_types || []}
            selected={selectedAssistanceTypes}
            onSelect={t => toggleItem(t, setSelectedAssistanceTypes, selectedAssistanceTypes)}
            onClear={() => setSelectedAssistanceTypes([])}
            loading={filtersLoading}
            placeholder="Search assistance types..."
            showNames={true}
          />

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors border border-red-200"
            >
              <X className="w-4 h-4" /> Clear All Filters
            </button>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleExport}
          disabled={analyticsMutation.isPending || dateError || filtersLoading}
          className="relative overflow-hidden flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all text-white"
        >
          {analyticsMutation.isPending && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-800"
              style={{ animation: "progress 3s ease-out forwards" }}
            />
          )}
          <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
          <span className="relative z-10 flex items-center gap-2">
            {analyticsMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-white" />
                <span className="text-white">Generate Report</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsExport;