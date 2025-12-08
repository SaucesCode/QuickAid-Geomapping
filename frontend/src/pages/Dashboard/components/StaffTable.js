import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { Users, Edit3, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Card, H2, Caption, Spinner, Badge } from "../../../components/DesignSystem";
import { DeactivateModal, ReactivateModal } from "./StaffModal";

// Fetch staff with active/inactive filter
const fetchStaffList = async ({ active = true }) => {
  const res = await api.get(`/staff-list/?active=${active}`);
  return res.data;
};

// Delete (deactivate) staff
const deleteStaff = async id => {
  await api.delete(`/delete-staff/${id}/`);
};

// Reactivate staff
const reactivateStaff = async id => {
  await api.post(`/reactivate-staff/${id}/`);
};

const StaffTable = ({ onEdit }) => {
  const queryClient = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Query for active/inactive staff
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staffList", showInactive],
    queryFn: () => fetchStaffList({ active: !showInactive }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Separate active and inactive for counts
  const { data: activeStaff = [] } = useQuery({
    queryKey: ["staffList", false],
    queryFn: () => fetchStaffList({ active: true }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: inactiveStaff = [] } = useQuery({
    queryKey: ["staffList", true],
    queryFn: () => fetchStaffList({ active: false }),
    staleTime: 1000 * 60 * 5,
  });

  // Deactivate staff mutation
  const { mutate: removeStaff, isPending: isDeleting } = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success("Staff deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      setDeactivateModalOpen(false);
      setSelectedStaff(null);
    },
    onError: error => {
      const message = error.response?.data?.error || "Failed to deactivate staff.";
      toast.error(message);
    },
  });

  // Reactivate staff mutation
  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: reactivateStaff,
    onSuccess: () => {
      toast.success("Staff reactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      setReactivateModalOpen(false);
      setSelectedStaff(null);
    },
    onError: error => {
      const message = error.response?.data?.error || "Failed to reactivate staff.";
      toast.error(message);
    },
  });

  const handleDeactivateClick = staff => {
    setSelectedStaff(staff);
    setDeactivateModalOpen(true);
  };

  const handleReactivateClick = staff => {
    setSelectedStaff(staff);
    setReactivateModalOpen(true);
  };

  const confirmDeactivate = () => {
    if (selectedStaff) {
      removeStaff(selectedStaff.id);
    }
  };

  const confirmReactivate = () => {
    if (selectedStaff) {
      reactivate(selectedStaff.id);
    }
  };

  const getStatusBadge = lastActive => {
    if (!lastActive) return <Badge variant="default">Inactive</Badge>;

    const diff = (new Date() - new Date(lastActive)) / 1000;

    if (diff < 60) {
      return <Badge variant="success">Online</Badge>;
    } else if (diff < 300) {
      return <Badge variant="warning">Idle</Badge>;
    }
    return <Badge variant="danger">Offline</Badge>;
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003a76] rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <H2>Staff Management</H2>
            <Caption>Manage staff accounts and permissions</Caption>
          </div>
        </div>

        {/* Filter buttons - Same design as Support Messages */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowInactive(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showInactive
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active ({activeStaff.length})
          </button>
          <button
            onClick={() => setShowInactive(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showInactive
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Deactivated ({inactiveStaff.length})
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-500">Loading staff...</p>
        </div>
      ) : staffList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Full Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr
                  key={staff.id}
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-4">{getStatusBadge(staff.last_active)}</td>
                  <td className="px-4 py-4 font-medium text-gray-800">{staff.username}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {staff.first_name} {staff.last_name}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{staff.email}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!showInactive ? (
                        <>
                          {/* Edit Button */}
                          <button
                            onClick={() => onEdit(staff)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-50"
                            disabled={isDeleting || isReactivating}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Deactivate Button */}
                          <button
                            onClick={() => handleDeactivateClick(staff)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                            disabled={isDeleting || isReactivating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        // Reactivate Button
                        <button
                          onClick={() => handleReactivateClick(staff)}
                          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          disabled={isDeleting || isReactivating}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            No {showInactive ? "deactivated" : "active"} staff members found.
          </p>
        </div>
      )}

      {/* Modals */}
      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => {
          setDeactivateModalOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={confirmDeactivate}
        isLoading={isDeleting}
        staffName={selectedStaff?.username || ""}
      />

      <ReactivateModal
        isOpen={reactivateModalOpen}
        onClose={() => {
          setReactivateModalOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={confirmReactivate}
        isLoading={isReactivating}
        staffName={selectedStaff?.username || ""}
      />
    </Card>
  );
};

export default StaffTable;
