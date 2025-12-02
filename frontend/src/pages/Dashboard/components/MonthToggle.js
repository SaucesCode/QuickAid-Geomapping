import React from "react";
import { Calendar } from "lucide-react";

const MonthToggle = ({ selected, onChange }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange("previous")}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
          selected === "previous"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Calendar className="w-3 h-3" />
        Previous Month
      </button>
      <button
        onClick={() => onChange("current")}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
          selected === "current"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Calendar className="w-3 h-3" />
        Current Month
      </button>
    </div>
  );
};

export default MonthToggle;
