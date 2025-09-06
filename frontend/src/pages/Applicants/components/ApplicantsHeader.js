import React from "react";

const ApplicantsHeader = () => {
  return (
    <div className="bg-white shadow border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Applicants</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and view applicant records
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsHeader;
