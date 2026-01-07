import ClaimStatusBadge from "./ClaimStatusBadge";

const ClaimRow = ({ claim, onStatusChange }) => {
  return (
    <tr className="hover:bg-gray-50 border-b last:border-0">
      <td className="px-4 py-3 text-sm font-medium">{claim.beneficiary_name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{claim.control_number}</td>
      <td className="px-4 py-3 text-sm font-mono font-semibold">${claim.amount}</td>
      <td className="px-4 py-3">
        <ClaimStatusBadge status={claim.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onStatusChange}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default ClaimRow;
