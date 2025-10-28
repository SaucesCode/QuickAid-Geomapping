// src/components/AnalyticsFilter.jsx
import React, { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

const AnalyticsFilter = ({ onFilterChange, extraFields = null }) => {
  const [filters, setFilters] = useState({
    type: "",
    start: "",
    end: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleReset = () => {
    const cleared = { type: "", start: "", end: "" };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  return (
    // Monochromatic, Modern Container: Higher opacity white, prominent backdrop blur, blue shadow/border.
    <div className="bg-white/95 backdrop-blur-xl border border-blue-200 rounded-2xl p-6 shadow-2xl shadow-blue-100/50 mb-8 transition-all">
      <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
        {/* Assistance Type */}
        <FilterSelect
          label="Assistance Type"
          name="type"
          value={filters.type}
          onChange={handleChange}
          options={[
            { value: "", label: "All" },
            { value: "Medical", label: "Medical" },
            { value: "Educational", label: "Educational" },
            { value: "Burial", label: "Burial" },
          ]}
        />

        {/* Date Range */}
        <DateInput
          label="Start Date"
          name="start"
          value={filters.start}
          onChange={handleChange}
        />
        <DateInput label="End Date" name="end" value={filters.end} onChange={handleChange} />

        {/* Optional Extra Fields */}
        {extraFields}

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleReset}
            // Reset Button: Subtle blue background, dark blue text, active state
            className="flex items-center gap-1 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98] border border-blue-100"
          >
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
          {/* Filters Active Display: Prominent indigo accent text */}
          <div className="hidden md:flex items-center gap-2 px-3 py-3 text-indigo-600 border text-sm font-semibold border-indigo-100 bg-indigo-50 rounded-xl">
            <Filter className="w-4 h-4" />
            <span>Active Filters</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col min-w-[160px]">
    {/* Label: Subtle gray text */}
    <label className="text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      // Select Input: Clean white background, subtle border, indigo focus ring/border, taller padding
      className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-gray-700 shadow-sm hover:border-indigo-400 appearance-none"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col min-w-[160px]">
    {/* Label: Subtle gray text */}
    <label className="text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      // Date Input: Clean white background, subtle border, indigo focus ring/border, taller padding
      className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-gray-700 shadow-sm hover:border-indigo-400"
    />
  </div>
);

export default AnalyticsFilter;