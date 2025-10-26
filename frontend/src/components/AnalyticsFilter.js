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
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-md mb-6 transition-all">
      <div className="flex flex-wrap items-end gap-4">
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
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <div className="hidden md:flex items-center gap-1 text-blue-600 font-semibold">
            <Filter className="w-4 h-4" />
            <span>Filters Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
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
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-600 mb-1">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
    />
  </div>
);

export default AnalyticsFilter;
