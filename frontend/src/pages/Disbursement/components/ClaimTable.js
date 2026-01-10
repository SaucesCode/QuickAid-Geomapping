import { useState, useRef } from "react";
import { Search, CheckSquare, Square, Edit3, Users, Package } from "lucide-react"; // Add Package
import { Card, LoadingState } from "../../../components/DesignSystem";
import ClaimRow from "./ClaimRow";
import Pagination from "../../../components/Pagination";

const ClaimTable = ({
  claims,
  totalClaims,
  allClaims = [],
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
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const searchTimeoutRef = useRef(null);

  // Calculate status counts from all claims
  const statusCounts = {
    ALL: allClaims.length,
    PENDING: allClaims.filter(c => c.status === "PENDING").length,
    CLAIMED: allClaims.filter(c => c.status === "CLAIMED").length,
    UNCLAIMED: allClaims.filter(c => c.status === "UNCLAIMED").length,
  };

  const handleSearchChange = value => {
    setLocalSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: value, offset: 0 });
    }, 400);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    onFilterChange({ ...filters, search: localSearch, offset: 0 });
  };

  // Handle status filter toggle
  const handleStatusFilter = status => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? "" : status,
      offset: 0,
    });
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
      offset: 0,
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
      {/* Header - Updated to match BatchSummary style */}
      <div className="p-5 border-b bg-white">
        {/* Title Row */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Beneficiary Claims</h2>
            <p className="text-xs text-gray-600 mt-1">
              {totalClaims.toLocaleString()} total beneficiaries
              {selectedClaims.length > 0 && ` • ${selectedClaims.length} selected`}
            </p>
          </div>

          {/* Bulk Actions Button */}
          {canEdit && selectedClaims.length > 0 && (
            <button
              onClick={onBulkUpdate}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#003a76] hover:bg-[#002d5c] disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Update {selectedClaims.length} Selected
                </>
              )}
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, barangay, city..."
              value={localSearch}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-[#003a76] focus:border-[#003a76] transition-all"
            />
          </form>

          {/* Status Toggle Buttons - Updated styling */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "", label: "All", count: statusCounts.ALL },
              { key: "PENDING", label: "Pending", count: statusCounts.PENDING },
              { key: "CLAIMED", label: "Claimed", count: statusCounts.CLAIMED },
              { key: "UNCLAIMED", label: "Unclaimed", count: statusCounts.UNCLAIMED },
            ].map(item => {
              const isActive = filters.status === item.key;

              return (
                <button
                  key={item.key || "all"}
                  onClick={() => handleStatusFilter(item.key)}
                  className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    isActive
                      ? "bg-[#003a76] text-white-500"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <span>{item.label}</span>
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
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <CheckSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {localSearch || filters.status
                ? "No claims match your filters"
                : "No claims found in this batch"}
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
                      className="text-gray-600 hover:text-[#003a76] transition-colors"
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
          <p className="text-sm text-green-800 text-center font-medium">
            ✓ This batch is finalized. All claims are locked and cannot be modified.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ClaimTable;
