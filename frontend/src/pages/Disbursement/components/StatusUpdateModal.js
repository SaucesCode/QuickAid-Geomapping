import { useState } from "react";
import { X, Edit3, Calendar, AlertCircle, Info, CheckCircle } from "lucide-react";

const StatusUpdateModal = ({ selectedCount, isUpdating, onClose, onSubmit }) => {
  const [status, setStatus] = useState("CLAIMED");
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    // Validation for CLAIMED status
    if (status === "CLAIMED" && !payoutDate) {
      alert("Please select a payout date for claimed status");
      return;
    }

    // Pass with correct parameter name (payout_date not payoutDate)
    if (status === "CLAIMED") {
      onSubmit(status, payoutDate);
    } else {
      onSubmit(status, null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Update Claim Status</h2>
              <p className="text-xs text-gray-500">Bulk action for {selectedCount} claims</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Bulk Status Update
                </h4>
                <p className="text-xs text-blue-700">
                  You are about to update <span className="font-bold">{selectedCount}</span>{" "}
                  claim(s). This action will modify the status for all selected beneficiaries.
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select New Status
            </label>

            {/* PENDING Option */}
            <button
              type="button"
              onClick={() => setStatus("PENDING")}
              disabled={isUpdating}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "PENDING"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                    status === "PENDING" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
                  {status === "PENDING" && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Pending</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Beneficiary has not yet claimed their assistance. No payout date required.
                  </p>
                </div>
              </div>
            </button>

            {/* CLAIMED Option */}
            <button
              type="button"
              onClick={() => setStatus("CLAIMED")}
              disabled={isUpdating}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "CLAIMED"
                  ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                    status === "CLAIMED" ? "border-green-500 bg-green-500" : "border-gray-300"
                  }`}
                >
                  {status === "CLAIMED" && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Claimed</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Beneficiary has successfully received their assistance. Payout date is
                    required.
                  </p>
                </div>
              </div>
            </button>

            {/* UNCLAIMED Option */}
            <button
              type="button"
              onClick={() => setStatus("UNCLAIMED")}
              disabled={isUpdating}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "UNCLAIMED"
                  ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                    status === "UNCLAIMED" ? "border-red-500 bg-red-500" : "border-gray-300"
                  }`}
                >
                  {status === "UNCLAIMED" && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Unclaimed</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Beneficiary did not claim their assistance within the valid period.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Payout Date Input - Show when CLAIMED is selected */}
          {status === "CLAIMED" && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition-all">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={e => setPayoutDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  disabled={isUpdating}
                  className="flex-1 text-sm focus:ring-0 focus:outline-none border-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Required for claimed status. Cannot be a future date.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || (status === "CLAIMED" && !payoutDate)}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#003a76] hover:bg-[#002d5c] rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Update {selectedCount} Claim{selectedCount > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
