import React from "react";
import { Archive, Info, X } from "lucide-react";

const ArchiveModal = ({ archiveModal, closeArchiveModal, handleArchive, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header with Blue Theme */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 rounded-t-xl">
          <button
            onClick={closeArchiveModal}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Archive Applicant</h2>
              <p className="text-blue-100 text-xs">Move to archive</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Info Alert */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-5">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700 leading-relaxed">
                This applicant will be moved to the archive. You can restore it later if
                needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={closeArchiveModal}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Archiving...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Archive
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
