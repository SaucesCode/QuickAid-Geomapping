import React, { useState, useEffect } from "react";
import { API_URL } from "../../services/api";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    { id: "profile", label: "Profile Info", icon: "👤" },
    { id: "password", label: "Change Password", icon: "🔐" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
  ];

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
        setError("Failed to load user data. Please try logging in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [storedUser]);

  const handleSectionChange = sectionId => {
    setActiveSection(sectionId);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = () => setIsEditing(true);

  const handleChange = e => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found. Please login again.");

      const response = await fetch(`${API_URL}/users/update-profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update user. Please try again.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (passwordData.new_password !== passwordData.confirm_password) {
        throw new Error("New passwords do not match");
      }

      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found. Please login again.");

      const response = await fetch(`${API_URL}/users/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        throw new Error("Failed to change password. Please try again.");
      }

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setSuccess("Password changed successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading settings...</div>;
  }

  if (!user) {
    return (
      <div className="text-center text-red-500">
        ⚠️ No user data found. Please login again.
      </div>
    );
  }

  return (
    <div className="p-6 bg-quickaid-bg min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-quickaid-text-primary">Settings</h1>
          <p className="text-sm text-quickaid-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-quickaid-surface shadow-md rounded-xl p-4">
            <ul className="space-y-2">
              {settingOptions.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition ${
                      activeSection === section.id
                        ? "bg-quickaid-accent text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="flex-1">
            {error && <div className="mb-4 text-sm text-error">{error}</div>}
            {success && <div className="mb-4 text-sm text-success">{success}</div>}

            {activeSection === "profile" && (
              <div className="card bg-base-100 shadow-md rounded-xl p-6">
                <h3 className="text-xl font-medium text-quickaid-text-primary mb-4">
                  Profile Information
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editedUser.username}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={editedUser.first_name}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={editedUser.last_name}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email}
                        readOnly
                        className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
                        onClick={handleSave}
                      >
                        Save Profile
                      </button>
                      <button
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Username</span>
                      <span>{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">First Name</span>
                      <span>{user.first_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Last Name</span>
                      <span>{user.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Email</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Role</span>
                      <span>{user.role}</span>
                    </div>
                    <button
                      className="mt-4 bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === "password" && (
              <div className="card bg-base-100 shadow-md rounded-xl p-6">
                <h3 className="text-xl font-medium text-quickaid-text-primary mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={e =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={e =>
                        setPasswordData({ ...passwordData, new_password: e.target.value })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={e =>
                        setPasswordData({ ...passwordData, confirm_password: e.target.value })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                  <button
                    className="bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
                    onClick={handlePasswordChange}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="card bg-base-100 shadow-md rounded-xl p-6">
                <h3 className="text-xl font-medium text-quickaid-text-primary mb-4">
                  Appearance Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input type="checkbox" disabled className="checkbox" />
                      Dark Mode
                    </label>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input type="checkbox" disabled className="checkbox" />
                      High Contrast Mode
                    </label>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
