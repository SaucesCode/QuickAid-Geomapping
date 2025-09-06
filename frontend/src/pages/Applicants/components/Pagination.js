import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  indexOfFirstItem,
  indexOfLastItem,
  sortedApplicants,
  itemsPerPage,
  handleItemsPerPageChange,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  return (
    <div className="border-t border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, sortedApplicants.length)} of{" "}
          {sortedApplicants.length} entries
        </span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === page
                        ? "bg-teal-500 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
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
                className={`px-3 py-2 text-sm rounded-lg ${
                  currentPage === page
                    ? "bg-teal-500 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
