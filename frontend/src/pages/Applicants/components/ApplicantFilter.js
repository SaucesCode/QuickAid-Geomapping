import React, { useState, useEffect } from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

const ApplicantsFilter = ({ filters, onFilterChange }) => {
  // Define a consistent, professional style for all select/input elements
  const filterInputClass =
    "w-full sm:w-auto border border-blue-300 rounded-lg px-3 py-2 bg-white text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none disabled:opacity-50 disabled:bg-blue-50/50";

  // Fetch city and barangay list dynamically
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

  const handleReset = () => {
    onFilterChange({
      city: "",
      barangay: "",
      type: "",
      start: "",
      end: "",
    });
  };

  return (
    // Outer container (uses the consistent card style from ArchiveApplicants.js)
    <div className="bg-white bg-opacity-90 backdrop-blur-xl shadow-xl rounded-3xl border border-blue-200 p-4 sm:p-5">
      
      {/* Responsive Filter Container: Stacks vertically on mobile, wraps horizontally on larger screens */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
        
        {/* Filter Title/Icon (Stays on the left on larger screens) */}
        <div className="flex items-center gap-2 text-lg text-blue-700 font-semibold flex-shrink-0 sm:pr-4">
          <Filter className="w-5 h-5 text-blue-500" /> 
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* City Filter */}
        <select
          value={filters.city}
          onChange={e => onFilterChange({ ...filters, city: e.target.value, barangay: "" })}
          className={filterInputClass}
        >
          <option value="">
            {isFetchingCities ? "Loading Cities..." : "All Cities"}
          </option>
          {!isFetchingCities &&
            cities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </select>

        {/* Barangay Filter */}
        <select
          value={filters.barangay}
          onChange={e => onFilterChange({ ...filters, barangay: e.target.value })}
          disabled={!filters.city || isFetchingBarangays}
          className={filterInputClass}
        >
          <option value="">
            {filters.city
              ? isFetchingBarangays
                ? "Loading Barangays..."
                : "All Barangays"
              : "Select City First"}
          </option>
          {!isFetchingBarangays &&
            barangays.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
        </select>

        {/* Type of Assistance Filter */}
        <select
          value={filters.type}
          onChange={e => onFilterChange({ ...filters, type: e.target.value })}
          className={filterInputClass}
        >
          <option value="">All Assistance Types</option>
          <option value="Medical">Medical</option>
          <option value="Educational">Educational</option>
          <option value="Burial">Burial</option>
        </select>

        {/* Date Range Inputs (use a flex group for consistency and responsiveness) */}
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
          <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 hidden sm:block" />
          <input
            type="date"
            value={filters.start}
            onChange={e => onFilterChange({ ...filters, start: e.target.value })}
            className={`${filterInputClass} flex-1`}
            aria-label="Start Date"
          />
          <span className="text-gray-500 hidden sm:block">to</span>
          <input
            type="date"
            value={filters.end}
            onChange={e => onFilterChange({ ...filters, end: e.target.value })}
            className={`${filterInputClass} flex-1`}
            aria-label="End Date"
          />
        </div>

        {/* Reset Button (Pushed to the far right on large screens) */}
        <button
          onClick={handleReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-blue-600 font-semibold border border-blue-400 hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" /> 
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ApplicantsFilter;