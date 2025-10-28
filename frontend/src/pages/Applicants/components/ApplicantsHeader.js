import React from "react";
import { Users } from "lucide-react";

const ApplicantsHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    // Outer div for the header content
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {/* UPDATED ICON CONTAINER STYLE:
          Matched to the premium design with a gradient background, 
          larger size (w-16 h-16), rounded-2xl, and shadow-lg.
        */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Users className="w-8 h-8 text-white" />
        </div>
        
        {/* Consistent Headline Styling: Richer text color */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
          Applicants
        </h1>
      </div>
      
      {/* Consistent Subtitle Styling: Removed ml-14 offset since the icon is part of the flow now */}
      <p className="text-gray-600 text-lg mt-1 ml-0">Manage and view applicant records</p>
    </div>
  );
};

export default ApplicantsHeader;