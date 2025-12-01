import React, { useState, useEffect } from "react";
import { User, Lock, Check, X, Edit3, Mail, Shield, AlertCircle } from "lucide-react";
import { PageContainer } from "../../components/DesignSystem";
import { api } from "../../services/api";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editedUser, setEditedUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [toastMessage, setToastMessage] = useState(null);

  const settingOptions = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ===== INIT =====
  useEffect(() => {
    document.title = "QuickAid | Settings";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setEditedUser({
            username: parsed.username || "",
            first_name: parsed.first_name || "",
            last_name: parsed.last_name || "",
            email: parsed.email || "",
            role: parsed.role || "",
          });
        } else {
          const res = await api.get("/users/me/");
          const userData = res.data;
          setUser(userData);
          setEditedUser({
            username: userData.username || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            role: userData.role || "",
          });
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        showToast("Failed to load user data. Please try logging in again.", "error");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [storedUser]);

  // ===== HANDLERS =====
  const handleSectionChange = sectionId => {
    setActiveSection(sectionId);
    setIsEditing(false);
  };

  const handleEdit = () => setIsEditing(true);

  const handleChange = e => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/users/update-profile/", editedUser);
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile. Please try again.", "error");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        showToast("New passwords do not match", "error");
        return;
      }

      if (passwordData.new_password.length < 8) {
        showToast("Password must be at least 8 characters long", "error");
        return;
      }

      // send only what backend expects
      await api.put("/users/change-password/", {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      showToast("Password changed successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to change password. Please check your current password.", "error");
    }
  };

  // ===== RENDER =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No User Data Found</h2>
          <p className="text-gray-600">Please login again to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your profile and security preferences
              </p>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="p-2">
                {settingOptions.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Profile Information
                        </h2>
                        <p className="text-sm text-gray-600">Update your personal details</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                          label="Username"
                          name="username"
                          value={editedUser.username}
                          onChange={handleChange}
                          icon={User}
                        />
                        <InputField
                          label="Email Address"
                          name="email"
                          value={editedUser.email}
                          readOnly
                          icon={Mail}
                        />
                        <InputField
                          label="First Name"
                          name="first_name"
                          value={editedUser.first_name}
                          onChange={handleChange}
                          icon={User}
                        />
                        <InputField
                          label="Last Name"
                          name="last_name"
                          value={editedUser.last_name}
                          onChange={handleChange}
                          icon={User}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors duration-200"
                        >
                          <Check className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <DisplayField label="Username" value={user.username} />
                        <DisplayField label="Email" value={user.email} />
                        <DisplayField label="First Name" value={user.first_name} />
                        <DisplayField label="Last Name" value={user.last_name} />
                        <DisplayField label="Role" value={user.role || "User"} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Password Section */}
            {activeSection === "password" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="max-w-lg space-y-5">
                    {["current_password", "new_password", "confirm_password"].map(
                      (key, idx) => (
                        <PasswordInput
                          key={key}
                          label={
                            idx === 0
                              ? "Current Password"
                              : idx === 1
                              ? "New Password"
                              : "Confirm New Password"
                          }
                          value={passwordData[key]}
                          onChange={e =>
                            setPasswordData({ ...passwordData, [key]: e.target.value })
                          }
                        />
                      )
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handlePasswordChange}
                        disabled={
                          !passwordData.current_password ||
                          !passwordData.new_password ||
                          !passwordData.confirm_password
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
                      >
                        <Lock className="w-4 h-4" />
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-5 py-3.5 rounded-lg shadow-lg border flex items-center gap-3 min-w-[320px] ${
              toastMessage.type === "success"
                ? "bg-white border-green-200 text-gray-900"
                : "bg-white border-red-200 text-gray-900"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                toastMessage.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {toastMessage.type === "success" ? (
                <Check
                  className={`w-5 h-5 ${
                    toastMessage.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="font-medium text-sm">{toastMessage.message}</span>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

// === Small Reusable Components ===
const InputField = ({ label, name, value, onChange, icon: Icon, readOnly = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border transition-colors duration-200 ${
          readOnly
            ? "bg-gray-50 cursor-not-allowed border-gray-200 text-gray-600"
            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900"
        } outline-none`}
      />
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative group">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
      <input
        type="password"
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-colors duration-200 text-gray-900"
      />
    </div>
  </div>
);

const DisplayField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
      {label}
    </label>
    <p className="text-gray-900 font-medium text-sm bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
      {value || "Not provided"}
    </p>
  </div>
);

export default SettingsPage;
