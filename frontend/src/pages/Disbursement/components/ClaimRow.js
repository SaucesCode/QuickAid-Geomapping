import { useState } from "react";
import { CheckSquare, Square, Edit3, Check, X, Calendar } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";
import { formatDate } from "../../../utils/FormatDate";

const ClaimRow = ({
  claim,
  isSelected,
  canEdit,
  isFinalized,
  onSelect,
  onStatusChange,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(claim.status);
  const [payoutDate, setPayoutDate] = useState(
    claim.payout_date || new Date().toISOString().split("T")[0]
  );

  // Handle inline edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditStatus(claim.status);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditStatus(claim.status);
    setPayoutDate(claim.payout_date || new Date().toISOString().split("T")[0]);
  };

  const handleSave = () => {
    if (editStatus === claim.status && (!payoutDate || claim.payout_date === payoutDate)) {
      // No changes
      setIsEditing(false);
      return;
    }

    // Validate payout_date for CLAIMED status
    if (editStatus === "CLAIMED" && !payoutDate) {
      alert("Payout date is required for claimed status");
      return;
    }

    onStatusChange(claim.id, editStatus, editStatus === "CLAIMED" ? payoutDate : null);
    setIsEditing(false);
  };

  // Format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  return (
    <tr
      className={`border-b transition-colors ${
        isSelected ? "bg-blue-50/60 border-l-4 border-l-[#003a76]" : "hover:bg-gray-50"
      } ${isFinalized ? "opacity-60" : ""} ${isEditing ? "bg-yellow-50/40" : ""}`}
    >
      {/* Checkbox */}
      {canEdit && (
        <td className="px-4 py-4">
          <button
            onClick={() => onSelect(!isSelected)}
            disabled={isFinalized || isEditing}
            className="text-gray-400 hover:text-[#003a76] disabled:opacity-40 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-[#003a76]" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </td>
      )}
      {/* Beneficiary */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="font-semibold text-sm text-gray-900">{claim.applicant_name}</p>
            <p className="text-xs text-gray-500">{claim.contact_number}</p>
          </div>
        </div>
      </td>
      {/* Location */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="leading-tight">
          <p className="text-sm text-gray-800 font-medium">{claim.barangay}</p>
          <p className="text-xs text-gray-500">{claim.city}</p>
        </div>
      </td>
      {/* Assistance Type */}
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
          {claim.assistance_type}
        </span>
      </td>
      {/* Amount */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900">
            {formatCurrency(claim.amount)}
          </span>
        </div>
      </td>
      {/* Status */}
      <td className="px-4 py-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003a76] focus:border-[#003a76] bg-white font-medium"
            >
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="UNCLAIMED">Unclaimed</option>
            </select>

            {editStatus === "CLAIMED" && (
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={e => setPayoutDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="text-sm focus:ring-0 focus:outline-none border-0 p-0 w-full"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <ClaimStatusBadge status={claim.status} />
            {claim.payout_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(claim.payout_date)}</span>
              </div>
            )}
          </div>
        )}
      </td>

      {canEdit && (
        <td className="px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold 
                     bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
                     text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105
                     disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                     bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300
                     shadow-sm hover:shadow-md transition-all transform hover:scale-105
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : claim.status === "CLAIMED" || claim.status === "UNCLAIMED" ? (
              // Show locked status for completed claims
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <Check className="w-3.5 h-3.5" />
                Completed
              </span>
            ) : (
              // Show edit button only for PENDING claims
              <button
                onClick={handleEdit}
                disabled={isFinalized || isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                   bg-gradient-to-r from-[#003a76] to-[#002d5c] hover:from-[#002d5c] hover:to-[#001f42]
                   text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105
                   disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                title="Edit claim status"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default ClaimRow;
