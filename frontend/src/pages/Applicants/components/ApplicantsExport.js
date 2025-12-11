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
import toast from "react-hot-toast";
import CustomToast from "../../../components/CustomToast";

const ApplicantExport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [selectedAssistanceTypes, setSelectedAssistanceTypes] = useState([]);
  const [dateError, setDateError] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Fetch filter options
  const { data: filters, isLoading: filtersLoading } = useQuery({
    queryKey: ["export-filters", selectedCity],
    queryFn: async () => {
      const cityParam = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : "";
      const res = await api.get(`/export/filters/${cityParam}`);
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

  // Handle city selection (single-select)
  const handleCityToggle = city => {
    if (selectedCity === city) {
      // Deselect city
      setSelectedCity("");
      setSelectedBarangays([]);
    } else {
      // Select new city and clear barangays
      setSelectedCity(city);
      setSelectedBarangays([]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCity("");
    setSelectedBarangays([]);
    setSelectedAssistanceTypes([]);
  };

  // Export CSV function
  const exportCSV = async ({
    startDate,
    endDate,
    selectedCity,
    selectedBarangays,
    selectedAssistanceTypes,
  }) => {
    const params = new URLSearchParams();

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (selectedCity) params.append("cities", selectedCity);

    selectedBarangays.forEach(b => params.append("barangays", b));
    selectedAssistanceTypes.forEach(t => params.append("assistance_types", t));

    const response = await api.get(`/export-applicants/?${params.toString()}`, {
      responseType: "blob",
    });

    // Download CSV
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
      selectedCity,
      selectedBarangays,
      selectedAssistanceTypes,
    });
  };

  const hasActiveFilters =
    startDate ||
    endDate ||
    selectedCity ||
    selectedBarangays.length > 0 ||
    selectedAssistanceTypes.length > 0;

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

          {/* City - Single Select (shows selected city in input) */}
          <FilterGroup
            title="City"
            items={filters?.cities || []}
            selected={selectedCity ? [selectedCity] : []}
            toggle={handleCityToggle}
            clearAll={() => {
              setSelectedCity("");
              setSelectedBarangays([]);
            }}
            loading={filtersLoading}
            singleSelect={true}
          />

          {/* Barangays - Multi Select (with "All Barangays" option) */}
          <FilterGroup
            title="Barangays"
            items={filters?.barangays || []}
            selected={selectedBarangays}
            toggle={b => toggleItem(b, setSelectedBarangays, selectedBarangays)}
            clearAll={() => setSelectedBarangays([])}
            loading={filtersLoading}
            disabled={!selectedCity}
            showAllOption={true}
            allOptionLabel="All Barangays"
          />

          {/* Assistance Types - Multi Select */}
          <FilterGroup
            title="Assistance Types"
            items={filters?.assistance_types || []}
            selected={selectedAssistanceTypes}
            toggle={t => toggleItem(t, setSelectedAssistanceTypes, selectedAssistanceTypes)}
            clearAll={() => setSelectedAssistanceTypes([])}
            loading={filtersLoading}
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
          className="relative overflow-hidden flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
        >
          {/* Progress bar background */}
          {csvMutation.isPending && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-800 to-indigo-800"
              style={{
                animation: "progress 3s ease-out forwards",
              }}
            />
          )}

          <style>{`
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `}</style>

          <span className="relative z-10 text-white flex items-center gap-2">
            {csvMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span className="text-white font-bold">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-white" />
                <span className="text-white font-bold">Download CSV</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ApplicantExport;
