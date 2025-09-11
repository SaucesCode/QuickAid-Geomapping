import React, { useState, useEffect } from "react";
import { User, Lock, Palette, Check, X, Edit3, Mail, UserCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_URL } from "../../services/api";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const settingOptions = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

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
        toast.error("Failed to load user data. Please try logging in again.");
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
        toast.error("Authentication token not found. Please login again.");
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
        toast.error("Failed to update profile. Please try again.");
        return;
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("An error occurred while updating your profile.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error("New passwords do not match");
        return;
      }

      if (passwordData.new_password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
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
        toast.error("Failed to change password. Please check your current password.");
        return;
      }

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error("An error occurred while changing your password.");
    }
  };

  // ===== RENDER =====
  if (isLoading) {
    return (
      <div className="p-4 bg-quickaid-bg min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg text-quickaid-accent"></div>
            <span className="ml-3 text-quickaid-text-secondary">Loading settings...</span>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-quickaid-bg min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-600 mb-2">No User Data Found</h2>
            <p className="text-xs text-quickaid-text-secondary">
              Please login again to access settings.
            </p>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="p-4 bg-quickaid-bg min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-quickaid-text-primary mb-2">Settings</h1>
          <p className="text-sm text-quickaid-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          {/* Sidebar */}
          <div className="lg:w-64 w-full">
            <div className="bg-quickaid-surface shadow-md rounded-xl p-4 sticky top-6">
              <nav className="space-y-2">
                {settingOptions.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-quickaid-accent text-white shadow-sm"
                          : "text-quickaid-text-primary hover:bg-gray-50 hover:text-quickaid-accent"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="font-medium">{section.label}</span>
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
              <div className="bg-quickaid-surface shadow-md rounded-xl p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-quickaid-accent bg-opacity-10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-quickaid-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-quickaid-text-primary">
                        Profile Information
                      </h2>
                      <p className="text-sm text-quickaid-text-secondary">
                        Update your personal details
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-quickaid-accent hover:bg-teal-600 text-white rounded-md transition-colors text-sm"
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
                        <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="username"
                            value={editedUser.username}
                            onChange={handleChange}
                            className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
                            placeholder="Enter username"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={editedUser.email}
                            readOnly
                            className="input input-bordered w-full pl-10 bg-gray-50 cursor-not-allowed text-sm"
                            placeholder="Email cannot be changed"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="first_name"
                            value={editedUser.first_name}
                            onChange={handleChange}
                            className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
                            placeholder="Enter first name"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="last_name"
                            value={editedUser.last_name}
                            onChange={handleChange}
                            className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-quickaid-text-primary hover:bg-gray-100 rounded-md transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-quickaid-accent hover:bg-teal-600 text-white rounded-md transition-colors text-sm"
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
                        <div>
                          <label className="block text-xs font-medium text-quickaid-text-secondary mb-1">
                            Username
                          </label>
                          <p className="text-quickaid-text-primary font-medium text-sm">
                            {user.username || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-quickaid-text-secondary mb-1">
                            First Name
                          </label>
                          <p className="text-quickaid-text-primary font-medium text-sm">
                            {user.first_name || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-quickaid-text-secondary mb-1">
                            Role
                          </label>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-quickaid-accent bg-opacity-10 text-quickaid-accent">
                            {user.role || "User"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-quickaid-text-secondary mb-1">
                            Email Address
                          </label>
                          <p className="text-quickaid-text-primary font-medium text-sm">
                            {user.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-quickaid-text-secondary mb-1">
                            Last Name
                          </label>
                          <p className="text-quickaid-text-primary font-medium text-sm">
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
              <div className="bg-quickaid-surface shadow-md rounded-xl p-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-quickaid-text-primary">
                      Change Password
                    </h2>
                    <p className="text-sm text-quickaid-text-secondary">
                      Update your account password
                    </p>
                  </div>
                </div>

                <div className="max-w-md space-y-3">
                  <div className="relative">
                    <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={e =>
                          setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
                        placeholder="Enter new password (min. 8 characters)"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-quickaid-text-secondary mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent text-sm"
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors text-sm"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div className="bg-quickaid-surface shadow-md rounded-xl p-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-quickaid-text-primary">
                      Appearance Settings
                    </h2>
                    <p className="text-sm text-quickaid-text-secondary">
                      Customize your interface preferences
                    </p>
                  </div>
                </div>

                <div className="max-w-md space-y-3">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-quickaid-text-secondary mb-3">
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
                        <label key={option.value} className="flex items-start cursor-pointer">
                          <input
                            type="radio"
                            name="fontSize"
                            value={option.value}
                            checked={fontSize === option.value}
                            onChange={e => setFontSize(e.target.value)}
                            className="radio radio-accent mt-1"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-quickaid-text-primary">
                              {option.label}
                            </div>
                            <div className="text-sm text-quickaid-text-secondary">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-quickaid-text-secondary mb-3">
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
                        <label key={option.value} className="flex items-start cursor-pointer">
                          <input
                            type="radio"
                            name="language"
                            value={option.value}
                            checked={language === option.value}
                            onChange={e => setLanguage(e.target.value)}
                            className="radio radio-accent mt-1"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-quickaid-text-primary">
                              {option.label}
                            </div>
                            <div className="text-sm text-quickaid-text-secondary">
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
      <Toaster />
    </div>
  );
};

export default SettingsPage;
