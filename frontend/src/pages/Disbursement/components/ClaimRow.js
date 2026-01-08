import { useState } from "react";
import { CheckSquare, Square, Edit3, Check, X, Calendar } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";
import { OutlineButton, GradientButton } from "../../../components/DesignSystem";

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
      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""} ${
        isFinalized ? "opacity-60" : ""
      }`}
    >
      {/* Checkbox */}
      {canEdit && (
        <td className="px-4 py-3">
          <button
            onClick={() => onSelect(!isSelected)}
            disabled={isFinalized || isEditing}
            className="text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </td>
      )}

      {/* Beneficiary Name */}
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{claim.applicant_name}</p>
          <p className="text-xs text-gray-500">{claim.contact_number}</p>
        </div>
      </td>

      {/* Location */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="text-sm">
          <p className="text-gray-700">{claim.barangay}</p>
          <p className="text-xs text-gray-500">{claim.city}</p>
        </div>
      </td>

      {/* Assistance Type */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {claim.assistance_type}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-3">
        <p className="font-semibold text-gray-800">{formatCurrency(claim.amount)}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="space-y-2">
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="UNCLAIMED">Unclaimed</option>
            </select>

            {editStatus === "CLAIMED" && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <input
                  type="date"
                  value={payoutDate}
                  onChange={e => setPayoutDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <ClaimStatusBadge status={claim.status} />
            {claim.payout_date && (
              <p className="text-xs text-gray-500 mt-1">{formatDate(claim.payout_date)}</p>
            )}
          </div>
        )}
      </td>

      {/* Actions */}
      {canEdit && (
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              disabled={isFinalized || isUpdating}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </td>
      )}
    </tr>
  );
};

export default ClaimRow;
