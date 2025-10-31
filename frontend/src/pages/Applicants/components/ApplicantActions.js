import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicantActions = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-200"> {/* Added blue border */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" /> {/* Changed text-gray-400 to text-blue-400 */}
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            // Changed border-gray-300, focus:ring-teal-500, and focus:border-transparent 
            // to a monochromatic blue focus state
            className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50"
          />
        </div>
        <button
          onClick={() => navigate("/export-applicants")}
          // Changed bg-blue-500 and hover:bg-teal-600 to a deeper blue shade for the button
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300/50"
        >
          Go to Export Page
        </button>
      </div>
    </div>
  );
};

export default ApplicantActions;