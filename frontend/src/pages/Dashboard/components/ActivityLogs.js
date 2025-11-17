import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Activity, Loader2 } from "lucide-react";
import Pagination from "../../../components/Pagination";
import { Card } from "../../../components/DesignSystem";

const ActivityLogs = ({ token }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activityLogs"],
    queryFn: async () => {
      const res = await api.get("/users/staff-activity/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.results;
    },
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      {/* --- Header --- */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
          <p className="text-sm text-gray-500">Track staff actions and system events</p>
        </div>
      </div>

      {/* --- Logs Table or Loader --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading activity logs...</p>
        </div>
      ) : currentLogs.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Details</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-800">
                      {log.staff_member || "—"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{log.action}</td>
                    <td className="px-4 py-4 text-gray-500">{log.details}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            totalItems={logs.length}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activity logs found.</p>
        </div>
      )}
    </Card>
  );
};

export default ActivityLogs;
