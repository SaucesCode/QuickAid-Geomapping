// src/pages/AdminManagement/components/StaffTable.js
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Users, Edit3, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const fetchStaffList = async token => {
  const res = await api.get(`/staff-list/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const deleteStaff = async ({ id, token }) => {
  await api.delete(`/delete-staff/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const StaffTable = ({ theme, onEdit }) => {
  const token = localStorage.getItem("accessToken");
  const queryClient = useQueryClient();

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staffList"],
    queryFn: () => fetchStaffList(token),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { mutate: removeStaff } = useMutation({
    mutationFn: ({ id }) => deleteStaff({ id, token }),
    onSuccess: () => {
      toast.success("Staff deleted successfully!");
      queryClient.invalidateQueries(["staffList"]);
    },
    onError: () => toast.error("Failed to delete staff."),
  });

  const getStatusBadge = lastActive => {
    const diff = (new Date() - new Date(lastActive)) / 1000;
    if (diff < 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
          Online
        </span>
      );
    } else if (diff < 300) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
        Offline
      </span>
    );
  };

  return (
    <div className={`bg-${theme.surface} shadow-lg rounded-2xl p-6 border border-gray-200`}>
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <Users className="w-10 h-10 text-white bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md" />
      <h2 className="text-2xl font-bold text-gray-800">Staff Members</h2>
    </div>

    <span
      className={`text-sm font-medium text-${theme.textSecondary} px-3 py-1 bg-${theme.primaryLight} rounded-full`}
    >
      {staffList.length} total
    </span>
  </div>


      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className={`w-6 h-6 text-${theme.primary} animate-spin`} />
        </div>
      ) : staffList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Status", "Username", "Full Name", "Email", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr
                  key={staff.id}
                  className="border-b border-gray-100 even:bg-gray-50 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-4 py-3">{getStatusBadge(staff.last_active)}</td>
                  <td className="px-4 py-3 font-medium">{staff.username}</td>
                  <td className="px-4 py-3">
                    {staff.first_name} {staff.last_name}
                  </td>
                  <td className="px-4 py-3">{staff.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(staff)}
                        className={`p-2 text-${theme.primary} hover:bg-${theme.primaryLight} rounded-lg`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeStaff({ id: staff.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">No staff members found.</div>
      )}
    </div>
  );
};

export default StaffTable;
