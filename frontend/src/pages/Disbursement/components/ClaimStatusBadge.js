import { Clock, CheckCircle, XCircle } from "lucide-react";

const ClaimStatusBadge = ({ status, size = "default", showIcon = true }) => {
  const config = {
    PENDING: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Clock,
      label: "Pending",
    },
    CLAIMED: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
      label: "Claimed",
    },
    UNCLAIMED: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: XCircle,
      label: "Unclaimed",
    },
  };

  const statusConfig = config[status] || config.PENDING;
  const Icon = statusConfig.icon;

  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    small: "w-3 h-3",
    default: "w-3.5 h-3.5",
    large: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {statusConfig.label}
    </span>
  );
};

export default ClaimStatusBadge;
