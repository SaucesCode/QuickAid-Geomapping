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
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const token = localStorage.getItem("accessToken");

  // Activity logs states
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "QuickAid | Admin Management";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchActivityLogs();
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

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid data format received");
      }

      setActivityLogs(response.data);
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
          <p className="text-gray-800">Are you sure you want to delete this staff member?</p>
          <div className="mt-4 space-x-2">
            <button
              className="btn btn-error"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/delete-staff/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("✅ Staff deleted");
                  fetchStaff();
                } catch {
                  toast.error("❌ Failed to delete staff");
                }
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
            <button className="btn" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    ); // Set duration to Infinity to keep the toast open until a button is clicked
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
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Offline
        </span>
      );
    }

    const last = new Date(lastActive);
    const now = new Date();
    const diff = (now - last) / 1000;

    if (diff < 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Online
        </span>
      );
    }
    if (diff < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
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
              <Users className="w-8 h-8 text-quickaid-accent" />
              Admin Management
            </h1>
            <p className="text-quickaid-text-secondary mt-2">
              Manage staff members and monitor system activity
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn bg-quickaid-accent hover:bg-teal-600 text-white border-quickaid-accent flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Staff List Section */}
          <div className="xl:col-span-2">
            <div className="card bg-quickaid-surface shadow-md rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-quickaid-accent" />
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Staff List
                </h2>
              </div>

              {isLoadingStaff ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-quickaid-text-secondary uppercase bg-quickaid-bg">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Username</th>
                        <th className="px-4 py-3 text-left font-medium">Full Name</th>
                        <th className="px-4 py-3 text-left font-medium">Email</th>
                        <th className="px-4 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList && staffList.length > 0 ? (
                        staffList.map(staff => (
                          <tr
                            key={staff.id}
                            className="border-b border-gray-100 last:border-b-0 hover:bg-quickaid-bg transition-colors"
                          >
                            <td className="px-4 py-3">{getStatusBadge(staff.last_active)}</td>
                            <td className="px-4 py-3 font-medium text-quickaid-text-primary">
                              {staff.username}
                            </td>
                            <td className="px-4 py-3 text-quickaid-text-secondary">
                              {staff.first_name} {staff.last_name}
                            </td>
                            <td className="px-4 py-3 text-quickaid-text-secondary">
                              {staff.email}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditData(staff)}
                                  className="p-2 text-quickaid-accent hover:bg-quickaid-bg rounded-lg transition-colors"
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
                            className="text-center px-4 py-8 text-quickaid-text-secondary"
                          >
                            <div className="flex flex-col items-center">
                              <Users className="w-8 h-8 text-quickaid-text-secondary mb-2 opacity-50" />
                              <p>No staff members found</p>
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
            <div className="card bg-quickaid-surface shadow-md rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-quickaid-accent" />
                <h2 className="text-xl font-semibold text-quickaid-text-primary">
                  Recent Activity
                </h2>
              </div>

              {isLoadingLogs ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {currentItems && currentItems.length > 0 ? (
                      currentItems.map(log => (
                        <div
                          key={log.id}
                          className="p-3 bg-quickaid-bg rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-medium text-quickaid-text-primary">
                              {log.staff_member || "Unknown"}
                            </span>
                            <span className="text-xs text-quickaid-text-secondary">
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
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No activity logs found</p>
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
                          className="select select-sm select-bordered text-xs"
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
                          className="p-1 text-quickaid-text-secondary hover:text-quickaid-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-quickaid-text-secondary px-2">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(prev => Math.min(prev + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          className="p-1 text-quickaid-text-secondary hover:text-quickaid-accent disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Add Staff Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="modal-box bg-quickaid-surface rounded-xl shadow-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-quickaid-text-primary mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-quickaid-accent" />
                Register New Staff
              </h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="btn flex-1 bg-quickaid-accent hover:bg-teal-600 text-white border-quickaid-accent"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Staff
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="modal-box bg-quickaid-surface rounded-xl shadow-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-quickaid-text-primary mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-quickaid-accent" />
                Edit Staff Member
              </h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={editData.username}
                    onChange={e => setEditData({ ...editData, username: e.target.value })}
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                    className="input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
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
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-quickaid-accent"
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="btn flex-1 bg-quickaid-accent hover:bg-teal-600 text-white border-quickaid-accent"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditData(null)}
                  className="btn flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
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
