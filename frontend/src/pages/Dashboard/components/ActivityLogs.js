import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Activity, Loader2 } from "lucide-react";
import Pagination from "../../../components/Pagination";
import { Card } from "../../../components/DesignSystem";
import { formatDate } from "../../../utils/FormatDate";

const ActivityLogs = ({ token }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // -------------------------------
  //     Fetch with SERVER PAGINATION
  // -------------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["activityLogs", currentPage, itemsPerPage],
    queryFn: async () => {
      const res = await api.get("/users/staff-activity/", {
        params: {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // contains count, next, previous, results
    },
    keepPreviousData: true,
  });

  const logs = data?.results || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + logs.length;

  const getActionStyle = action => {
    const styles = {
      CREATE: "bg-green-100 text-green-700 border-green-200",
      UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
      LOGIN: "bg-purple-100 text-purple-700 border-purple-200",
      ARCHIVE: "bg-red-100 text-red-700 border-red-200",
      "EXPORT APPLICANTS": "bg-teal-100 text-teal-700 border-teal-200",
      "EXPORT ANALYTICS": "bg-amber-100 text-amber-700 border-amber-200",
    };
    return styles[action] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Card>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
          <p className="text-sm text-gray-500">Track staff actions and system events</p>
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading activity logs...</p>
        </div>
      ) : logs.length > 0 ? (
        <>
          {/* TABLE */}
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
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-800">
                      {log.staff_member}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getActionStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{log.details}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            totalItems={totalItems}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfFirstItem + logs.length}
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
