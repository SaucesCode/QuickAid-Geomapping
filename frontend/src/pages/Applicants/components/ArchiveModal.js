import React from "react";

const ArchiveModal = ({ archiveModal, closeArchiveModal, handleArchive }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Archive</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to archive this applicant? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleArchive}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Archive
            </button>
            <button
              onClick={closeArchiveModal}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
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
