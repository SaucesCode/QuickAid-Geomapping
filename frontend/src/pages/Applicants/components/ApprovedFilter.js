import React, { useState } from "react";
import { Filter, RotateCcw, MapPin, Building2, Tags, Search, ChevronDown } from "lucide-react";
import { useLocationFilters } from "../../../hooks/useLocationFilters";
import { ASSISTANCE_TYPES } from "../../../utils/assistanceColors";

const ApprovedFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const { cities, barangays, isFetchingCities, isFetchingBarangays } =
    useLocationFilters(localFilters.city);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    if (field === "city") {
      setLocalFilters(prev => ({ ...prev, barangay: "" }));
    }
  };

  const handleReset = () => {
    const cleared = { city: "", barangay: "", type: "", search: "" };
    setLocalFilters(cleared);
    onFilterChange?.(cleared);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search Bar */}
        <div className="flex flex-col min-w-[240px] flex-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Search Applicant
          </label>
          <div className="relative group">
            <input
              type="text"
              value={localFilters.search || ""}
              onChange={e => handleChange("search", e.target.value)}
              placeholder="Enter name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700 hover:border-gray-400 placeholder:text-gray-400"
            />
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* City */}
        <FilterSelect
          icon={MapPin}
          label="City / Municipality"
          value={localFilters.city}
          onChange={value => handleChange("city", value)}
          disabled={isFetchingCities}
        >
          <option value="">{isFetchingCities ? "Loading cities..." : "All Cities"}</option>
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
                ? "Loading barangays..."
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
          {ASSISTANCE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </FilterSelect>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all border border-gray-300 hover:border-red-200 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border border-transparent"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ icon: Icon, label, value, onChange, disabled, children }) => (
  <div className="flex flex-col min-w-[180px] flex-1 lg:flex-none">
    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-blue-600" />}
      {label}
    </label>
    <div className="relative group">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700 hover:border-gray-400 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export default ApprovedFilter;