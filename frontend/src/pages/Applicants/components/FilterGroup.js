/**
 * Reusable filter group component with chip-style selection
 * @param {string} title - Label for the filter group
 * @param {Array} items - Array of filter options
 * @param {Array} selected - Array of currently selected items
 * @param {Function} toggle - Function to toggle item selection
 * @param {boolean} loading - Loading state for filters
 * @param {string} color - Tailwind color for selected chips (e.g., 'blue', 'green', 'purple')
 */
function FilterGroup({ title, items, selected, toggle, loading, color }) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-gray-700 text-sm">
        {title}{" "}
        {selected.length > 0 && (
          <span className="text-gray-500 font-normal">({selected.length} selected)</span>
        )}
      </label>
      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
        {loading ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : items.length > 0 ? (
          items.map(item => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selected.includes(item)
                  ? `bg-${color}-600 text-white shadow-md`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))
        ) : (
          <span className="text-sm text-gray-400">No options available</span>
        )}
      </div>
    </div>
  );
}

export default FilterGroup;
