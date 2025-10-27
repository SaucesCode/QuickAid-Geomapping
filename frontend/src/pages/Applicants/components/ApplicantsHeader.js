import React from "react";
import { Users } from "lucide-react";

const ApplicantsHeader = ({ searchTerm, setSearchTerm }) => {

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Consistent Icon Styling: Blue background, rounded-xl, text-blue-600 */}
        <div className="p-2 rounded-xl bg-blue-100/70 border border-blue-200">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        
        {/* Consistent Headline Styling: Richer text color */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
          Applicants
        </h1>
      </div>
      
      {/* Consistent Subtitle Styling */}
      <p className="text-gray-500 ml-14">Manage and view applicant records</p>
    </div>
  );
};

export default ApplicantsHeader;