import React from "react";

const ArchiveModal = ({ archiveModal, closeArchiveModal, handleArchive }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          {/* Title: Darker Blue */}
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Confirm Archive</h2>
          {/* Text: Mid Blue */}
          <p className="text-blue-700 mb-6">
            Are you sure you want to archive this applicant? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleArchive}
              // Primary Action: Strong Blue background
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Archive
            </button>
            <button
              onClick={closeArchiveModal}
              // Secondary Action: Light Blue background with Dark Blue text
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;