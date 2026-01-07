const ClaimStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium capitalize ${
        styles[status.toLowerCase()] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
};

export default ClaimStatusBadge;
