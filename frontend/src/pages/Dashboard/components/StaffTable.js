import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Users, Edit3, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, H2, Spinner, Badge } from "../../../components/DesignSystem";

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

const StaffTable = ({ onEdit }) => {
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
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <H2>Staff Members</H2>
        </div>
        <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
          {staffList.length} total
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : staffList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
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
                  <td className="px-4 py-3 font-medium text-gray-800">{staff.username}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {staff.first_name} {staff.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{staff.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(staff)}
                        className="p-2 text-[#003a76] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeStaff({ id: staff.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
    </Card>
  );
};

export default StaffTable;
