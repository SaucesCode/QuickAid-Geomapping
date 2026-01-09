import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Mail, CheckCircle, X, Loader2 } from "lucide-react";
import Pagination from "../../../components/Pagination";
import {
  Card,
  H2,
  H3,
  Caption,
  LoadingState,
  GradientButton,
  OutlineButton,
  GhostButton,
} from "../../../components/DesignSystem";

const SupportMessages = ({ token }) => {
  const queryClient = useQueryClient();
  const [viewResolved, setViewResolved] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: supportMessages = [], isLoading } = useQuery({
    queryKey: ["supportMessages"],
    queryFn: async () => {
      const res = await api.get("/support-messages/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  const resolveMessageMutation = useMutation({
    mutationFn: async id =>
      api.patch(
        `/support-messages/${id}/resolve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["supportMessages"]);
    },
  });

  const resolvedMessages = supportMessages.filter(m => m.is_resolved);
  const pendingMessages = supportMessages.filter(m => !m.is_resolved);
  const displayedMessages = viewResolved ? resolvedMessages : pendingMessages;

  const totalPages = Math.ceil(displayedMessages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = displayedMessages.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Card>
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center shadow-md">
            {" "}
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <H2>Support Messages</H2>
            <Caption>Manage staff inquiries and system-related issues</Caption>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewResolved(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !viewResolved
                ? "bg-[#003a76] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({pendingMessages.length})
          </button>
          <button
            onClick={() => setViewResolved(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewResolved
                ? "bg-[#003a76] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Resolved ({resolvedMessages.length})
          </button>
        </div>
      </div>

      {/* --- Message Table --- */}
      {isLoading ? (
        <LoadingState message="Loading messages..." />
      ) : currentMessages.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Sender</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Message</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentMessages.map(msg => (
                  <tr
                    key={msg.id}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{msg.name}</div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                    </td>
                    <td
                      className="px-4 py-4 text-gray-600 cursor-pointer hover:text-indigo-600 max-w-[400px] truncate"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      {msg.message}
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-sm">
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {msg.is_resolved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          <CheckCircle size={14} /> Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => resolveMessageMutation.mutate(msg.id)}
                          disabled={resolveMessageMutation.isLoading}
                          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} />
                          Mark Resolved
                        </button>
                      )}
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
            totalItems={displayedMessages.length}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages found.</p>
        </div>
      )}

      {/* --- Modal for full message --- */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="relative w-full max-w-lg">
            <GhostButton
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 p-1"
            >
              <X className="w-5 h-5" />
            </GhostButton>
            <H3 className="mb-2">{selectedMessage.name}</H3>{" "}
            <Caption className="mb-4">{selectedMessage.email}</Caption>{" "}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              {new Date(selectedMessage.created_at).toLocaleString()}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default SupportMessages;
