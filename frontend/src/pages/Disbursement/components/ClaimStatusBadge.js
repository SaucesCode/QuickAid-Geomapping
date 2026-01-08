import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const ClaimStatusBadge = ({ status }) => {
  // Normalize status to match backend model choices
  const normalizedStatus = status?.toUpperCase() || "PENDING";

  const configs = {
    PENDING: {
      label: "Pending Payout",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
    CLAIMED: {
      label: "Claimed / Paid",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    UNCLAIMED: {
      label: "Unclaimed",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const current = configs[normalizedStatus] || {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: null,
  };

  return (
    <span
      className={`
      inline-flex items-center gap-1.5 
      px-2.5 py-0.5 
      rounded-full border 
      text-xs font-bold tracking-wide
      ${current.className}
    `}
    >
      {current.icon}
      {current.label.toUpperCase()}
    </span>
  );
};

export default ClaimStatusBadge;
