import { useState, useRef } from "react";
import { Search, CheckSquare, Square, Edit3 } from "lucide-react";
import { Card, LoadingState, GradientButton } from "../../../components/DesignSystem";
import ClaimRow from "./ClaimRow";
import Pagination from "../../../components/Pagination";

const ClaimTable = ({
  claims,
  totalClaims,
  loading,
  batchStatus,
  canEdit,
  isFinalized,
  selectedClaims,
  onClaimSelect,
  onSelectAll,
  onStatusChange,
  onBulkUpdate,
  filters,
  onFilterChange,
  isUpdating,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");

  const searchTimeoutRef = useRef(null);

  const handleSearch = value => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: value, offset: 0 });
    }, 400);
  };

  // Handle status filter
  const handleStatusFilter = value => {
    setStatusFilter(value);
    onFilterChange({ ...filters, status: value, offset: 0 });
  };

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(totalClaims / filters.limit);

  const handlePageChange = page => {
    const newOffset = (page - 1) * filters.limit;
    onFilterChange({ ...filters, offset: newOffset });
  };

  const handleItemsPerPageChange = e => {
    const newLimit = Number(e.target.value);
    onFilterChange({
      ...filters,
      limit: newLimit,
      offset: 0, // reset to first page
    });
  };

  // Check if all visible claims are selected
  const allSelected =
    claims.length > 0 && claims.every(claim => selectedClaims.includes(claim.id));

  const handleSelectAllToggle = () => {
    onSelectAll(!allSelected);
  };

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b bg-gray-50/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Beneficiary Claims</h2>
            <p className="text-sm text-gray-600">
              {totalClaims} total beneficiaries • {selectedClaims.length} selected
            </p>
          </div>

          {/* Bulk Actions */}
          {canEdit && selectedClaims.length > 0 && (
            <GradientButton onClick={onBulkUpdate} className="w-full lg:w-auto">
              <Edit3 className="w-4 h-4" />
              Update {selectedClaims.length} Selected
            </GradientButton>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, barangay, city..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg
           focus:ring-2 focus:ring-[#003a76] focus:border-[#003a76]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "" },
              { label: "Pending", value: "PENDING" },
              { label: "Claimed", value: "CLAIMED" },
              { label: "Unclaimed", value: "UNCLAIMED" },
            ].map(({ label, value }) => {
              const active = statusFilter === value;

              return (
                <button
                  key={value || "all"}
                  onClick={() => handleStatusFilter(value)}
                  className={`h-10 px-4 rounded-lg text-sm font-medium border transition-colors
          ${
            active
              ? "bg-[#003a76] text-white border-[#003a76]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }
        `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12">
            <LoadingState message="Loading claims..." />
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4 inline-block">
              <CheckSquare className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-2">No claims found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || statusFilter
                ? "Try adjusting your filters"
                : "This batch was created from an uploaded approval list"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {/* Select All Checkbox */}
                {canEdit && (
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={handleSelectAllToggle}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      disabled={isFinalized}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                  Assistance
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claims.map(claim => (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  isSelected={selectedClaims.includes(claim.id)}
                  canEdit={canEdit}
                  isFinalized={isFinalized}
                  onSelect={isSelected => onClaimSelect(claim.id, isSelected)}
                  onStatusChange={onStatusChange}
                  isUpdating={isUpdating}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && claims.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalClaims}
          itemsPerPage={filters.limit}
          handlePageChange={handlePageChange}
          handleItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Finalized Notice */}
      {isFinalized && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-200">
          <p className="text-sm text-green-800 text-center">
            ✓ This batch is finalized. All claims are locked and cannot be modified.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ClaimTable;
