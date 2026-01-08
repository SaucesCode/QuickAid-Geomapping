import { useState } from "react";
import { X, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { GradientButton, OutlineButton } from "../../../components/DesignSystem";

const StatusUpdateModal = ({ selectedCount, isUpdating, onClose, onSubmit }) => {
  const [status, setStatus] = useState("CLAIMED");
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = e => {
    e.preventDefault();

    // Validate payout date for CLAIMED
    if (status === "CLAIMED" && !payoutDate) {
      alert("Payout date is required for claimed status");
      return;
    }

    onSubmit(status, status === "CLAIMED" ? payoutDate : null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Update Claim Status</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {selectedCount} claim{selectedCount !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Bulk Status Update</p>
              <p>
                All {selectedCount} selected claim{selectedCount !== 1 ? "s" : ""} will be
                updated to the same status.
              </p>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input
                  type="radio"
                  name="status"
                  value="CLAIMED"
                  checked={status === "CLAIMED"}
                  onChange={e => setStatus(e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Claimed</p>
                  <p className="text-xs text-gray-500">Beneficiary received assistance</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                <input
                  type="radio"
                  name="status"
                  value="UNCLAIMED"
                  checked={status === "UNCLAIMED"}
                  onChange={e => setStatus(e.target.value)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Unclaimed</p>
                  <p className="text-xs text-gray-500">Beneficiary did not receive</p>
                </div>
              </label>
            </div>
          </div>

          {/* Payout Date (Only for CLAIMED) */}
          {status === "CLAIMED" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={e => setPayoutDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Date when the assistance was distributed
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <OutlineButton
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1"
            >
              Cancel
            </OutlineButton>
            <GradientButton type="submit" loading={isUpdating} className="flex-1">
              <CheckCircle className="w-4 h-4" />
              Update {selectedCount} Claim{selectedCount !== 1 ? "s" : ""}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
