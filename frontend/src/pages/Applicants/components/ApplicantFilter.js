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

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleApply()}
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              hasActiveFilters && !isExpanded
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="p-2 bg-gray-50 text-gray-500 hover:text-gray-700 rounded-lg border border-gray-200 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleApply}
            className="px-4 py-2 bg-[#003a76] text-white hover:bg-[#002d5c] rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            Search
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FilterSelect
              icon={MapPin}
              label="City"
              value={localFilters.city}
              onChange={value => handleChange("city", value)}
              disabled={isFetchingCities}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              icon={Building2}
              label="Barangay"
              value={localFilters.barangay}
              onChange={value => handleChange("barangay", value)}
              disabled={!localFilters.city || isFetchingBarangays}
            >
              <option value="">{localFilters.city ? "All Barangays" : "Select City"}</option>
              {barangays.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              icon={Tags}
              label="Type"
              value={localFilters.type}
              onChange={value => handleChange("type", value)}
            >
              <option value="">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Educational">Educational</option>
              <option value="Burial">Burial</option>
            </FilterSelect>

            <DateInput
              icon={Calendar}
              label="Start Date"
              value={localFilters.start}
              onChange={value => handleChange("start", value)}
              max={localFilters.end}
            />
            <DateInput
              icon={Calendar}
              label="End Date"
              value={localFilters.end}
              onChange={value => handleChange("end", value)}
              min={localFilters.start}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FilterSelect = ({ icon: Icon, label, value, onChange, disabled, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-xs focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer pr-7 disabled:bg-gray-50"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const DateInput = ({ icon: Icon, label, value, onChange, min, max }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white text-xs focus:border-blue-500 outline-none transition-all"
    />
  </div>
);

export default ApplicantsFilter;
