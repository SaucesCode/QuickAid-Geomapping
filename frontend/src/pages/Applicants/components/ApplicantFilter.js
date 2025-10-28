import React, { useState, useEffect } from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

const ApplicantsFilter = ({ filters, onFilterChange }) => {
  // Fetch city and barangay list dynamically
  // ✅ Fetch list of cities that have applicants
  const { data: cities = [], isFetching: isFetchingCities } = useQuery({
    queryKey: ["citiesWithApplicants"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/filters/");
      return res.data.cities || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // ✅ Fetch barangays for selected city (only if city is selected)
  const { data: barangays = [], isFetching: isFetchingBarangays } = useQuery({
    queryKey: ["barangaysByCity", filters.city],
    queryFn: async () => {
      if (!filters.city) return [];
      const res = await api.get(`/applicant-locations/filters/?city=${filters.city}`);
      return res.data.barangays || [];
    },
    enabled: !!filters.city, // only run if a city is selected
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
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
    <div className="bg-white bg-opacity-90 backdrop-blur-xl shadow-xl rounded-3xl border border-blue-200 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-blue-600 font-semibold">
        <Filter className="w-5 h-5" /> Filters
      </div>

      <select
        value={filters.city}
        onChange={e => onFilterChange({ ...filters, city: e.target.value, barangay: "" })}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400"
      >
        <option value="">All Cities</option>
        {isFetchingCities ? (
          <option disabled>Loading...</option>
        ) : (
          cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))
        )}
      </select>

      <select
        value={filters.barangay}
        onChange={e => onFilterChange({ ...filters, barangay: e.target.value })}
        disabled={!filters.city || isFetchingBarangays}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
      >
        <option value="">All Barangays</option>
        {isFetchingBarangays ? (
          <option disabled>Loading...</option>
        ) : (
          barangays.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))
        )}
      </select>

      {/* Type of Assistance */}
      <select
        value={filters.type}
        onChange={e => onFilterChange({ ...filters, type: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400"
      >
        <option value="">All Assistance Types</option>
        <option value="Medical">Medical</option>
        <option value="Educational">Educational</option>
        <option value="Burial">Burial</option>
      </select>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <input
          type="date"
          value={filters.start}
          onChange={e => onFilterChange({ ...filters, start: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <span className="text-gray-600">to</span>
        <input
          type="date"
          value={filters.end}
          onChange={e => onFilterChange({ ...filters, end: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <button
        onClick={handleReset}
        className="ml-auto flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-700 font-semibold"
      >
        <RotateCcw className="w-4 h-4" /> Reset
      </button>
    </div>
  );
};

export default ApplicantsFilter;
