import { useState } from "react";
import { CheckSquare, Square, Edit3, Check, X, Users } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";

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

  // Format date
  const formatDate = dateString => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <tr
      className={`border-b transition-colors ${
        isSelected ? "bg-[#003a76]/5" : "hover:bg-gray-50"
      } ${isFinalized ? "opacity-60" : ""}`}
    >
      {/* Checkbox */}
      {canEdit && (
        <td className="px-3 py-2.5">
          <button
            onClick={() => onSelect(!isSelected)}
            disabled={isFinalized || isEditing}
            className="text-gray-500 hover:text-[#003a76] disabled:opacity-40"
          >
            {isSelected ? (
              <CheckSquare className="w-4.5 h-4.5 text-[#003a76]" />
            ) : (
              <Square className="w-4.5 h-4.5" />
            )}
          </button>
        </td>
      )}

      {/* Beneficiary */}
      <td className="px-3 py-2.5">
        <div className="leading-tight">
          <p className="font-medium text-sm text-gray-900">{claim.applicant_name}</p>
          <p className="text-[11px] text-gray-500">{claim.contact_number}</p>
        </div>
      </td>

      {/* Location */}
      <td className="px-3 py-2.5 hidden lg:table-cell">
        <div className="leading-tight">
          <p className="text-sm text-gray-800">{claim.barangay}</p>
          <p className="text-[11px] text-gray-500">{claim.city}</p>
        </div>
      </td>

      {/* Assistance Type */}
      <td className="px-3 py-2.5 hidden sm:table-cell">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {claim.assistance_type}
        </span>
      </td>

      {/* Amount */}
      <td className="px-3 py-2.5">
        <span className="font-semibold text-sm text-gray-900">
          {formatCurrency(claim.amount)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#003a76]"
            >
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="UNCLAIMED">Unclaimed</option>
            </select>

            {editStatus === "CLAIMED" && (
              <input
                type="date"
                value={payoutDate}
                onChange={e => setPayoutDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-10 px-4 pl-10 text-sm border border-gray-300 rounded-lg
             focus:ring-2 focus:ring-[#003a76]"
              />
            )}
          </div>
        ) : (
          <div className="leading-tight">
            <ClaimStatusBadge status={claim.status} />
            {claim.payout_date && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                {formatDate(claim.payout_date)}
              </p>
            )}
          </div>
        )}
      </td>

      {/* Actions */}
      {canEdit && (
        <td className="px-3 py-2.5 text-right">
          {isEditing ? (
            <div className="inline-flex gap-1.5">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium 
                         bg-green-50 text-green-700 hover:bg-green-100 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
                title="Save changes"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium
                         bg-red-50 text-red-700 hover:bg-red-100 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
                title="Cancel editing"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              disabled={isFinalized || isUpdating}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium
                       bg-blue-50 text-[#003a76] hover:bg-blue-100 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
              title="Edit status"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </td>
      )}
    </tr>
  );
};

export default ClaimRow;
