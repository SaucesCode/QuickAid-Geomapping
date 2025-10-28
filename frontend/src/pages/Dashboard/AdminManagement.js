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

  // 💠 Theme system - UPDATED for blue monochromatic consistency
  const theme = {
    primary: "indigo-600",
    primaryHover: "indigo-700",
    primaryLight: "blue-100", // Changed to blue-100
    background: "blue-50",    // Changed to blue-50 for a light blue page background
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
    // REFACTORED: Main container style with subtle background gradients and relative positioning
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      {/* REFACTORED: Absolute background effects from DemographicsEconomics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* REFACTORED: Content wrapper with padding and z-index */}
      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
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
            // UPDATED: Success icon theme uses blue-600 for monochromatic look
            success: { iconTheme: { primary: `#2563eb`, secondary: theme.surface } }, 
            error: { iconTheme: { primary: `#ef4444`, secondary: theme.surface } },
          }}
        />
        {/* --- Header - REFACTORED to new card style --- */}
        <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center gap-4 mb-2">
                {/* REFACTORED: Icon container matches DemographicsEconomics: w-16 h-16, larger shadow */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                Admin Management
              </h1>
              <p className="text-base md:text-lg text-gray-600 ml-[80px]">
                Manage staff members, monitor activity, and handle support requests
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              // Button style already matches the desired look
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-400/50 hover:shadow-2xl hover:shadow-indigo-400/50 hover:scale-[1.02] active:scale-100 flex-shrink-0"
            >
              <UserPlus className="w-5 h-5" />
              Add New Staff
            </button>
          </div>
        </header>

        {/* --- Main Content Layout --- */}
        <div className="space-y-8">
          {/* Support Messages Section */}
          <SupportMessages theme={theme} token={token} />

          {/* Staff Table Section */}
          <StaffTable theme={theme} token={token} />

          {/* Activity Logs Section */}
          <ActivityLogs theme={theme} token={token} />
        </div>
      </div>

      {/* --- Add Staff Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div
            // REFACTORED: Modal container style to match DemographicsEconomics card style
            className={`bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 w-full max-w-lg scale-100 transform transition-all duration-300`}
          >
            {/* Modal Header */}
            <div className={`flex items-center gap-4 p-6 border-b border-gray-100`}>
              <div
                // REFACTORED: Icon container style to match DemographicsEconomics
                className={`w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <UserPlus className={`w-6 h-6 text-white`} />
              </div>
              <h2 className={`text-2xl font-bold text-gray-800`}>
                Register New Staff Member
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label
                    className={`block text-sm font-medium text-gray-600 mb-1`}
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane"
                      // Input styling preserved
                      className={`w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-600 text-sm text-gray-800 transition-all hover:border-indigo-400`}
                    />
                    <Users
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label
                    className={`block text-sm font-medium text-gray-600 mb-1`}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g., Doe"
                      // Input styling preserved
                      className={`w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-600 text-sm text-gray-800 transition-all hover:border-indigo-400`}
                    />
                    <Users
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                    />
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., jane.doe@quickaid.com"
                    // Input styling preserved
                    className={`w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-600 text-sm text-gray-800 transition-all hover:border-indigo-400`}
                  />
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    // Input styling preserved
                    className={`w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-600 text-sm text-gray-800 transition-all hover:border-indigo-400`}
                  />
                  <UserPlus
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className={`block text-sm font-medium text-gray-600 mb-1`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    // Input styling preserved
                    className={`w-full p-3.5 pr-10 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-600 text-sm text-gray-800 transition-all hover:border-indigo-400`}
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
                // REFACTORED: Monochromatic gray/blue cancel button style from DemographicsEconomics
                className="px-6 py-3 text-sm font-semibold bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-xl transition-colors hover:text-blue-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                // Primary button style is already matching the desired look
                className={`px-6 py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-400/50 hover:shadow-xl hover:scale-[1.01] active:scale-100`}
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