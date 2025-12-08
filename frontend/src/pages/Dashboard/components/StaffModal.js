import React from "react";
import { Trash2, RefreshCw, AlertTriangle, Info, X } from "lucide-react";

// Deactivate Modal
export const DeactivateModal = ({ isOpen, onClose, onConfirm, isLoading, staffName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header with Red Theme */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deactivate Staff</h2>
              <p className="text-red-100 text-xs">Remove staff access</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-5">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700 leading-relaxed">
                <strong>{staffName}</strong> will lose access to the system. You can reactivate
                this account later if needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                  Deactivating...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Deactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reactivate Modal
export const ReactivateModal = ({ isOpen, onClose, onConfirm, isLoading, staffName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header with Green Theme */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reactivate Staff</h2>
              <p className="text-green-100 text-xs">Restore staff access</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Info Alert */}
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-5">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-700 leading-relaxed">
                <strong>{staffName}</strong> will regain access to the system with their
                previous permissions.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                  Reactivating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
