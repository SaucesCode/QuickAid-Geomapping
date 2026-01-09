import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, Lock, Eye, EyeOff, Save, Edit3 } from "lucide-react";
import SupportMessages from "./components/SupportMessages";
import ActivityLogs from "./components/ActivityLogs";
import StaffTable from "./components/StaffTable";
import { api } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  GradientButton,
  AnalyticsCard,
  AnalyticsStack,
} from "../../components/AnalyticsComponents";

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

  useEffect(() => {
    document.title = "QuickAid | Admin Dashboard";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Submit Logic
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
      <AnalyticsStack spacing="lg">
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

        <AnalyticsStack spacing="md">
          <SupportMessages token={token} />
          <StaffTable
            token={token}
            onEdit={staff => {
              setEditData(staff);
            }}
          />
          <ActivityLogs token={token} />
        </AnalyticsStack>
      </AnalyticsStack>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <AnalyticsCard className="w-full max-w-lg scale-100 transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-100">
              <div className="p-2 bg-[#003a76] rounded-lg shadow-sm">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Register New Staff</h2>
                <p className="text-xs text-gray-500">Add a new team member</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane"
                      className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g., Doe"
                      className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., jane.doe@quickaid.com"
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full p-2 pr-9 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-blue-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200"
              >
                Cancel
              </button>
              <GradientButton onClick={handleSubmit}>
                <Save className="w-3.5 h-3.5" />
                Register Staff
              </GradientButton>
            </div>
          </AnalyticsCard>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AnalyticsCard className="w-full max-w-lg scale-100 transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-100">
              <div className="p-2 bg-[#003a76] rounded-lg shadow-sm">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Edit Staff Member</h2>
                <p className="text-xs text-gray-500">Update staff information</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    value={editData.username}
                    onChange={e => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      name="first_name"
                      value={editData.first_name}
                      onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                      placeholder="e.g., Jane"
                      className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={editData.last_name}
                      onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                      placeholder="e.g., Doe"
                      className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    name="email"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    placeholder="e.g., jane.doe@quickaid.com"
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Password (Optional)
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showEditPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    onChange={e => setEditData({ ...editData, password: e.target.value })}
                    className="w-full p-2 pr-9 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm text-gray-800 transition-all hover:border-blue-400 outline-none"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-blue-100">
              <button
                onClick={() => setEditData(null)}
                className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200"
              >
                Cancel
              </button>
              <GradientButton onClick={handleUpdate}>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </GradientButton>
            </div>
          </AnalyticsCard>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminManagement;
