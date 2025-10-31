import React from "react";
import { Archive } from "lucide-react";

const ApplicantsHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    // Outer div for the header content
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Archive className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
            Applicants
          </h1>
          <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
            Manage and review applicant information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsHeader;
