import React, { useState, useEffect } from "react";
import { Filter, RotateCcw, Calendar, Tags } from "lucide-react";

const AnalyticsFilter = ({ onFilterChange, extraFields = null }) => {
  const [filters, setFilters] = useState({
    type: "",
    start: "",
    end: "",
  });

  const [dateError, setDateError] = useState("");

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

      // Auto-fix invalid range
      if (name === "start" && updated.end && new Date(value) > new Date(updated.end)) {
        updated.end = value; // Force end date to match start date
      }

      return updated;
    });
  };

  const handleReset = () => {
    const cleared = { type: "", start: "", end: "" };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const handleApply = () => {
    if (!dateError) {
      onFilterChange?.(filters);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4 transition-all hover:shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Filter className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Filters</h3>
          <p className="text-xs text-gray-500">Refine your analytics data</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Assistance Type */}
        <FilterSelect
          icon={Tags}
          label="Assistance Type"
          name="type"
          value={filters.type}
          onChange={handleChange}
          options={[
            { value: "", label: "All Types" },
            { value: "Medical", label: "Medical" },
            { value: "Educational", label: "Educational" },
            { value: "Burial", label: "Burial" },
          ]}
        />

        {/* Date Range */}
        <DateInput
          icon={Calendar}
          label="Start Date"
          name="start"
          value={filters.start}
          onChange={handleChange}
          max={filters.end || undefined}
        />
        <DateInput
          icon={Calendar}
          label="End Date"
          name="end"
          value={filters.end}
          min={filters.start || undefined}
          onChange={handleChange}
        />

        {extraFields}

        {/* Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleApply}
            disabled={!!dateError}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              dateError
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:from-blue-600 hover:to-indigo-700"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Apply
          </button>
        </div>
      </div>

      {/* Date Range Error */}
      {dateError && <p className="text-red-600 text-sm mt-2 font-medium">{dateError}</p>}
    </div>
  );
};

const FilterSelect = ({ icon: Icon, label, name, value, onChange, options }) => (
  <div className="flex flex-col min-w-[140px]">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

const DateInput = ({ icon: Icon, label, name, value, onChange, min, max }) => (
  <div className="flex flex-col min-w-[140px]">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <input
      type="date"
      name={name}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 cursor-pointer"
    />
  </div>
);

export default AnalyticsFilter;
