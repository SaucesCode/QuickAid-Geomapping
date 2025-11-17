// src/components/exports/ApplicantExport.jsx
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
  FileSpreadsheet,
} from "lucide-react";
import FilterGroup from "./FilterGroup";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../../components/CustomToast";

const ApplicantExport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [selectedAssistanceTypes, setSelectedAssistanceTypes] = useState([]);
  const [dateError, setDateError] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Fetch filter options
  const { data: filters, isLoading: filtersLoading } = useQuery({
    queryKey: ["export-filters"],
    queryFn: async () => {
      const res = await api.get("/export/filters/");
      return res.data;
    },
  });

  // Validate date range
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setDateError("Start date must be before end date");
      } else {
        setDateError("");
      }
    } else setDateError("");
  }, [startDate, endDate]);

  // Toggle item in array
  const toggleItem = (item, setter, state) => {
    setter(state.includes(item) ? state.filter(i => i !== item) : [...state, item]);
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCities([]);
    setSelectedBarangays([]);
    setSelectedAssistanceTypes([]);
  };

  // Export CSV function
  const exportCSV = async ({
    startDate,
    endDate,
    selectedCities,
    selectedBarangays,
    selectedAssistanceTypes,
  }) => {
    const params = new URLSearchParams();

    if (startDate) params.append("start_date", startDate);
    if (endDate) {
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      params.append("end_date", adjustedEnd.toISOString().split("T")[0]);
    }
    selectedCities.forEach(city => params.append("cities", city));
    selectedBarangays.forEach(b => params.append("barangays", b));
    selectedAssistanceTypes.forEach(t => params.append("assistance_types", t));

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

  // Mutation for CSV export
  const csvMutation = useMutation({
    mutationFn: exportCSV,
    onSuccess: () => {
      toast.custom(t => <CustomToast t={t} type="applicantExport" />, {
        duration: 4000,
        position: "top-right",
      });
    },
    onError: err => {
      console.error("CSV export failed:", err);
      toast.error("CSV export failed. Please try again.", {
        duration: 5000,
        position: "top-right",
      });
    },
  });

  // Handle export button click
  const handleCSVExport = () => {
    if (dateError) {
      toast.error("⚠ Please fix the date range first.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    csvMutation.mutate({
      startDate,
      endDate,
      selectedCities,
      selectedBarangays,
      selectedAssistanceTypes,
    });
  };

  const hasActiveFilters =
    startDate ||
    endDate ||
    selectedCities.length ||
    selectedBarangays.length ||
    selectedAssistanceTypes.length;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Export applicant data as CSV</p>
          <p className="text-xs text-blue-700 mt-1">
            Download raw applicant records with customizable filters. Perfect for further
            analysis in Excel or other tools.
          </p>
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
        <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
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
                  max={filters?.date_range?.latest}
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
                  max={filters?.date_range?.latest}
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
            items={filters?.cities || []}
            selected={selectedCities}
            toggle={city => toggleItem(city, setSelectedCities, selectedCities)}
            loading={filtersLoading}
            color="blue"
          />

          {/* Barangays */}
          <FilterGroup
            title="Barangays"
            items={filters?.barangays || []}
            selected={selectedBarangays}
            toggle={b => toggleItem(b, setSelectedBarangays, selectedBarangays)}
            loading={filtersLoading}
            color="green"
          />

          {/* Assistance Types */}
          <FilterGroup
            title="Assistance Types"
            items={filters?.assistance_types || []}
            selected={selectedAssistanceTypes}
            toggle={t => toggleItem(t, setSelectedAssistanceTypes, selectedAssistanceTypes)}
            loading={filtersLoading}
            color="purple"
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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
          onClick={handleCSVExport}
          disabled={csvMutation.isPending || dateError}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
        >
          {csvMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {csvMutation.isPending ? "Exporting..." : "Download CSV"}
        </button>
      </div>
    </div>
  );
};

export default ApplicantExport;
