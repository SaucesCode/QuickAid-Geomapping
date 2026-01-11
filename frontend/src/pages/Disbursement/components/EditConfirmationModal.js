import { X, Edit3, AlertCircle, Info } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";

const EditConfirmationModal = ({ claim, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Confirm Edit</h2>
              <p className="text-xs text-gray-600">Review before making changes</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  You are about to edit this claim
                </p>
                <p className="text-xs text-blue-700">
                  This will allow you to change the claim status and update payout information.
                </p>
              </div>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Beneficiary Details</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Name:</span>
                <span className="text-sm font-semibold text-gray-900 text-right">
                  {claim.applicant_name}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Location:</span>
                <span className="text-sm text-gray-900 text-right">
                  {claim.barangay}, {claim.city}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Assistance:</span>
                <span className="text-sm text-gray-900 text-right">
                  {claim.assistance_type}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Amount:</span>
                <span className="text-sm font-bold text-gray-900 text-right">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(claim.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-600">Current Status:</span>
                <ClaimStatusBadge status={claim.status} />
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Make sure you have verified the beneficiary's information before updating their
              claim status.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#003a76] hover:bg-[#002d5c] rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Proceed to Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConfirmationModal;
