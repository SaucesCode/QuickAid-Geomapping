import { CheckCircle2, XCircle, Clock, MoreHorizontal } from "lucide-react";
import { Badge, BodyText } from "../../../components/DesignSystem";

const ClaimRow = ({ claim, onStatusChange, isLocked }) => {
  // Helper to determine badge color and icon based on backend statuses
  const getStatusConfig = status => {
    switch (status) {
      case "CLAIMED":
        return { variant: "success", icon: CheckCircle2, label: "Claimed" };
      case "UNCLAIMED":
        return { variant: "error", icon: XCircle, label: "Unclaimed" };
      default:
        return { variant: "warning", icon: Clock, label: "Pending" };
    }
  };

  const config = getStatusConfig(claim.status);

  return (
    <tr
      className={`group transition-colors ${
        isLocked ? "bg-gray-50/30" : "hover:bg-blue-50/30"
      } border-b last:border-0`}
    >
      {/* Beneficiary Info */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 leading-none mb-1">
            {claim.applicant_name || "Unknown Beneficiary"}
          </span>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-tighter">
            {claim.control_number}
          </span>
        </div>
      </td>

      {/* Amount - Matching PHP Currency from backend */}
      <td className="px-4 py-4">
        <span className="text-sm font-bold text-gray-800">
          ₱{Number(claim.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </td>

      {/* Dynamic Status Badge */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <config.icon
            className={`w-4 h-4 ${
              claim.status === "CLAIMED"
                ? "text-green-500"
                : claim.status === "UNCLAIMED"
                ? "text-red-400"
                : "text-amber-400"
            }`}
          />
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        </div>
      </td>

      {/* Actions: Only show if batch is OPEN */}
      <td className="px-4 py-4 text-right">
        {isLocked ? (
          <span className="text-xs text-gray-400 italic">Record Finalized</span>
        ) : (
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {claim.status !== "CLAIMED" && (
              <button
                onClick={() => onStatusChange(claim.id, "CLAIMED")}
                className="px-3 py-1 text-xs font-bold bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200"
              >
                Mark Claimed
              </button>
            )}
            {claim.status === "PENDING" && (
              <button
                onClick={() => onStatusChange(claim.id, "UNCLAIMED")}
                className="px-3 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200"
              >
                Unclaimed
              </button>
            )}
            {claim.status !== "PENDING" && (
              <button
                onClick={() => onStatusChange(claim.id, "PENDING")}
                className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ClaimRow;
