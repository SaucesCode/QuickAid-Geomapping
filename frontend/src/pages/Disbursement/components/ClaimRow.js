import { useState } from "react";
import { CheckSquare, Square, Edit3, Check, X, Calendar } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";
import EditConfirmationModal from "./EditConfirmationModal";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editStatus, setEditStatus] = useState(claim.status);
  const [payoutDate, setPayoutDate] = useState(
    claim.payout_date || new Date().toISOString().split("T")[0]
  );

  // ENTER EDIT MODE
  const handleEdit = () => {
    setIsEditing(true);
    setEditStatus(claim.status);
    setPayoutDate(claim.payout_date || new Date().toISOString().split("T")[0]);
  };

  // CANCEL EDITING
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditStatus(claim.status);
    setPayoutDate(claim.payout_date || new Date().toISOString().split("T")[0]);
  };

  // OPEN CONFIRMATION MODAL ON SAVE
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  // CONFIRM SAVE
  const handleConfirmSave = () => {
    // No changes
    if (editStatus === claim.status && (!payoutDate || claim.payout_date === payoutDate)) {
      setIsEditing(false);
      setShowConfirmModal(false);
      return;
    }

    // Validation
    if (editStatus === "CLAIMED" && !payoutDate) {
      alert("Payout date is required for claimed status");
      return;
    }

    onStatusChange(claim.id, editStatus, editStatus === "CLAIMED" ? payoutDate : null);

    setIsEditing(false);
    setShowConfirmModal(false);
  };

  // CANCEL CONFIRMATION MODAL
  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  // FORMAT CURRENCY
  const formatCurrency = amount =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);

  return (
    <>
      <tr
        className={`border-b transition-colors ${
          isSelected ? "bg-blue-50/60 border-l-4 border-l-[#003a76]" : "hover:bg-gray-50"
        } ${isFinalized ? "opacity-60" : ""} ${isEditing ? "bg-yellow-50/40" : ""}`}
      >
        {/* Checkbox */}
        {canEdit && (
          <td className="px-4 py-4">
            {claim.status === "CLAIMED" || claim.status === "UNCLAIMED" ? (
              <div className="w-5 h-5" />
            ) : (
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
            )}
          </td>
        )}

        {/* Beneficiary */}
        <td className="px-4 py-4">
          <p className="font-semibold text-sm text-gray-900">{claim.applicant_name}</p>
          <p className="text-xs text-gray-500">{claim.contact_number}</p>
        </td>

        {/* Location */}
        <td className="px-4 py-4 hidden lg:table-cell">
          <p className="text-sm font-medium">{claim.barangay}</p>
          <p className="text-xs text-gray-500">{claim.city}</p>
        </td>

        {/* Assistance Type */}
        <td className="px-4 py-4 hidden sm:table-cell">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
            {claim.assistance_type}
          </span>
        </td>

        {/* Amount */}
        <td className="px-4 py-4 font-bold text-sm">{formatCurrency(claim.amount)}</td>

        {/* Status */}
        <td className="px-4 py-4">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
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
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          ) : (
            <>
              <ClaimStatusBadge status={claim.status} />
              {claim.payout_date && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(claim.payout_date)}
                </div>
              )}
            </>
          )}
        </td>

        {/* Actions */}
        {canEdit && (
          <td className="px-4 py-4 text-center">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveClick}
                  disabled={isUpdating}
                  className="mr-2 px-4 py-2 text-xs bg-green-600 text-white rounded-lg"
                >
                  <Check className="w-4 h-4 inline" /> Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs bg-gray-200 rounded-lg"
                >
                  <X className="w-4 h-4 inline" /> Cancel
                </button>
              </>
            ) : claim.status === "PENDING" ? (
              <button
                onClick={handleEdit}
                disabled={isFinalized || isUpdating}
                className="px-4 py-2 text-xs bg-[#003a76] text-white rounded-lg"
              >
                <Edit3 className="w-4 h-4 inline" /> Edit
              </button>
            ) : (
              <span className="text-xs text-green-700 font-medium">Completed</span>
            )}
          </td>
        )}
      </tr>

      {showConfirmModal && (
        <EditConfirmationModal
          claim={claim}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelConfirm}
        />
      )}
    </>
  );
};

export default ClaimRow;
