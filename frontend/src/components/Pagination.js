import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  handlePageChange,
  itemsPerPage,
  handleItemsPerPageChange,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
        </span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
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
                  <span className="px-2 text-gray-400">...</span>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-teal-500 text-white"
                        : "border border-gray-200 hover:bg-gray-100"
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
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-teal-500 text-white"
                    : "border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;