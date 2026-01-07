import { Card, Badge, LoadingState, BodyText } from "../../../components/DesignSystem";

const ClaimTable = ({ claims, loading }) => {
  if (loading)
    return (
      <Card>
        <LoadingState message="Fetching claims..." />
      </Card>
    );

  const getStatusVariant = status => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Beneficiary
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Control No.
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map(claim => (
              <tr key={claim.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {claim.beneficiary_name}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                  {claim.control_number}
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">₱{claim.amount}</td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(claim.status)}>{claim.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {claims.length === 0 && (
        <div className="p-12 text-center">
          <BodyText>No claims found for this batch.</BodyText>
        </div>
      )}
    </Card>
  );
};

export default ClaimTable;
