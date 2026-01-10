import { useState } from "react";
import { X, Calendar } from "lucide-react";

const StatusUpdateModal = ({ selectedCount, isUpdating, onClose, onSubmit }) => {
  const [status, setStatus] = useState("CLAIMED");
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    // Pass with correct parameter name (payout_date not payoutDate)
    if (status === "CLAIMED") {
      onSubmit(status, payoutDate); // This is correct - onSubmit will rename it
    } else {
      onSubmit(status, null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Update {selectedCount} Claims</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003a76] focus:border-[#003a76]"
            >
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="UNCLAIMED">Unclaimed</option>
            </select>
          </div>

          {status === "CLAIMED" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Date
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={e => setPayoutDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="flex-1 text-sm focus:ring-0 focus:outline-none border-0 p-0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 bg-[#003a76] hover:bg-[#002d5c] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Update All
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
