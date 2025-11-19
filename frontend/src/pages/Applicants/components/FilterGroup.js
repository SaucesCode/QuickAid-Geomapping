import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

/**
 * Searchable dropdown filter with multi-select and chip display
 * Supports single-select mode without chips
 */
function FilterGroup({
  title,
  items,
  selected = [],
  toggle,
  loading,
  clearAll,
  singleSelect = false,
  disabled = false,
  showAllOption = false,
  allOptionLabel = "All",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Light blue color theme
  const colors = {
    bg: "bg-blue-100",
    hover: "hover:bg-blue-200",
    text: "text-blue-600",
    border: "border-blue-300",
    focus: "ring-blue-200",
    selectedBg: "bg-blue-50",
    hoverText: "hover:bg-blue-50",
    chipBg: "bg-blue-100",
    chipText: "text-blue-800",
    chipHover: "hover:bg-blue-200",
  };

  // Handle Clear All
  const handleClearAll = () => {
    clearAll?.();
    setSearchTerm("");
    setIsOpen(false);
  };

  const selectedCount = selected?.filter(Boolean).length || 0;
  const isAllSelected = showAllOption && selectedCount === 0;

  // Display count: if "All" is selected and showAllOption is true, show total items count
  const displayCount = isAllSelected ? items.length : selectedCount;

  // Determine display value for single-select
  const displayValue = singleSelect && selectedCount > 0 ? selected[0] : "";

  // Determine placeholder
  const getPlaceholder = () => {
    if (loading) return "Loading...";
    if (disabled) return "Select city first";
    if (singleSelect && displayValue) return displayValue;
    return `Search ${title.toLowerCase()}...`;
  };

  return (
    <div className="space-y-3">
      {/* Label with selected count */}
      <label className="block font-semibold text-gray-700 text-sm">
        {title}{" "}
        {displayCount > 0 && (
          <span className={`${colors.text} font-normal`}>({displayCount} selected)</span>
        )}
      </label>

      {/* Dropdown */}
      <div ref={dropdownRef} className="relative">
        <div
          className={`relative bg-white rounded-xl border-2 transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-300"
              : isOpen
              ? `${colors.border} ring-2 ${colors.focus} cursor-pointer`
              : "border-gray-200 hover:border-gray-300 cursor-pointer"
          }`}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClick={e => e.stopPropagation()}
            onFocus={() => !loading && !disabled && setIsOpen(true)}
            placeholder={getPlaceholder()}
            disabled={loading || disabled}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl outline-none text-sm bg-transparent ${
              loading || disabled ? "cursor-not-allowed" : "cursor-text"
            } ${singleSelect && displayValue ? "font-medium text-gray-700" : ""}`}
          />
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && !loading && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-xl max-h-64 overflow-hidden flex flex-col">
            {/* Clear All button */}
            {selectedCount > 0 && (
              <div className="flex justify-end p-2 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Options list */}
            <div className="overflow-y-auto">
              {/* Show "All" option if enabled */}
              {showAllOption && (
                <button
                  onClick={() => {
                    clearAll?.();
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-3 transition-colors font-medium ${
                    isAllSelected
                      ? `${colors.selectedBg} ${colors.text}`
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="flex-1">{allOptionLabel}</span>
                  {isAllSelected && (
                    <Check className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                  )}
                </button>
              )}

              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        toggle(item);
                        if (singleSelect) {
                          setIsOpen(false);
                          setSearchTerm("");
                        }
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? `${colors.selectedBg} ${colors.text} font-medium`
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex-1">{item}</span>
                      {isSelected && (
                        <Check className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected items as chips - Only show if NOT single-select */}
      {!singleSelect && selectedCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.filter(Boolean).map(item => (
            <div
              key={item}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${colors.chipText} ${colors.chipBg} shadow-sm`}
            >
              <span>{item}</span>
              <button
                onClick={() => toggle(item)}
                className={`${colors.chipHover} rounded-full p-0.5 transition-colors`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterGroup;
