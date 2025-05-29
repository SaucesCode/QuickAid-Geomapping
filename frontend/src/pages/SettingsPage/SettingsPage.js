import React, { useState, useEffect } from "react";
import "./SettingsPage.css";
import { API_URL } from "../../services/api";
import { format } from "date-fns";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
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

  const adminSettingOptions = [{ id: "adminControls", label: "Admin Controls", icon: "🛠️" }];

  useEffect(() => {
    document.title = "Quickaid | Settings";
    return () => {
      document.title = "Quickaid | Home";
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
              headers: {
                Authorization: `Bearer ${token}`,
              },
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

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
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
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update user");
        } else {
          throw new Error("Failed to update user. Please try again.");
        }
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(error.message);
      if (
        error.message.includes("Session expired") ||
        error.message.includes("Authentication token not found")
      ) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
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
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
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
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to change password");
        } else {
          throw new Error("Failed to change password. Please try again.");
        }
      }

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowArchiveConfirm(false);
      setSuccess("Password changed successfully!");
    } catch (error) {
      setError(error.message);
      if (
        error.message.includes("Session expired") ||
        error.message.includes("Authentication token not found")
      ) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  const handleClearArchives = async () => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(`${API_URL}/applicants/clear-archives/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to clear archives");
        } else {
          throw new Error("Failed to clear archives. Please try again.");
        }
      }

      setShowArchiveConfirm(false);
      setSuccess("Archived applicants cleared successfully!");
    } catch (error) {
      setError(error.message);
      if (
        error.message.includes("Session expired") ||
        error.message.includes("Authentication token not found")
      ) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading settings...</div>;
  }

  if (!user) {
    return <div className="no-user-alert">⚠️ No user data found. Please login again.</div>;
  }

  const availableSections = user.is_superuser
    ? [...settingOptions, ...adminSettingOptions]
    : settingOptions;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-body">
          <div className="settings-sidebar">
            <ul className="settings-menu">
              {availableSections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionChange(section.id)}
                    className={`menu-item ${activeSection === section.id ? "active" : ""}`}
                  >
                    <span className="menu-icon">{section.icon}</span>
                    <span className="menu-label">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="settings-content">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {activeSection === "profile" && (
              <div className="settings-section">
                <h3>Profile Information</h3>
                <div className="card">
                  {isEditing ? (
                    <div className="form-group">
                      <div className="form-row">
                        <label>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={editedUser.username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-row">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={editedUser.first_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-row">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={editedUser.last_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-row">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email}
                          readOnly
                          className="readonly"
                        />
                      </div>
                      <div className="button-group">
                        <button className="btn primary" onClick={handleSave}>
                          Save Profile
                        </button>
                        <button className="btn secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-info">
                      <div className="profile-row">
                        <span className="profile-label">Username</span>
                        <span className="profile-value">{user.username}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">First Name</span>
                        <span className="profile-value">{user.first_name}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Last Name</span>
                        <span className="profile-value">{user.last_name}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{user.email}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Role</span>
                        <span className="profile-value">{user.role}</span>
                      </div>
                      <div className="button-group">
                        <button className="btn primary" onClick={handleEdit}>
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "password" && (
              <div className="settings-section">
                <h3>Change Password</h3>
                <div className="card">
                  <div className="form-group">
                    <div className="form-row">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={e =>
                          setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={e =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="button-group">
                      <button className="btn primary" onClick={handlePasswordChange}>
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="settings-section">
                <h3>Appearance Settings</h3>
                <div className="card">
                  <div className="admin-action-item">
                    <div className="admin-action-info">
                      <h4>Theme Settings</h4>
                      <p>Customize the look and feel of your dashboard.</p>
                    </div>
                    <div className="appearance-options">
                      <div className="toggle-row">
                        <label className="toggle-container">
                          <input type="checkbox" disabled />
                          <span className="toggle-switch"></span>
                          <span className="toggle-label">Dark Mode</span>
                        </label>
                        <span className="coming-soon">Coming Soon</span>
                      </div>
                      <div className="toggle-row">
                        <label className="toggle-container">
                          <input type="checkbox" disabled />
                          <span className="toggle-switch"></span>
                          <span className="toggle-label">High Contrast Mode</span>
                        </label>
                        <span className="coming-soon">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user.is_superuser && activeSection === "adminControls" && (
              <div className="settings-section">
                <h3>Administrator Controls</h3>
                <div className="card">
                  <div className="admin-action-item">
                    <div className="admin-action-info">
                      <h4>Staff Activity Logs</h4>
                      <p>View all staff activities in the system.</p>
                    </div>
                    <div className="activity-logs">
                      <table>
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Staff Member</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan="5" className="no-data">
                              Activity logs not available in this version
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showArchiveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Archive Clear</h3>
            <div className="modal-body">
              <p>
                Are you sure you want to delete all archived applicants? This action cannot be
                undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn danger" onClick={handleClearArchives}>
                Yes, Delete All
              </button>
              <button className="btn secondary" onClick={() => setShowArchiveConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
