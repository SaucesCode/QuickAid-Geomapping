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

  const { data: cities = [], isFetching: isFetchingCities } = useQuery({
    queryKey: ["citiesWithApplicants"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/filters/");
      return res.data.cities || [];
    },
    staleTime: 1000 * 60 * 10,
  });

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
    if (field === "city") setLocalFilters(prev => ({ ...prev, barangay: "" }));
  };

  const handleClearField = (fieldName) => {
    setLocalFilters(prev => {
      let updated = { ...prev, [fieldName]: "" };
      if (fieldName === "city") {
        updated.barangay = "";
      }
      return updated;
    });
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

  const hasActiveFilters = Object.values(localFilters).some(v => v) || localSearch;
  const activeFilterCount = Object.values(localFilters).filter(v => v).length + (localSearch ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-6 py-5 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Applicants Search & Filters</h3>
              <p className="text-sm text-slate-500 mt-0.5">Find and filter applicants</p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
              hasActiveFilters && !isExpanded
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm hover:shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            }`}
          >
            <span className="font-semibold">{isExpanded ? "Hide" : "Show"} Filters</span>
            {hasActiveFilters && !isExpanded && (
              <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center font-bold shadow-sm">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${
                hasActiveFilters && !isExpanded ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Search Bar - Always Visible */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 rounded-xl p-4 border border-blue-200/60 shadow-sm">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Search Applicants
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleApply()}
                className="w-full pl-11 pr-10 py-2.5 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white shadow-sm hover:border-slate-300 font-medium text-slate-700 placeholder:text-slate-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
            >
              Search
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {isExpanded && (
          <div className="space-y-5 animate-slideDown mt-5">
            {/* Main Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Filters Group */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </h4>
                <div className="space-y-3">
                  <CompactSelect
                    label="City"
                    value={localFilters.city}
                    onChange={value => handleChange("city", value)}
                    onClear={() => handleClearField("city")}
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
                    value={localFilters.barangay}
                    onChange={value => handleChange("barangay", value)}
                    onClear={() => handleClearField("barangay")}
                    disabled={!localFilters.city || isFetchingBarangays}
                  >
                    <option value="">
                      {localFilters.city ? "All Barangays" : "Select City First"}
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
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Tags className="w-4 h-4 text-blue-600" />
                  Assistance Type
                </h4>
                <CompactSelect
                  label="Type"
                  value={localFilters.type}
                  onChange={value => handleChange("type", value)}
                  onClear={() => handleClearField("type")}
                >
                  <option value="">All Types</option>
                  <option value="Medical">Medical</option>
                  <option value="Educational">Educational</option>
                  <option value="Burial">Burial</option>
                </CompactSelect>
              </div>

              {/* Date Range Group */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Date Range
                </h4>
                <div className="space-y-3">
                  <CompactDateInput
                    label="Start Date"
                    value={localFilters.start}
                    onChange={value => handleChange("start", value)}
                    onClear={() => handleClearField("start")}
                    max={localFilters.end || undefined}
                  />
                  <CompactDateInput
                    label="End Date"
                    value={localFilters.end}
                    onChange={value => handleChange("end", value)}
                    onClear={() => handleClearField("end")}
                    min={localFilters.start || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 mr-1">
                    Active Filters:
                  </span>
                  {localSearch && (
                    <FilterTag
                      label={`Search: ${localSearch}`}
                      onRemove={() => setLocalSearch("")}
                    />
                  )}
                  {localFilters.city && (
                    <FilterTag
                      label={localFilters.city}
                      onRemove={() => handleClearField("city")}
                    />
                  )}
                  {localFilters.barangay && (
                    <FilterTag
                      label={localFilters.barangay}
                      onRemove={() => handleClearField("barangay")}
                    />
                  )}
                  {localFilters.type && (
                    <FilterTag
                      label={localFilters.type}
                      onRemove={() => handleClearField("type")}
                    />
                  )}
                  {localFilters.start && (
                    <FilterTag
                      label={`From: ${localFilters.start}`}
                      onRemove={() => handleClearField("start")}
                    />
                  )}
                  {localFilters.end && (
                    <FilterTag
                      label={`To: ${localFilters.end}`}
                      onRemove={() => handleClearField("end")}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Reset All Filters
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Compact Summary When Collapsed */}
        {!isExpanded && hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Active:</span>
              <div className="flex flex-wrap gap-2">
                {localSearch && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold text-xs shadow-sm">
                    Search: {localSearch.length > 20 ? localSearch.slice(0, 20) + "..." : localSearch}
                  </span>
                )}
                {localFilters.city && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {localFilters.city}
                  </span>
                )}
                {localFilters.barangay && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {localFilters.barangay}
                  </span>
                )}
                {localFilters.type && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {localFilters.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Components
const CompactSelect = ({ label, value, onChange, onClear, disabled, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed hover:border-slate-300 ${
          value && !disabled ? 'pr-10' : 'pr-8'
        }`}
      >
        {children}
      </select>
      {value && !disabled ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors z-10"
          type="button"
        >
          <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
        </button>
      ) : (
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
    </div>
  </div>
);

const CompactDateInput = ({ label, value, onChange, onClear, min, max }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all hover:border-slate-300 pr-10"
      />
      {value && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors z-10"
          type="button"
        >
          <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
        </button>
      )}
    </div>
  </div>
);

const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-semibold border-2 border-blue-200 shadow-sm">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-all duration-200 hover:scale-110"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default ApplicantsFilter;