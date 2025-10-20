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
    FileText,
    Mail,
    Lock,
    User, // Added for name inputs in modal
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- Custom Tailwind Theme Configuration for Blue Theme ---
const theme = {
    // Primary blue for main accents, buttons, and icons
    primary: "indigo-600",
    primaryHover: "indigo-700",
    // Light background for accents
    primaryLight: "indigo-100",
    // Main background color (subtle light gray)
    background: "gray-50",
    // Card/surface color (pure white for contrast)
    surface: "white",
    // Dark text for headings
    textPrimary: "gray-800",
    // Lighter text for details/secondary info
    textSecondary: "gray-500",
};

const AdminManagement = () => {
    // Original states are preserved
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

    // --- Helper Functions (Preserved/Minorly Refined) ---

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
    // Using a more modern blue-teal color for accent: 'indigo-600'
    const newColors = {
      quickaidBg: theme.background,
      quickaidSurface: theme.surface,
      quickaidAccent: theme.primary,
      quickaidTextPrimary: theme.textPrimary,
      quickaidTextSecondary: theme.textSecondary,
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
      await api.post(`/register_staff/`, formData, {
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
        <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-lg text-gray-800 font-semibold">Confirm Deletion</p>
          </div>
          <p className="text-gray-600 text-sm text-center mb-5">
            Are you sure you want to delete this staff member? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 shadow-md"
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
              <Trash2 size={16} /> Delete
            </button>
            <button
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-md"
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
    const isOnline = lastActive ? (new Date() - new Date(lastActive)) / 1000 < 60 : false;
    const isIdle = !isOnline && lastActive ? (new Date() - new Date(lastActive)) / 1000 < 300 : false;

    if (isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </span>
      );
    }
    if (isIdle) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Offline
      </span>
    );
  };

  const getActionBadge = action => {
    const actionStyles = {
      login: "bg-green-100 text-green-700",
      logout: "bg-red-100 text-red-700",
      create: `bg-${theme.primaryLight} text-${theme.primary}`,
      update: "bg-yellow-100 text-yellow-700",
      delete: "bg-red-100 text-red-700",
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

    const handleEditChange = e => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await api.post(`/register_staff/`, formData, {
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
                <div className={`bg-${theme.surface} p-5 rounded-xl shadow-2xl flex flex-col items-center max-w-sm border border-gray-100`}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <p className={`text-lg text-${theme.textPrimary} font-semibold`}>Confirm Deletion</p>
                    </div>
                    <p className={`text-${theme.textSecondary} text-sm text-center mb-5`}>
                        Are you sure you want to delete this staff member? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 shadow-md"
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
                            <Trash2 size={16} /> Delete
                        </button>
                        <button
                            className={`flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-${theme.textPrimary} rounded-lg text-sm font-semibold transition-colors shadow-md`}
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
        const now = new Date();
        const lastActiveDate = lastActive ? new Date(lastActive) : null;
        // Online: within 60 seconds (1 minute)
        const isOnline = lastActiveDate ? (now - lastActiveDate) / 1000 < 60 : false;
        // Idle: within 300 seconds (5 minutes)
        const isIdle = !isOnline && lastActiveDate ? (now - lastActiveDate) / 1000 < 300 : false;

        if (isOnline) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                </span>
            );
        }
        if (isIdle) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Idle
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Offline
            </span>
        );
    };

    const getActionBadge = action => {
        const actionStyles = {
            login: "bg-green-100 text-green-700",
            logout: "bg-red-100 text-red-700",
            create: `bg-indigo-100 text-indigo-700`, // Used indigo for 'create'
            update: "bg-yellow-100 text-yellow-700",
            delete: "bg-red-100 text-red-700",
            // Default to the primary blue for other actions
            default: `bg-indigo-100 text-indigo-700`,
        };

        const style = actionStyles[action?.toLowerCase()] || actionStyles.default;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${style}`}
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

    // Helper for responsive padding
    const responsivePadding = "p-4 sm:p-6";

    // --- Rendered Component (Modified for Modern Blue Theme and Responsiveness) ---

    return (
        <div className={`p-4 sm:p-6 lg:p-8 bg-${theme.background} min-h-screen font-sans`}>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: theme.surface,
                        color: theme.textPrimary,
                        border: `1px solid #e2e8f0`,
                        borderRadius: "0.75rem",
                        boxShadow:
                            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    },
                    success: { iconTheme: { primary: `#4f46e5`, secondary: theme.surface } },
                    error: { iconTheme: { primary: `#ef4444`, secondary: theme.surface } },
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-3xl sm:text-4xl font-bold text-blue-900 tracking-tight flex items-center gap-3`}>
                            <div className={`w-10 h-10 bg-${theme.primaryLight} rounded-xl flex items-center justify-center`}>
                                <Users className={`w-6 h-6 text-${theme.primary}`} />
                            </div>
                            Admin Management
                        </h1>
                        <p className={`text-sm md:text-base text-${theme.textSecondary} mt-2`}>
                            Manage staff members and monitor all system activity.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className={`mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-${theme.primary} hover:bg-${theme.primaryHover} text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-300/50 hover:shadow-xl`}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New Staff
                    </button>
                </div>

                {/* Staff Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Staff Card */}
                    <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100 transition-shadow duration-300 hover:shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-semibold text-${theme.textSecondary}`}>Total Staff</p>
                                <p className={`text-3xl font-bold text-${theme.textPrimary} mt-1`}>
                                    {staffList.length}
                                </p>
                            </div>
                            <div className={`w-14 h-14 bg-${theme.primaryLight} rounded-xl flex items-center justify-center shadow-md`}>
                                <Users className={`w-7 h-7 text-${theme.primary}`} />
                            </div>
                        </div>
                    </div>

                    {/* Online Staff Card */}
                    <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100 transition-shadow duration-300 hover:shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-semibold text-${theme.textSecondary}`}>
                                    Currently Online
                                </p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {
                                        staffList.filter(staff => {
                                            if (!staff.last_active) return false;
                                            const diff = (new Date() - new Date(staff.last_active)) / 1000;
                                            return diff < 60;
                                        }).length
                                    }
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities Card */}
                    <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100 transition-shadow duration-300 hover:shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-semibold text-${theme.textSecondary}`}>
                                    Total Activity Logs
                                </p>
                                <p className={`text-3xl font-bold text-${theme.textPrimary} mt-1`}>
                                    {activityLogs.length}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shadow-md">
                                <Activity className="w-7 h-7 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Staff List and Activity Logs */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Staff List Section (Takes 2/3 width on large screens) */}
                    <div className="xl:col-span-2">
                        <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 bg-${theme.primaryLight} rounded-lg flex items-center justify-center`}>
                                        <Users className={`w-5 h-5 text-${theme.primary}`} />
                                    </div>
                                    <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                                        Staff Members
                                    </h2>
                                </div>
                                <div className={`text-sm font-semibold text-${theme.textSecondary}`}>
                                    {staffList.length} total
                                </div>
                            </div>

                            {isLoadingStaff ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Loader2 className={`w-8 h-8 text-${theme.primary} animate-spin mb-3`} />
                                    <p className={`text-${theme.textSecondary}`}>Loading staff members...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                {["Status", "Username", "Full Name", "Email", "Actions"].map(header => (
                                                    <th key={header} className={`px-4 py-3 text-left font-semibold text-${theme.textSecondary} first:rounded-tl-xl last:rounded-tr-xl`}>
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffList && staffList.length > 0 ? (
                                                staffList.map(staff => (
                                                    <tr
                                                        key={staff.id}
                                                        className={`border-b border-gray-100 last:border-b-0 hover:bg-${theme.background} transition-colors`}
                                                    >
                                                        <td className="px-4 py-3.5">{getStatusBadge(staff.last_active)}</td>
                                                        <td className={`px-4 py-3.5 font-semibold text-${theme.textPrimary}`}>{staff.username}</td>
                                                        <td className={`px-4 py-3.5 text-${theme.textSecondary}`}>{staff.first_name} {staff.last_name}</td>
                                                        <td className={`px-4 py-3.5 text-${theme.textSecondary}`}>{staff.email}</td>
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex items-center justify-start gap-2">
                                                                <button
                                                                    onClick={() => setEditData(staff)}
                                                                    className={`p-2 text-${theme.primary} hover:bg-${theme.primaryLight} rounded-lg transition-colors`}
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
                                                        className={`text-center px-4 py-12 text-${theme.textSecondary}`}
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                                <Users className={`w-8 h-8 text-${theme.textSecondary} opacity-50`} />
                                                            </div>
                                                            <p className="text-lg font-semibold mb-1">
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

                    {/* Activity Logs Section (Takes 1/3 width on large screens) */}
                    <div className="xl:col-span-1">
                        <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-8 h-8 bg-${theme.primaryLight} rounded-lg flex items-center justify-center`}>
                                    <Activity className={`w-5 h-5 text-${theme.primary}`} />
                                </div>
                                <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                                    Recent Activity
                                </h2>
                            </div>

                            {isLoadingLogs ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Loader2 className={`w-8 h-8 text-${theme.primary} animate-spin mb-3`} />
                                    <p className={`text-${theme.textSecondary}`}>Loading activities...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto pr-2">
                                        {currentItems && currentItems.length > 0 ? (
                                            currentItems.map(log => (
                                                <div
                                                    key={log.id}
                                                    className={`p-3 bg-${theme.background} rounded-xl border border-gray-100 hover:border-${theme.primary}/20 transition-colors`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <span className={`text-sm font-semibold text-${theme.textPrimary}`}>
                                                            {log.staff_member || "Unknown"}
                                                        </span>
                                                        <span className={`text-xs text-${theme.textSecondary} whitespace-nowrap`}>
                                                            {format(new Date(log.timestamp), "MMM d, h:mm a")}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2">{getActionBadge(log.action)}</div>
                                                    <p className={`text-xs text-${theme.textSecondary} truncate`}>
                                                        {log.details || "No details provided"}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={`text-center py-8 text-${theme.textSecondary}`}>
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                                    <Activity className="w-8 h-8 opacity-50 text-gray-400" />
                                                </div>
                                                <p className="font-semibold mb-1">No activity logs found</p>
                                                <p className="text-xs">
                                                    Activity will appear here when staff members perform actions
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination for Activity Logs */}
                                    {activityLogs && activityLogs.length > 0 && (
                                        <div className="border-t border-gray-100 pt-4 flex flex-col items-center sm:flex-row sm:justify-between">
                                            <span className={`text-xs text-${theme.textSecondary} mb-2 sm:mb-0`}>
                                                Showing {indexOfFirstItem + 1}-
                                                {Math.min(indexOfLastItem, activityLogs.length)} of{" "}
                                                {activityLogs.length}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={e => {
                                                        setItemsPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    // Refined select styling for modern look
                                                    className={`select select-sm border-gray-300 rounded-lg text-xs focus:border-${theme.primary} focus:ring-1 focus:ring-${theme.primary} text-${theme.textPrimary} py-1.5`}
                                                >
                                                    <option value={5}>5 per page</option>
                                                    <option value={10}>10 per page</option>
                                                    <option value={20}>20 per page</option>
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className={`p-2 text-${theme.textSecondary} hover:text-${theme.primary} hover:bg-${theme.primaryLight} rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <span className={`text-sm font-semibold text-${theme.textPrimary} px-2 py-1`}>
                                                        {currentPage} / {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            setCurrentPage(prev => Math.min(prev + 1, totalPages))
                                                        }
                                                        disabled={currentPage === totalPages}
                                                        className={`p-2 text-${theme.textSecondary} hover:text-${theme.primary} hover:bg-${theme.primaryLight} rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Approval Batch History Section --- */}
                <div className="mt-8">
                    <div className={`bg-${theme.surface} shadow-lg rounded-2xl ${responsivePadding} border border-gray-100`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 bg-${theme.primaryLight} rounded-lg flex items-center justify-center`}>
                                    <CheckCircle className={`w-5 h-5 text-${theme.primary}`} />
                                </div>
                                <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                                    Approval Batch History
                                </h2>
                            </div>
                            <div className={`text-sm font-semibold text-${theme.textSecondary}`}>
                                {approvalHistory.length} batches
                            </div>
                        </div>

                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Loader2 className={`w-8 h-8 text-${theme.primary} animate-spin mb-3`} />
                                <p className={`text-${theme.textSecondary}`}>Loading approval history...</p>
                            </div>
                        ) : approvalHistory && approvalHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            {["File", "Uploaded By", "Date", "Processed", "Approved", "Already Approved", "Not Found"].map(header => (
                                                <th key={header} className={`px-4 py-3 text-left font-semibold text-${theme.textSecondary} whitespace-nowrap`}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvalHistory.map(batch => (
                                            <tr
                                                key={batch.id}
                                                className={`border-b border-gray-100 last:border-b-0 hover:bg-${theme.background} transition-colors`}
                                            >
                                                <td className={`px-4 py-3.5 font-semibold text-${theme.textPrimary} flex items-center gap-2 whitespace-nowrap`}>
                                                    <FileText className={`w-4 h-4 text-${theme.primary}`} />
                                                    {batch.file_name}
                                                </td>
                                                <td className={`px-4 py-3.5 text-${theme.textSecondary} whitespace-nowrap`}>{batch.uploaded_by}</td>
                                                <td className={`px-4 py-3.5 text-${theme.textSecondary} whitespace-nowrap`}>
                                                    {format(new Date(batch.uploaded_at), "MMM d, yyyy h:mm a")}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full`}>
                                                        {batch.total_processed}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full`}>
                                                        {batch.total_approved}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full`}>
                                                        {batch.total_already_approved}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full`}>
                                                        {batch.total_not_found}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={`text-center py-12 text-${theme.textSecondary}`}>
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <CheckCircle className="w-8 h-8 opacity-50 text-gray-400" />
                                </div>
                                <p className="text-lg font-semibold mb-1">No approval batches found</p>
                                <p className="text-sm">
                                    Approval batches will appear here when files are processed
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Add Staff Modal --- */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300">
                        <div className={`bg-${theme.surface} rounded-2xl shadow-2xl w-full max-w-lg transition-transform duration-300 scale-100 border border-gray-100`}>
                            {/* Modal Header */}
                            <div className={`flex items-center gap-3 p-6 border-b border-gray-100`}>
                                <div className={`w-10 h-10 bg-${theme.primaryLight} rounded-full flex items-center justify-center shadow-md`}>
                                    <UserPlus className={`w-5 h-5 text-${theme.primary}`} />
                                </div>
                                <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                                    Register New Staff Member
                                </h2>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-5">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>First Name</label>
                                        <div className="relative">
                                            <input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                placeholder="e.g., Jane"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Last Name</label>
                                        <div className="relative">
                                            <input
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                placeholder="e.g., Doe"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Username & Email Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Username</label>
                                        <div className="relative">
                                            <input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Enter username"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Password Field */}
                                <div className="form-control">
                                    <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter initial password"
                                            className={`w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                        />
                                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-${theme.textSecondary} hover:text-${theme.primary} rounded-full transition-colors`}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={`px-5 py-2.5 text-sm bg-gray-200 hover:bg-gray-300 text-${theme.textPrimary} rounded-xl font-semibold transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-${theme.primary} hover:bg-${theme.primaryHover} text-white rounded-xl font-semibold transition-all duration-200 shadow-md shadow-indigo-300/50`}
                                >
                                    <Save className="w-4 h-4" />
                                    Register Staff
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Edit Staff Modal (Reusing structure for professionalism) --- */}
                {editData && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300">
                        <div className={`bg-${theme.surface} rounded-2xl shadow-2xl w-full max-w-lg transition-transform duration-300 scale-100 border border-gray-100`}>
                            {/* Modal Header */}
                            <div className={`flex items-center gap-3 p-6 border-b border-gray-100`}>
                                <div className={`w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shadow-md`}>
                                    <Edit3 className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                                    Edit Staff Member: {editData.username}
                                </h2>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-5">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>First Name</label>
                                        <div className="relative">
                                            <input
                                                name="first_name"
                                                value={editData.first_name || ''}
                                                onChange={handleEditChange}
                                                placeholder="First Name"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Last Name</label>
                                        <div className="relative">
                                            <input
                                                name="last_name"
                                                value={editData.last_name || ''}
                                                onChange={handleEditChange}
                                                placeholder="Last Name"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Username & Email Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Username (Disabled)</label>
                                        <div className="relative">
                                            <input
                                                name="username"
                                                value={editData.username || ''}
                                                readOnly
                                                disabled
                                                className={`w-full p-2.5 pl-10 border border-gray-200 bg-gray-100 rounded-lg text-sm text-${theme.textSecondary} transition-colors cursor-not-allowed`}
                                            />
                                            <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={editData.email || ''}
                                                onChange={handleEditChange}
                                                placeholder="Enter email address"
                                                className={`w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                            />
                                            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Field (Optional update) */}
                                <div className="form-control">
                                    <label className={`block text-sm font-semibold text-${theme.textPrimary} mb-1`}>New Password (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type={showEditPassword ? "text" : "password"}
                                            name="password"
                                            value={editData.password || ''}
                                            onChange={handleEditChange}
                                            placeholder="Leave blank to keep current password"
                                            className={`w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-colors`}
                                        />
                                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-${theme.textSecondary}`} />
                                        <button
                                            type="button"
                                            onClick={() => setShowEditPassword(prev => !prev)}
                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-${theme.textSecondary} hover:text-${theme.primary} rounded-full transition-colors`}
                                            title={showEditPassword ? "Hide password" : "Show password"}
                                        >
                                            {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                                <button
                                    onClick={() => setEditData(null)}
                                    className={`px-5 py-2.5 text-sm bg-gray-200 hover:bg-gray-300 text-${theme.textPrimary} rounded-xl font-semibold transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md shadow-yellow-300/50`}
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