import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  Activity,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const AdminManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const token = localStorage.getItem("accessToken");

  // Activity logs states
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  console.log("Activity Logs:", activityLogs);

  useEffect(() => {
    document.title = "QuickAid | Admin Management";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchActivityLogs();
    fetchApprovalHistory();
  }, [currentPage]);

  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await api.get(`/staff-list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      toast.error("Error loading staff list");
      setStaffList([]);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const fetchActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await api.get(`/users/staff-activity/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const logs = Array.isArray(response.data) ? response.data : response.data.results || [];

      setActivityLogs(logs);

      // if (!response.data || !Array.isArray(response.data)) {
      //   throw new Error("Invalid data format received");
      // }

      // setActivityLogs(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to load activity logs";
      toast.error(errorMessage);
      setActivityLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchApprovalHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get(`/approved/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApprovalHistory(res.data || []);
    } catch {
      toast.error("Error loading approval batch history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/register_staff/`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff registered successfully!");
      setFormData({ username: "", password: "", first_name: "", last_name: "", email: "" });
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async id => {
    toast(
      t => (
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-gray-800 font-medium">Confirm Deletion</p>
          </div>
          <p className="text-gray-600 text-sm text-center mb-4">
            Are you sure you want to delete this staff member? This action cannot be undone.
          </p>
          <div className="flex gap-2 w-full">
            <button
              className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/delete-staff/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("Staff deleted successfully");
                  fetchStaff();
                } catch {
                  toast.error("Failed to delete staff");
                }
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/update-staff/${editData.id}/`, editData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Staff updated successfully!");
      fetchStaff();
      setEditData(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Update failed";
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = lastActive => {
    if (!lastActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          Offline
        </span>
      );
    }

    const last = new Date(lastActive);
    const now = new Date();
    const diff = (now - last) / 1000;

    if (diff < 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </span>
      );
    }
    if (diff < 300) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        Offline
      </span>
    );
  };

  const getActionBadge = action => {
    const actionStyles = {
      login: "bg-green-100 text-green-800",
      logout: "bg-red-100 text-red-800",
      create: "bg-blue-100 text-blue-800",
      update: "bg-yellow-100 text-yellow-800",
      delete: "bg-red-100 text-red-800",
    };

    const style = actionStyles[action?.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${style}`}
      >
        {action || "Unknown"}
      </span>
    );
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activityLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activityLogs.length / itemsPerPage);

  return (
    <div className="p-6 bg-quickaid-bg min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#2d3748",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#38b2ac",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87272",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-quickaid-text-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-quickaid-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-quickaid-accent" />
              </div>
              Admin Management
            </h1>
            <p className="text-quickaid-text-secondary mt-2">
              Manage staff members and monitor system activity
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-quickaid-accent hover:bg-teal-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* Staff Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-quickaid-text-secondary">Total Staff</p>
                <p className="text-2xl font-bold text-quickaid-text-primary">
                  {staffList.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-quickaid-text-secondary">
                  Online Staff
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    staffList.filter(staff => {
                      if (!staff.last_active) return false;
                      const diff = (new Date() - new Date(staff.last_active)) / 1000;
                      return diff < 60;
                    }).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-quickaid-text-secondary">
                  Recent Activities
                </p>
                <p className="text-2xl font-bold text-quickaid-text-primary">
                  {activityLogs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Staff List Section */}
          <div className="xl:col-span-2">
            <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-quickaid-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-quickaid-accent" />
                  </div>
                  <h2 className="text-xl font-semibold text-quickaid-text-primary">
                    Staff Members
                  </h2>
                </div>
                <div className="text-sm text-quickaid-text-secondary">
                  {staffList.length} total
                </div>
              </div>

              {isLoadingStaff ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin mb-3" />
                  <p className="text-quickaid-text-secondary">Loading staff members...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                          Username
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                          Full Name
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                          Email
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-quickaid-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList && staffList.length > 0 ? (
                        staffList.map(staff => (
                          <tr
                            key={staff.id}
                            className="border-b border-gray-50 last:border-b-0 hover:bg-quickaid-bg/50 transition-colors"
                          >
                            <td className="px-4 py-4">{getStatusBadge(staff.last_active)}</td>
                            <td className="px-4 py-4 font-medium text-quickaid-text-primary">
                              {staff.username}
                            </td>
                            <td className="px-4 py-4 text-quickaid-text-secondary">
                              {staff.first_name} {staff.last_name}
                            </td>
                            <td className="px-4 py-4 text-quickaid-text-secondary">
                              {staff.email}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditData(staff)}
                                  className="p-2 text-quickaid-accent hover:bg-quickaid-accent/10 rounded-lg transition-colors"
                                  title="Edit Staff"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(staff.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center px-4 py-12 text-quickaid-text-secondary"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-quickaid-text-secondary opacity-50" />
                              </div>
                              <p className="text-lg font-medium mb-1">
                                No staff members found
                              </p>
                              <p className="text-sm">
                                Start by adding your first staff member
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs Section */}
          <div className="xl:col-span-1">
            <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-quickaid-accent/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Recent Activity
                </h2>
              </div>

              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin mb-3" />
                  <p className="text-quickaid-text-secondary">Loading activities...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {currentItems && currentItems.length > 0 ? (
                      currentItems.map(log => (
                        <div
                          key={log.id}
                          className="p-4 bg-quickaid-bg/50 rounded-xl border border-gray-100 hover:border-quickaid-accent/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-medium text-quickaid-text-primary">
                              {log.staff_member || "Unknown"}
                            </span>
                            <span className="text-xs text-quickaid-text-secondary whitespace-nowrap">
                              {format(new Date(log.timestamp), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <div className="mb-2">{getActionBadge(log.action)}</div>
                          <p className="text-xs text-quickaid-text-secondary">
                            {log.details || "No details"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-quickaid-text-secondary">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Activity className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium mb-1">No activity logs found</p>
                        <p className="text-xs">
                          Activity will appear here when staff members perform actions
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagination for Activity Logs */}
                  {activityLogs && activityLogs.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-quickaid-text-secondary">
                          Showing {indexOfFirstItem + 1}-
                          {Math.min(indexOfLastItem, activityLogs.length)} of{" "}
                          {activityLogs.length}
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={e => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="select select-sm select-bordered text-xs border-gray-200 focus:border-quickaid-accent"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 text-quickaid-text-secondary hover:text-quickaid-accent hover:bg-quickaid-accent/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-quickaid-text-secondary px-3 py-1.5">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(prev => Math.min(prev + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          className="p-1.5 text-quickaid-text-secondary hover:text-quickaid-accent hover:bg-quickaid-accent/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Approval Batch History Section */}
        <div className="mt-8">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-quickaid-accent/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Approval Batch History
                </h2>
              </div>
              <div className="text-sm text-quickaid-text-secondary">
                {approvalHistory.length} batches
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin mb-3" />
                <p className="text-quickaid-text-secondary">Loading approval history...</p>
              </div>
            ) : approvalHistory && approvalHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                        File
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                        Uploaded By
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-quickaid-text-secondary">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-quickaid-text-secondary">
                        Processed
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-quickaid-text-secondary">
                        Approved
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-quickaid-text-secondary">
                        Already Approved
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-quickaid-text-secondary">
                        Not Found
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalHistory.map(batch => (
                      <tr
                        key={batch.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-quickaid-bg/50 transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-quickaid-text-primary">
                          {batch.file_name}
                        </td>
                        <td className="px-4 py-4 text-quickaid-text-secondary">
                          {batch.uploaded_by}
                        </td>
                        <td className="px-4 py-4 text-quickaid-text-secondary">
                          {format(new Date(batch.uploaded_at), "MMM d, yyyy h:mm a")}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {batch.total_processed}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {batch.total_approved}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            {batch.total_already_approved}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {batch.total_not_found}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-quickaid-text-secondary">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium mb-1">No approval batches found</p>
                <p className="text-sm">
                  Approval batches will appear here when files are processed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Staff Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-quickaid-accent/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-quickaid-accent" />
                </div>
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Register New Staff
                </h2>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                  />
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-quickaid-text-secondary" />
                      ) : (
                        <Eye className="h-4 w-4 text-quickaid-text-secondary" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-quickaid-accent/10 rounded-full flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-quickaid-accent" />
                </div>
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Edit Staff Member
                </h2>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={editData.username}
                    onChange={e => setEditData({ ...editData, username: e.target.value })}
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      value={editData.first_name}
                      onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      value={editData.last_name}
                      onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                  />
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showEditPassword ? "text" : "password"}
                      placeholder="Enter new password or leave blank"
                      onChange={e => setEditData({ ...editData, password: e.target.value })}
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-quickaid-accent border-gray-200"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      {showEditPassword ? (
                        <EyeOff className="h-4 w-4 text-quickaid-text-secondary" />
                      ) : (
                        <Eye className="h-4 w-4 text-quickaid-text-secondary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setEditData(null)}
                  className="flex-1 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
