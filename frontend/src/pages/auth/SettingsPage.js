import React, { useState, useEffect } from "react";
import { User, Lock, Palette, Check, X, Edit3, Mail, UserCheck, Sparkles } from "lucide-react";

// Note: In your actual project, import API_URL from your services file:
// import { API_URL } from "../../services/api";
const API_URL = "https://your-api-url.com"; // Placeholder for artifact demo

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Appearance states
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "base");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

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
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ===== EFFECTS =====
  useEffect(() => {
    document.title = "QuickAid | Settings";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Font size persistence
  useEffect(() => {
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    document.documentElement.classList.add(`text-${fontSize}`);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Language persistence
  useEffect(() => {
    localStorage.setItem("language", language);
    // Hook into i18n here if needed: i18n.changeLanguage(language)
  }, [language]);

  // ===== USER INIT =====
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
          const token = localStorage.getItem("accessToken");
          if (token) {
            const response = await fetch(`${API_URL}/users/me/`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              setEditedUser({
                username: userData.username || "",
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                email: userData.email || "",
                role: userData.role || "",
              });
              localStorage.setItem("userData", JSON.stringify(userData));
            } else {
              window.location.href = "/login";
            }
          } else {
            window.location.href = "/login";
          }
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showToast("Authentication token not found. Please login again.", "error");
        return;
      }

      const response = await fetch(`${API_URL}/users/update-profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        showToast("Failed to update profile. Please try again.", "error");
        return;
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("An error occurred while updating your profile.", "error");
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

      const token = localStorage.getItem("accessToken");
      if (!token) {
        showToast("Authentication token not found. Please login again.", "error");
        return;
      }

      const response = await fetch(`${API_URL}/users/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        showToast("Failed to change password. Please check your current password.", "error");
        return;
      }

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      showToast("Password changed successfully!");
    } catch (error) {
      showToast("An error occurred while changing your password.", "error");
    }
  };

  // ===== RENDER =====
  if (isLoading) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600 font-medium">Loading settings...</span>
            </div>
          </div>
        </div>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`px-5 py-3 rounded-xl shadow-xl backdrop-blur-sm border-2 flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white"
            }`}>
              {toastMessage.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span className="font-semibold text-sm">{toastMessage.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <X className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-red-600 mb-2">No User Data Found</h2>
            <p className="text-xs text-slate-600">
              Please login again to access settings.
            </p>
          </div>
        </div>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`px-5 py-3 rounded-xl shadow-xl backdrop-blur-sm border-2 flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white"
            }`}>
              {toastMessage.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span className="font-semibold text-sm">{toastMessage.message}</span>
            </div>
          </div>
        )}
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Settings</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

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
                      <h2 className="text-lg font-bold text-slate-800">
                        Profile Information
                      </h2>
                      <p className="text-sm text-slate-600">
                        Update your personal details
                      </p>
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
                      <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Username
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="username"
                            value={editedUser.username}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                            placeholder="Enter username"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={editedUser.email}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl cursor-not-allowed text-sm"
                            placeholder="Email cannot be changed"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          First Name
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="first_name"
                            value={editedUser.first_name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                            placeholder="Enter first name"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Last Name
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="last_name"
                            value={editedUser.last_name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-3">
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Username
                          </label>
                          <p className="text-slate-800 font-semibold text-sm bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                            {user.username || "Not provided"}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            First Name
                          </label>
                          <p className="text-slate-800 font-semibold text-sm bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                            {user.first_name || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Role
                          </label>
                          <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                            {user.role || "User"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Email Address
                          </label>
                          <p className="text-slate-800 font-semibold text-sm bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-100 group-hover:border-blue-200 transition-colors break-all">
                            {user.email || "Not provided"}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Last Name
                          </label>
                          <p className="text-slate-800 font-semibold text-sm bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                            {user.last_name || "Not provided"}
                          </p>
                        </div>
                      </div>
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
                    <h2 className="text-lg font-bold text-slate-800">
                      Change Password
                    </h2>
                    <p className="text-sm text-slate-600">
                      Update your account password
                    </p>
                  </div>
                </div>

                <div className="max-w-md space-y-3">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={e =>
                          setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                        placeholder="Enter new password (min. 8 characters)"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Appearance Settings
                    </h2>
                    <p className="text-sm text-slate-600">
                      Customize your interface preferences
                    </p>
                  </div>
                </div>

                <div className="max-w-md space-y-3">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-3">
                      Font Size
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "sm",
                          label: "Small",
                          description: "Compact text for more content",
                        },
                        {
                          value: "base",
                          label: "Default",
                          description: "Standard readable size",
                        },
                        {
                          value: "lg",
                          label: "Large",
                          description: "Larger text for better readability",
                        },
                      ].map(option => (
                        <label key={option.value} className="flex items-start cursor-pointer bg-slate-50 hover:bg-blue-50 p-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all group">
                          <input
                            type="radio"
                            name="fontSize"
                            value={option.value}
                            checked={fontSize === option.value}
                            onChange={e => setFontSize(e.target.value)}
                            className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">
                              {option.label}
                            </div>
                            <div className="text-xs text-slate-600">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-3">
                      Language
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "en",
                          label: "English",
                          description: "Display interface in English",
                        },
                        {
                          value: "fil",
                          label: "Filipino",
                          description: "Display interface in Filipino",
                        },
                      ].map(option => (
                        <label key={option.value} className="flex items-start cursor-pointer bg-slate-50 hover:bg-blue-50 p-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all group">
                          <input
                            type="radio"
                            name="language"
                            value={option.value}
                            checked={language === option.value}
                            onChange={e => setLanguage(e.target.value)}
                            className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">
                              {option.label}
                            </div>
                            <div className="text-xs text-slate-600">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border-2 flex items-center gap-2 ${
            toastMessage.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 border-red-400 text-white"
          }`}>
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

export default SettingsPage;