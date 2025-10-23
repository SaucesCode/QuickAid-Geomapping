import React, { useState } from "react";
import { Users, UserPlus, Mail, Lock, Eye, EyeOff, Save } from "lucide-react";
import SupportMessages from "./components/SupportMessages";
import ActivityLogs from "./components/ActivityLogs";
import StaffTable from "./components/StaffTable";
import { api } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const AdminManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  // 💠 Theme system
  const theme = {
    primary: "indigo-600",
    primaryHover: "indigo-700",
    primaryLight: "indigo-50",
    background: "gray-50",
    surface: "white",
    textPrimary: "gray-800",
    textSecondary: "gray-500",
  };

  // 💠 Your auth token (if needed)
  const token = localStorage.getItem("accessToken");

  const handleSubmit = async () => {
    try {
      await api.post(`/register_staff/`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff registered successfully!");

      queryClient.invalidateQueries(["staffList"]);

      setFormData({ username: "", password: "", first_name: "", last_name: "", email: "" });
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen bg-${theme.background} p-6 lg:p-8`}>
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
      {/* --- Header --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              Admin Management
            </h1>
            <p className="text-base md:text-lg text-gray-600 ml-[72px]">
              Manage staff members, monitor activity, and handle support requests
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5" />
            Add New Staff
          </button>
        </div>
      </div>

      {/* --- Main Content Layout --- */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Support Messages Section */}
        <SupportMessages theme={theme} token={token} />

        {/* Staff Table Section */}
        <StaffTable theme={theme} token={token} />

        {/* Activity Logs Section */}
        <ActivityLogs theme={theme} token={token} />
      </div>

      {/* --- Add Staff Modal (Optional Placeholder) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div
            className={`bg-${theme.surface} rounded-3xl shadow-2xl shadow-indigo-500/20 w-full max-w-lg scale-100 transform transition-all duration-300`}
          >
            {/* Modal Header */}
            <div className={`flex items-center gap-4 p-6 border-b border-gray-100`}>
              <div
                // CHANGED: Square container for icon
                className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <UserPlus className={`w-5 h-5 text-white`} />
              </div>
              <h2 className={`text-xl font-bold text-${theme.textPrimary}`}>
                Register New Staff Member
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label
                    className={`block text-sm font-medium text-${theme.textPrimary} mb-1`}
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane"
                      // Enhanced input styling
                      className={`w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-shadow`}
                    />
                    <Users
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label
                    className={`block text-sm font-medium text-${theme.textPrimary} mb-1`}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g., Doe"
                      // Enhanced input styling
                      className={`w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-shadow`}
                    />
                    <Users
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                    />
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-${theme.textPrimary} mb-1`}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., jane.doe@quickaid.com"
                    // Enhanced input styling
                    className={`w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-shadow`}
                  />
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-${theme.textPrimary} mb-1`}>
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    // Enhanced input styling
                    className={`w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-shadow`}
                  />
                  <UserPlus
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-${theme.textPrimary} mb-1`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    // Enhanced input styling
                    className={`w-full p-3 pr-10 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} text-sm text-${theme.textPrimary} transition-shadow`}
                  />
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                // Enhanced primary button
                className={`px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-blue-300/50 hover:shadow-lg`}
              >
                <Save className="w-4 h-4" />
                Register Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
