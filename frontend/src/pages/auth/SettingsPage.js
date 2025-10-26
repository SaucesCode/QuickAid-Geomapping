import React, { useState, useEffect } from "react";
import { User, Lock, Check, X, Edit3, Mail, Sparkles } from "lucide-react";
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
      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <X className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-red-600 mb-2">No User Data Found</h2>
          <p className="text-xs text-slate-600">Please login again to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-slate-600 mt-1">Manage your account settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Sidebar */}
          <div className="lg:w-64 w-full">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-4 sticky top-6 border border-blue-100">
              <nav className="space-y-2">
                {settingOptions.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-102"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
                      <p className="text-sm text-slate-600">Update your personal details</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-sm font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DisplayField label="Username" value={user.username} />
                      <DisplayField label="Email" value={user.email} />
                      <DisplayField label="First Name" value={user.first_name} />
                      <DisplayField label="Last Name" value={user.last_name} />
                      <DisplayField label="Role" value={user.role || "User"} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Section */}
            {activeSection === "password" && (
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                    <p className="text-sm text-slate-600">Update your account password</p>
                  </div>
                </div>

                <div className="max-w-md space-y-3">
                  {["current_password", "new_password", "confirm_password"].map((key, idx) => (
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
                  ))}
                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border-2 flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white"
            }`}
          >
            {toastMessage.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-semibold text-sm">{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// === Small Reusable Components ===
const InputField = ({ label, name, value, onChange, icon: Icon, readOnly = false }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 ${
          readOnly
            ? "bg-slate-100 cursor-not-allowed border-slate-200"
            : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        } outline-none transition-all`}
      />
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <div className="relative group">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
      <input
        type="password"
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
      />
    </div>
  </div>
);

const DisplayField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
    <p className="text-slate-800 font-semibold text-sm bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-100">
      {value || "Not provided"}
    </p>
  </div>
);

export default SettingsPage;
