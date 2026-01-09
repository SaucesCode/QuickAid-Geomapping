import {
  Lock,
  CheckCircle,
  Clock,
  ChevronRight,
  Users,
  Calendar,
  Package,
  Search,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Pagination from "../../../components/Pagination";

const getBatchStatusBadge = status => {
  const base = "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide";

  const styles = {
    OPEN: "bg-blue-100 text-blue-700",
    CLOSED: "bg-yellow-100 text-yellow-700",
    FINALIZED: "bg-green-100 text-green-700",
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
};

const BatchList = ({
  batches,
  totalBatches,
  allBatches,
  selectedBatch,
  onSelectBatch,
  filters,
  onFilterChange,
  loading,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const itemsPerPage = filters.limit;
  const totalPages = Math.ceil(totalBatches / itemsPerPage);

  const statusCounts = {
    OPEN: allBatches.filter(b => b.status === "OPEN").length,
    CLOSED: allBatches.filter(b => b.status === "CLOSED").length,
    FINALIZED: allBatches.filter(b => b.status === "FINALIZED").length,
  };

  const handleSearchChange = e => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    onFilterChange({ ...filters, search: localSearch, offset: 0 });
  };

  const handleStatusFilter = status => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? "" : status,
      offset: 0,
    });
  };

  const handlePageChange = page => {
    onFilterChange({
      ...filters,
      offset: (page - 1) * filters.limit,
    });
  };

  const handleItemsPerPageChange = e => {
    onFilterChange({
      ...filters,
      limit: Number(e.target.value),
      offset: 0, // reset to first page
    });
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search batches..."
            className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-[#003a76] focus:border-[#003a76]"
          />
        </form>

        {/* Status Toggles */}
        <div className="flex gap-2">
          {[
            { key: "OPEN", label: "Open", count: statusCounts.OPEN },
            { key: "CLOSED", label: "Closed", count: statusCounts.CLOSED },
            { key: "FINALIZED", label: "Finalized", count: statusCounts.FINALIZED },
          ].map(item => {
            const isActive = filters.status === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleStatusFilter(item.key)}
                className={`h-10 px-4 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#003a76] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.label} ({item.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch List - Reduced Height */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[420px]
             overflow-y-auto pr-2 custom-scrollbar"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003a76]" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {filters.search || filters.status
                ? "No batches match your filters"
                : "No batches found"}
            </p>
          </div>
        ) : (
          batches.map(batch => {
            const isSelected = selectedBatch?.id === batch.id;
            const total = batch.total_beneficiaries || 0;
            const processed = (batch.claimed_count || 0) + (batch.unclaimed_count || 0);
            const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

            return (
              <button
                key={batch.id}
                onClick={() => onSelectBatch(batch)}
                className={`w-full text-left rounded-lg border transition-all ${
                  isSelected
                    ? "border-[#003a76] bg-[#003a76]/5 shadow-sm"
                    : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <div className="px-3 py-2.5 space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {batch.name}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Date Modified: {""}
                        {new Date(batch.payout_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {getBatchStatusBadge(batch.status)}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-gray-700">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{total}</span>
                        <span className="text-gray-500">beneficiaries</span>
                      </div>
                    </div>

                    {batch.status !== "OPEN" && (
                      <span className="text-[11px] font-medium text-gray-500">
                        {progress}% processed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {batch.status !== "OPEN" && (
                  <div className="h-1.5 w-full bg-gray-200">
                    <div
                      className="h-full bg-[#003a76] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          totalItems={totalBatches}
        />
      )}
    </div>
  );
};

export default BatchList;
