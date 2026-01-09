import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  handlePageChange,
  itemsPerPage,
  handleItemsPerPageChange,
  totalItems,
}) => {
  // Compute starting and ending item numbers
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-blue-100 bg-gradient-to-r from-gray-50 to-blue-50">
      {/* Left Section: Items Info & Per Page Selector */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-800">{startItem}</span> to{" "}
          <span className="font-bold text-gray-800">{endItem}</span> of{" "}
          <span className="font-bold text-gray-800">{totalItems}</span> entries
        </span>

        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 pr-8 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-blue-400 transition-all"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 h-8 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            return (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            );
          })
          .map((page, index, array) => {
            if (index > 0 && page - array[index - 1] > 1) {
              return (
                <React.Fragment key={`ellipsis-${page}`}>
                  <span className="px-2 text-gray-400 text-sm">...</span>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-all font-medium ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                        : "border border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            }
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-all font-medium ${
                  currentPage === page
                    ? "bg-[#003a76] text-white shadow-sm"
                    : "border border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

        {/* Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 h-8 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
