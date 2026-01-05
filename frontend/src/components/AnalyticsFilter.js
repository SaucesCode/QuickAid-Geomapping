import React, { useState, useEffect } from "react";
import {
  Filter,
  RotateCcw,
  Calendar,
  Tags,
  MapPin,
  Building2,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

const AnalyticsFilter = ({ onFilterChange, extraFields = null }) => {
  const [filters, setFilters] = useState({
    type: "",
    start: "",
    end: "",
    city: "",
    barangay: "",
  });

  const [selectedPreset, setSelectedPreset] = useState("");
  const [dateError, setDateError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch cities
  const { data: cities = [], isFetching: isFetchingCities } = useQuery({
    queryKey: ["citiesWithApplicants"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/filters/");
      return res.data.cities || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch barangays for selected city
  const { data: barangays = [], isFetching: isFetchingBarangays } = useQuery({
    queryKey: ["barangaysByCity", filters.city],
    queryFn: async () => {
      if (!filters.city) return [];
      const res = await api.get(`/applicant-locations/filters/?city=${filters.city}`);
      return res.data.barangays || [];
    },
    enabled: !!filters.city,
    staleTime: 1000 * 60 * 5,
  });

  // Date presets
  const datePresets = [
    { value: "today", label: "Today", days: 0 },
    { value: "7days", label: "7 Days", days: 7 },
    { value: "30days", label: "30 Days", days: 30 },
    { value: "3months", label: "3 Months", days: 90 },
    { value: "6months", label: "6 Months", days: 180 },
    { value: "1year", label: "1 Year", days: 365 },
  ];

  // Apply date preset
  const applyDatePreset = preset => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    let updatedFilters;
    if (preset === "today") {
      updatedFilters = { ...filters, start: endDate, end: endDate };
    } else {
      const daysAgo = datePresets.find(p => p.value === preset)?.days || 30;
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - daysAgo);
      const start = startDate.toISOString().split("T")[0];
      updatedFilters = { ...filters, start, end: endDate };
    }

    setFilters(updatedFilters);
    setSelectedPreset(preset);
    onFilterChange?.(updatedFilters); // ✅ Auto-apply immediately
  };

  // Validate date range
  useEffect(() => {
    const { start, end } = filters;
    if (start && end && new Date(start) > new Date(end)) {
      setDateError("End date cannot be earlier than start date.");
    } else {
      setDateError("");
    }
  }, [filters.start, filters.end]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => {
      let updated = { ...prev, [name]: value };
      if (name === "start" && updated.end && new Date(value) > new Date(updated.end)) {
        updated.end = value;
      }
      if (name === "city") {
        updated.barangay = "";
      }

      // ✅ Auto-apply filters immediately
      onFilterChange?.(updated);
      return updated;
    });

    if (name === "start" || name === "end") {
      setSelectedPreset("");
    }
  };

  const handleReset = () => {
    const cleared = { type: "", start: "", end: "", city: "", barangay: "" };
    setFilters(cleared);
    setSelectedPreset("");
    onFilterChange?.(cleared); // ✅ Auto-apply reset
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v) || selectedPreset;
  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Filters</h3>
            <p className="text-xs text-gray-500">Refine your analytics data</p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
            hasActiveFilters && !isExpanded
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>{isExpanded ? "Hide" : "Show"} More Filters</span>
          {hasActiveFilters && !isExpanded && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ✅ Quick Date Range - Always Visible */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 mb-3">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Quick Date Range
        </label>
        <div className="flex flex-wrap gap-1.5">
          {datePresets.map(preset => (
            <button
              key={preset.value}
              onClick={() => applyDatePreset(preset.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedPreset === preset.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {isExpanded && (
        <div className="space-y-4 animate-slideDown">
          {/* Main Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Location Filters Group */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </h4>
              <div className="space-y-2">
                <CompactSelect
                  label="City"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  disabled={isFetchingCities}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </CompactSelect>

                <CompactSelect
                  label="Barangay"
                  name="barangay"
                  value={filters.barangay}
                  onChange={handleChange}
                  disabled={!filters.city || isFetchingBarangays}
                >
                  <option value="">
                    {filters.city ? "All Barangays" : "Select City First"}
                  </option>
                  {barangays.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </CompactSelect>
              </div>
            </div>

            {/* Assistance Type Group */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
                <Tags className="w-3 h-3" />
                Assistance
              </h4>
              <CompactSelect
                label="Type"
                name="type"
                value={filters.type}
                onChange={handleChange}
              >
                <option value="">All Types</option>
                <option value="Medical">Medical</option>
                <option value="Educational">Educational</option>
                <option value="Burial">Burial</option>
              </CompactSelect>
            </div>

            {/* Custom Date Range Group */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Custom Range
              </h4>
              <div className="space-y-2">
                <CompactDateInput
                  label="Start"
                  name="start"
                  value={filters.start}
                  onChange={handleChange}
                  max={filters.end || undefined}
                />
                <CompactDateInput
                  label="End"
                  name="end"
                  value={filters.end}
                  onChange={handleChange}
                  min={filters.start || undefined}
                />
              </div>
            </div>
          </div>

          {/* Extra Fields */}
          {extraFields && <div className="pt-2 border-t border-gray-200">{extraFields}</div>}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 self-center mr-1">
                Active:
              </span>
              {selectedPreset && (
                <FilterTag
                  label={
                    datePresets.find(p => p.value === selectedPreset)?.label || selectedPreset
                  }
                  onRemove={() => {
                    setSelectedPreset("");
                    const cleared = { ...filters, start: "", end: "" };
                    setFilters(cleared);
                    onFilterChange?.(cleared); // ✅ Auto-apply
                  }}
                />
              )}
              {filters.city && (
                <FilterTag
                  label={filters.city}
                  onRemove={() => handleChange({ target: { name: "city", value: "" } })}
                />
              )}
              {filters.barangay && (
                <FilterTag
                  label={filters.barangay}
                  onRemove={() => handleChange({ target: { name: "barangay", value: "" } })}
                />
              )}
              {filters.type && (
                <FilterTag
                  label={filters.type}
                  onRemove={() => handleChange({ target: { name: "type", value: "" } })}
                />
              )}
              {filters.start && !selectedPreset && (
                <FilterTag
                  label={`From: ${filters.start}`}
                  onRemove={() => handleChange({ target: { name: "start", value: "" } })}
                />
              )}
              {filters.end && !selectedPreset && (
                <FilterTag
                  label={`To: ${filters.end}`}
                  onRemove={() => handleChange({ target: { name: "end", value: "" } })}
                />
              )}
            </div>
          )}

          {/* Error Message */}
          {dateError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600 font-medium">{dateError}</p>
            </div>
          )}

          {/* ✅ Only Reset Button - No Apply Button */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all border border-gray-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Compact Summary When Collapsed */}
      {!isExpanded && hasActiveFilters && (
        <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
          <span className="font-medium">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {selectedPreset && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                {datePresets.find(p => p.value === selectedPreset)?.label}
              </span>
            )}
            {filters.city && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {filters.city}
              </span>
            )}
            {filters.barangay && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {filters.barangay}
              </span>
            )}
            {filters.type && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {filters.type}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Components
const CompactSelect = ({ label, name, value, onChange, disabled, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-2 py-1.5 rounded-md border border-gray-300 bg-white text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all appearance-none cursor-pointer pr-6 disabled:opacity-50 disabled:bg-gray-100"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const CompactDateInput = ({ label, name, value, onChange, min, max }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      className="w-full px-2 py-1.5 rounded-md border border-gray-300 bg-white text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all"
    />
  </div>
);

const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
    >
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
);

export default AnalyticsFilter;
