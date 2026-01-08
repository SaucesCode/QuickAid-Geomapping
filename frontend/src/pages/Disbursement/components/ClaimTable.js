import { useState } from "react";
import { Search, Users, FileText, CheckCircle } from "lucide-react";
import { Card, Badge, LoadingState, BodyText, Stack } from "../../../components/DesignSystem";
import ClaimRow from "./ClaimRow";

const ClaimTable = ({ claims = [], loading, onStatusChange, batchStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const safeClaims = Array.isArray(claims) ? claims : claims?.results || [];

  // 1. Logic: Is the whole batch locked?
  const isLocked = batchStatus === "CLOSED";

  // 2. Filter logic for search
  const filteredClaims = safeClaims.filter(
    c =>
      c.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.control_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Simple Stats for the table header
  const stats = {
    total: claims.length,
    claimed: claims.filter(c => c.status === "CLAIMED").length,
    pending: claims.filter(c => c.status === "PENDING").length,
  };

  if (loading)
    return (
      <Card>
        <LoadingState message="Fetching beneficiary claims..." />
      </Card>
    );

  return (
    <Stack spacing="md">
      {/* Table Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">
              Total Claims
            </span>
            <span className="text-lg font-bold text-gray-800">{stats.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-green-500 uppercase tracking-tight">
              Claimed
            </span>
            <span className="text-lg font-bold text-gray-800">{stats.claimed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-tight">
              Pending
            </span>
            <span className="text-lg font-bold text-gray-800">{stats.pending}</span>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search beneficiary or control #..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden border-none shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Beneficiary Details
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <ClaimRow
                    key={claim.id}
                    claim={claim}
                    isLocked={isLocked}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Users className="w-12 h-12 mb-2 opacity-20" />
                      <BodyText>No matching beneficiaries found</BodyText>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Stack>
  );
};

export default ClaimTable;
