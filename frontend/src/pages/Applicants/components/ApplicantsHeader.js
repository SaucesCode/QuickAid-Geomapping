import React from "react";
import { Users } from "lucide-react";

const ApplicantsHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-800">Applicants</h1>
      </div>
      <p className="text-gray-400">Manage and view applicant records</p>
    </div>
  );
};

export default ApplicantsHeader;