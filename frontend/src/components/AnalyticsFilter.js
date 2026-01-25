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
import { useLocationFilters } from "../hooks/useLocationFilters";
import { ASSISTANCE_TYPES } from "../utils/assistanceColors";

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

  const { cities, barangays, isFetchingCities, isFetchingBarangays } =
    useLocationFilters(filters.city);

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
    onFilterChange?.(updatedFilters);
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

      onFilterChange?.(updated);
      return updated;
    });

    if (name === "start" || name === "end") {
      setSelectedPreset("");
    }
  };

  const handleClearField = fieldName => {
    setFilters(prev => {
      let updated = { ...prev, [fieldName]: "" };
      if (fieldName === "city") {
        updated.barangay = "";
      }
      onFilterChange?.(updated);
      return updated;
    });
  };

  const handleReset = () => {
    const cleared = { type: "", start: "", end: "", city: "", barangay: "" };
    setFilters(cleared);
    setSelectedPreset("");
    onFilterChange?.(cleared);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v) || selectedPreset;
  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-6 py-5 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#003a76] rounded-xl shadow-sm">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                Analytics Filters
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Customize your data view</p>
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
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              } ${
                hasActiveFilters && !isExpanded
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Quick Date Range - Always Visible */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 rounded-xl p-4 border border-blue-200/60 shadow-sm">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Quick Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            {datePresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => applyDatePreset(preset.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedPreset === preset.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "bg-white text-slate-700 hover:bg-blue-100 hover:text-blue-700 border-2 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow"
                }`}
              >
                {preset.label}
              </button>
            ))}
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
                    name="city"
                    value={filters.city}
                    onChange={handleChange}
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
                    name="barangay"
                    value={filters.barangay}
                    onChange={handleChange}
                    onClear={() => handleClearField("barangay")}
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
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Tags className="w-4 h-4 text-blue-600" />
                  Assistance Type
                </h4>
                <CompactSelect
                  label="Type"
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                  onClear={() => handleClearField("type")}
                >
                  <option value="">All Types</option>
                  {ASSISTANCE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </CompactSelect>
              </div>

              {/* Custom Date Range Group */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border-2 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Custom Date Range
                </h4>
                <div className="space-y-3">
                  <CompactDateInput
                    label="Start Date"
                    name="start"
                    value={filters.start}
                    onChange={handleChange}
                    onClear={() => handleClearField("start")}
                    max={filters.end || undefined}
                  />
                  <CompactDateInput
                    label="End Date"
                    name="end"
                    value={filters.end}
                    onChange={handleChange}
                    onClear={() => handleClearField("end")}
                    min={filters.start || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Extra Fields */}
            {extraFields && (
              <div className="pt-4 border-t-2 border-slate-200">{extraFields}</div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 mr-1">
                    Active Filters:
                  </span>
                  {selectedPreset && (
                    <FilterTag
                      label={
                        datePresets.find(p => p.value === selectedPreset)?.label ||
                        selectedPreset
                      }
                      onRemove={() => {
                        setSelectedPreset("");
                        const cleared = { ...filters, start: "", end: "" };
                        setFilters(cleared);
                        onFilterChange?.(cleared);
                      }}
                    />
                  )}
                  {filters.city && (
                    <FilterTag
                      label={filters.city}
                      onRemove={() => handleClearField("city")}
                    />
                  )}
                  {filters.barangay && (
                    <FilterTag
                      label={filters.barangay}
                      onRemove={() => handleClearField("barangay")}
                    />
                  )}
                  {filters.type && (
                    <FilterTag
                      label={filters.type}
                      onRemove={() => handleClearField("type")}
                    />
                  )}
                  {filters.start && !selectedPreset && (
                    <FilterTag
                      label={`From: ${filters.start}`}
                      onRemove={() => handleClearField("start")}
                    />
                  )}
                  {filters.end && !selectedPreset && (
                    <FilterTag
                      label={`To: ${filters.end}`}
                      onRemove={() => handleClearField("end")}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {dateError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="p-1 bg-red-100 rounded-lg">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm text-red-700 font-medium">{dateError}</p>
              </div>
            )}

            {/* Reset Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleReset}
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Reset All Filters
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
                {selectedPreset && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold text-xs shadow-sm">
                    {datePresets.find(p => p.value === selectedPreset)?.label}
                  </span>
                )}
                {filters.city && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {filters.city}
                  </span>
                )}
                {filters.barangay && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {filters.barangay}
                  </span>
                )}
                {filters.type && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                    {filters.type}
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
const CompactSelect = ({ label, name, value, onChange, onClear, disabled, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed hover:border-slate-300 ${
          value && !disabled ? "pr-10" : "pr-8"
        }`}
      >
        {children}
      </select>
      {value && !disabled ? (
        <button
          onClick={e => {
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

const CompactDateInput = ({ label, name, value, onChange, onClear, min, max }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <input
        type="date"
        name={name}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all hover:border-slate-300 pr-10"
      />
      {value && (
        <button
          onClick={e => {
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

export default AnalyticsFilter;
