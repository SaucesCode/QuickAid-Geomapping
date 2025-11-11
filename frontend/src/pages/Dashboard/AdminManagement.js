import React, { useState } from "react";
import { Users, UserPlus, Mail, Lock, Eye, EyeOff, Save, Edit3 } from "lucide-react";
import SupportMessages from "./components/SupportMessages";
import ActivityLogs from "./components/ActivityLogs";
import StaffTable from "./components/StaffTable";
import { api } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Import Design System Components
import {
  PageContainer,
  PageHeader,
  Card,
  Stack,
  GradientButton,
  OutlineButton,
} from "../../components/DesignSystem";

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
  const [editData, setEditData] = useState(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const queryClient = useQueryClient();

  const token = localStorage.getItem("accessToken");

  // Submit Logic - KEPT UNCHANGED
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

  const handleUpdate = async () => {
    try {
      await api.put(`/update-staff/${editData.id}/`, editData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Staff updated successfully!");
      queryClient.invalidateQueries(["staffList"]);
      setEditData(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageContainer>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "white",
            color: "#1f2937",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: { iconTheme: { primary: "#2563eb", secondary: "white" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "white" } },
        }}
      />

      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
        <PageHeader
          icon={Users}
          title="Admin Management"
          subtitle="Manage staff members, monitor activity, and handle support requests"
          action={
            <GradientButton onClick={() => setShowModal(true)}>
              <UserPlus className="w-4 h-4" />
              Add New Staff
            </GradientButton>
          }
        />

        {/* REDESIGNED: Using Stack for consistent spacing */}
        <Stack spacing="lg">
          <SupportMessages token={token} />
          <StaffTable
            token={token}
            onEdit={staff => {
              setEditData(staff);
            }}
          />
          <ActivityLogs token={token} />
        </Stack>
      </Stack>

      {/* Add Staff Modal - REDESIGNED */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <Card className="w-full max-w-lg scale-100 transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Register New Staff Member</h2>
            </div>

            {/* Modal Content */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane"
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600 text-sm text-gray-800 transition-all hover:border-blue-400"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g., Doe"
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600 text-sm text-gray-800 transition-all hover:border-blue-400"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., jane.doe@quickaid.com"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600 text-sm text-gray-800 transition-all hover:border-blue-400"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600 text-sm text-gray-800 transition-all hover:border-blue-400"
                  />
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full p-3 pr-10 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600 text-sm text-gray-800 transition-all hover:border-blue-400"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <OutlineButton onClick={() => setShowModal(false)}>Cancel</OutlineButton>
              <GradientButton onClick={handleSubmit}>
                <Save className="w-4 h-4" />
                Register Staff
              </GradientButton>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Staff Modal - REDESIGNED */}
      {editData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Edit Staff Member</h2>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <input
                name="username"
                value={editData.username}
                onChange={e => setEditData({ ...editData, username: e.target.value })}
                placeholder="Username"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              />
              <input
                name="first_name"
                value={editData.first_name}
                onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                placeholder="First Name"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              />
              <input
                name="last_name"
                value={editData.last_name}
                onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                placeholder="Last Name"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              />
              <input
                name="email"
                value={editData.email}
                onChange={e => setEditData({ ...editData, email: e.target.value })}
                placeholder="Email"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
              />
              <div className="relative">
                <input
                  name="password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="New password (optional)"
                  onChange={e => setEditData({ ...editData, password: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-600"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <OutlineButton onClick={() => setEditData(null)} className="flex-1">
                Cancel
              </OutlineButton>
              <GradientButton onClick={handleUpdate} className="flex-1">
                <Save className="w-4 h-4" />
                Save Changes
              </GradientButton>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminManagement;
