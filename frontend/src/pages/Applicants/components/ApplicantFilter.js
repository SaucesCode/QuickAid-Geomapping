import React, { useState } from "react";
import {
  Calendar,
  Filter,
  RotateCcw,
  MapPin,
  Building2,
  Tags,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

const ApplicantsFilter = ({ filters, onFilterChange, searchTerm, onSearchChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
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
    queryKey: ["barangaysByCity", localFilters.city],
    queryFn: async () => {
      if (!localFilters.city) return [];
      const res = await api.get(`/applicant-locations/filters/?city=${localFilters.city}`);
      return res.data.barangays || [];
    },
    enabled: !!localFilters.city,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    if (field === "city") {
      setLocalFilters(prev => ({ ...prev, barangay: "" }));
    }
  };

  const handleReset = () => {
    const cleared = { city: "", barangay: "", type: "", start: "", end: "" };
    setLocalFilters(cleared);
    setLocalSearch("");
    onFilterChange?.(cleared);
    onSearchChange?.("");
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onSearchChange(localSearch);
  };

  // Check if any filters are active
  const hasActiveFilters =
    localFilters.city ||
    localFilters.barangay ||
    localFilters.type ||
    localFilters.start ||
    localFilters.end ||
    localSearch;

  return (
    <div className="space-y-4">
      {/* Header with Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar - Always Visible */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, contact, or ID..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
            hasActiveFilters && !isExpanded
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && !isExpanded && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(localFilters).filter(v => v).length + (localSearch ? 1 : 0)}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all border border-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#003a76] text-white hover:bg-blue-700 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border-2 border-gray-200 space-y-4 animate-slideDown">
          {/* Filter Title */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <div className="p-1.5 bg-[#003a76] rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Advanced Filters</h3>
              <p className="text-xs text-gray-500">
                Narrow down your search with specific criteria
              </p>
            </div>
          </div>

          {/* Grid Layout - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* City */}
            <FilterSelect
              icon={MapPin}
              label="City"
              value={localFilters.city}
              onChange={value => handleChange("city", value)}
              disabled={isFetchingCities}
            >
              <option value="">{isFetchingCities ? "Loading..." : "All Cities"}</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </FilterSelect>

            {/* Barangay */}
            <FilterSelect
              icon={Building2}
              label="Barangay"
              value={localFilters.barangay}
              onChange={value => handleChange("barangay", value)}
              disabled={!localFilters.city || isFetchingBarangays}
            >
              <option value="">
                {localFilters.city
                  ? isFetchingBarangays
                    ? "Loading..."
                    : "All Barangays"
                  : "Select City First"}
              </option>
              {barangays.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </FilterSelect>

            {/* Assistance Type */}
            <FilterSelect
              icon={Tags}
              label="Assistance Type"
              value={localFilters.type}
              onChange={value => handleChange("type", value)}
            >
              <option value="">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Educational">Educational</option>
              <option value="Burial">Burial</option>
            </FilterSelect>

            {/* Date Range */}
            <DateInput
              icon={Calendar}
              label="Start Date"
              value={localFilters.start}
              onChange={value => handleChange("start", value)}
              max={localFilters.end || undefined}
            />
            <DateInput
              icon={Calendar}
              label="End Date"
              value={localFilters.end}
              onChange={value => handleChange("end", value)}
              min={localFilters.start || undefined}
            />
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Active Filters:</span>
              {localSearch && (
                <FilterTag
                  label={`Search: "${localSearch}"`}
                  onRemove={() => setLocalSearch("")}
                />
              )}
              {localFilters.city && (
                <FilterTag
                  label={`City: ${localFilters.city}`}
                  onRemove={() => handleChange("city", "")}
                />
              )}
              {localFilters.barangay && (
                <FilterTag
                  label={`Barangay: ${localFilters.barangay}`}
                  onRemove={() => handleChange("barangay", "")}
                />
              )}
              {localFilters.type && (
                <FilterTag
                  label={`Type: ${localFilters.type}`}
                  onRemove={() => handleChange("type", "")}
                />
              )}
              {localFilters.start && (
                <FilterTag
                  label={`From: ${localFilters.start}`}
                  onRemove={() => handleChange("start", "")}
                />
              )}
              {localFilters.end && (
                <FilterTag
                  label={`To: ${localFilters.end}`}
                  onRemove={() => handleChange("end", "")}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter Tag Component
const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

// Filter Select Component
const FilterSelect = ({ icon: Icon, label, value, onChange, disabled, children }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-700 hover:border-gray-300 appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        {children}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  </div>
);

// Date Input Component
const DateInput = ({ icon: Icon, label, value, onChange, min, max }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-700 hover:border-gray-300 cursor-pointer"
    />
  </div>
);

export default ApplicantsFilter;
