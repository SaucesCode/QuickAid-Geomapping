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
  ChevronDown,
  Check,
} from "lucide-react";
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
  const [openDropdown, setOpenDropdown] = useState(null);

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
      setSelectedCity("");
      setSelectedBarangays([]);
    } else {
      setSelectedCity(city);
      setSelectedBarangays([]);
      setOpenDropdown(null);
    }
  };

  // Handle Select All for Barangays
  const handleSelectAllBarangays = () => {
    const allBarangays = filters?.barangays || [];
    if (selectedBarangays.length === allBarangays.length) {
      setSelectedBarangays([]);
    } else {
      setSelectedBarangays([...allBarangays]);
    }
    setOpenDropdown(null);
  };

  // Handle Select All for Assistance Types
  const handleSelectAllAssistanceTypes = () => {
    const allTypes = filters?.assistance_types || [];
    if (selectedAssistanceTypes.length === allTypes.length) {
      setSelectedAssistanceTypes([]);
    } else {
      setSelectedAssistanceTypes([...allTypes]);
    }
    setOpenDropdown(null);
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

  // Custom Dropdown Component
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
    showSelectAll = false,
    onSelectAll,
  }) => {
    const isOpen = openDropdown === title;
    const hasSelection = selected.length > 0;
    const allSelected = items.length > 0 && selected.length === items.length;

    const getDisplayText = () => {
      if (loading) return "Loading...";
      if (!hasSelection) return placeholder;
      if (singleSelect) return selected[0];
      
      // LOGIC: Show name if 1, otherwise show "X selected"
      if (showNames) {
        if (selected.length === 1) return selected[0];
        return `${selected.length} selected`;
      }
      
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

        {/* Selected Items Names at the Bottom when multiple are selected */}
        {showNames && selected.length > 0 && (
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
                {showSelectAll && (
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between border-b border-gray-200 font-semibold ${
                      allSelected
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span>Select All</span>
                    {allSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                )}
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Export applicant data as CSV</p>
          <p className="text-xs text-blue-700 mt-1">
            Download raw applicant records with customizable filters. Perfect for further
            analysis in Excel or other tools.
          </p>
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
  <label className="block mb-3 font-semibold text-gray-700 text-sm">
    Date Range
  </label>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Start Date */}
    <div>
      <label className="block mb-1 text-xs font-medium text-gray-600">
        Start Date
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          max={filters?.date_range?.latest}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
        />
        {startDate && (
          <button
            onClick={() => setStartDate("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>

    {/* End Date */}
    <div>
      <label className="block mb-1 text-xs font-medium text-gray-600">
        End Date
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          min={startDate}
          max={filters?.date_range?.latest}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
        />
        {endDate && (
          <button
            onClick={() => setEndDate("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
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
            items={filters?.cities || []}
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
            items={filters?.barangays || []}
            selected={selectedBarangays}
            onSelect={b => toggleItem(b, setSelectedBarangays, selectedBarangays)}
            onClear={() => setSelectedBarangays([])}
            loading={filtersLoading}
            disabled={!selectedCity}
            placeholder="Select city first"
            showNames={true}
            showSelectAll={true}
            onSelectAll={handleSelectAllBarangays}
          />

          <CustomDropdown
            title="Assistance Types"
            items={filters?.assistance_types || []}
            selected={selectedAssistanceTypes}
            onSelect={t => toggleItem(t, setSelectedAssistanceTypes, selectedAssistanceTypes)}
            onClear={() => setSelectedAssistanceTypes([])}
            loading={filtersLoading}
            placeholder="Search assistance types..."
            showNames={true}
            showSelectAll={true}
            onSelectAll={handleSelectAllAssistanceTypes}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors border border-red-200"
            >
              <X className="w-4 h-4" /> Clear All Filters
            </button>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleCSVExport}
          disabled={csvMutation.isPending || dateError}
          className="relative overflow-hidden flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all text-white"
        >
          {csvMutation.isPending && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-blue-800"
              style={{ animation: "progress 3s ease-out forwards" }}
            />
          )}
          <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
          <span className="relative z-10 flex items-center gap-2">
            {csvMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-white" />
                <span className="text-white">Download CSV</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ApplicantExport;