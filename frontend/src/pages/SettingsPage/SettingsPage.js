import React, { useState, useEffect } from "react";
import "./SettingsPage.css";

const SettingsPage = () => {
  const storedUser = localStorage.getItem("userData");
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("profile"); // Default active section
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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

  const [loginHistoryData, setLoginHistoryData] = useState([]);
  const [isLoadingLoginHistory, setIsLoadingLoginHistory] = useState(false);
  const [staffActivityLogData, setStaffActivityLogData] = useState([]);
  const [isLoadingStaffActivityLogs, setIsLoadingStaffActivityLogs] = useState(false);

  const settingOptions = [
    { id: "profile", label: "Profile Info", icon: "👤" },
    { id: "password", label: "Change Password", icon: "🔐" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "loginHistory", label: "Login History", icon: "🕒" },
  ];

  const adminSettingOptions = [
    { id: "staffActivityLogs", label: "Staff Activity Logs", icon: "👥" },
    { id: "adminControls", label: "Admin Controls", icon: "🛠️" },
  ];

  useEffect(() => {
    try {
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
        console.warn("No user data found in localStorage");
      }
    } catch (error) {
      console.error("Error parsing userData:", error);
    }
  }, [storedUser]);

  const handleSectionChange = sectionId => {
    setActiveSection(sectionId);
    setIsEditing(false);
  };

  const handleEdit = () => setIsEditing(true);
  const handleChange = e => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <div className="no-user-alert">⚠️ No user data found. Please login again.</div>;
  }

  const availableSections = user.is_superuser
    ? [...settingOptions, ...adminSettingOptions]
    : settingOptions;

  const handleSave = () => {
    // Simulate saving user data
    console.log("Saving user data:", editedUser);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // Simulate password change
    console.log("Changing password:", passwordData);
    setShowPasswordModal(false);
  };

  const handleClearArchives = () => {
    // Simulate clearing archives
    console.log("Clearing archives...");
    setShowArchiveConfirm(false);
  };

  return (
    <div className="settings-container">
      {/* <div className="settings-header">
        <h2>Settings</h2>
        <div className="header-user-info">
          <div className="user-avatar">
            {user.first_name && user.last_name
              ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
              : user.username.substring(0, 2)}
          </div>
          <div className="user-name">
            {user.first_name} {user.last_name}
          </div>
        </div>
      </div> */}

      <div className="settings-body">
        {/* Left Navigation Pane */}
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

        {/* Right Content Pane */}
        <div className="settings-content">
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
                <p>Update your password to maintain account security.</p>
                <p className="text-note">
                  We recommend using a strong, unique password that you don't use elsewhere.
                </p>

                <div className="form-group">
                  <div className="form-row">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={e =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
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
                        setPasswordData({ ...passwordData, confirm_password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button className="btn primary" onClick={handlePasswordChange}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              <div className="card">
                <div className="toggle-row">
                  <label className="toggle-container">
                    <input type="checkbox" disabled />
                    <span className="toggle-switch"></span>
                    <span className="toggle-label">Enable Dark Mode (coming soon)</span>
                  </label>
                </div>
                <div className="toggle-row">
                  <label className="toggle-container">
                    <input type="checkbox" disabled />
                    <span className="toggle-switch"></span>
                    <span className="toggle-label">Use High Contrast (coming soon)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "loginHistory" && (
            <div className="settings-section">
              <h3>Your Login History</h3>
              <div className="card">
                {isLoadingLoginHistory ? (
                  <div className="loading-spinner">Loading login history...</div>
                ) : loginHistoryData.length > 0 ? (
                  <div className="login-history-list">
                    {loginHistoryData.map(log => (
                      <div key={log.id} className="history-item">
                        <div className="history-date">{log.date}</div>
                        <div className="history-details">
                          <span className="history-ip">IP: {log.ip_address}</span>
                          <span className="history-device">{log.device}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No login history found.</p>
                )}
              </div>
            </div>
          )}

          {user.is_superuser && activeSection === "staffActivityLogs" && (
            <div className="settings-section">
              <h3>Staff Activity Logs</h3>
              <div className="card">
                {isLoadingStaffActivityLogs ? (
                  <div className="loading-spinner">Loading staff activity logs...</div>
                ) : staffActivityLogData.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Staff Member</th>
                          <th>Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffActivityLogData.map(log => (
                          <tr key={log.id}>
                            <td>{log.timestamp}</td>
                            <td>{log.staff_member}</td>
                            <td>{log.action}</td>
                            <td>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No staff activity logs found.</p>
                )}
              </div>
            </div>
          )}

          {user.is_superuser && activeSection === "adminControls" && (
            <div className="settings-section">
              <h3>Administrator Controls</h3>
              <div className="card">
                <div className="admin-action-item">
                  <div className="admin-action-info">
                    <h4>Clear Archived Applicants</h4>
                    <p>This will permanently delete all archived applicant data.</p>
                  </div>
                  <button className="btn danger" onClick={() => setShowArchiveConfirm(true)}>
                    Clear Archives
                  </button>
                </div>
              </div>
            </div>
          )}
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
