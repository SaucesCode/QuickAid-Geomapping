import React, { useEffect, useState } from "react";
import "./AdminManagement.css"; // Add styles if needed
import { API_URL } from "../../services/api";
import { format } from "date-fns";

const AdminManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const token = localStorage.getItem("accessToken");
  // Add new states for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Quickaid | Admin Management";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Fetch all staff on load
  useEffect(() => {
    fetchStaff();
    fetchActivityLogs();
  }, [currentPage]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/staff-list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Staff list:", data);
      setStaffList(data || []);
    } catch (error) {
      setMessage("Error loading staff list");
      setStaffList([]);
    }
  };

  const fetchActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      console.log("Fetching activity logs...");
      const response = await fetch(`${API_URL}/users/staff-activity/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(
          errorData.details || errorData.error || "Failed to fetch activity logs"
        );
      }

      const data = await response.json();
      console.log("Activity logs data:", data);

      // Check if data has the expected structure
      if (!data || !Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        throw new Error("Invalid data format received");
      }

      setActivityLogs(data);
      setTotalPages(Math.ceil(data.length / logsPerPage));
    } catch (error) {
      console.error("Error in fetchActivityLogs:", error);
      setMessage(error.message || "Failed to load activity logs");
      setActivityLogs([]);
      setTotalPages(1);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/register_staff/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Staff registered!");
        setFormData({ username: "", password: "", first_name: "", last_name: "", email: "" });
        setShowModal(false);
        fetchStaff();
      } else {
        setMessage(`❌ ${data.error || "Registration failed."}`);
      }
    } catch (err) {
      setMessage("❌ Failed to register staff.");
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;

    try {
      const res = await fetch(`${API_URL}/delete-staff/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchStaff();
        setMessage("✅ Staff deleted");
      }
    } catch (err) {
      setMessage("❌ Failed to delete staff");
    }
  };
  const getStatusBadge = lastActive => {
    if (!lastActive) return "🔴 Offline";

    const last = new Date(lastActive);
    const now = new Date();
    const diff = (now - last) / 1000;

    if (diff < 60) return "🟢 Online";
    if (diff < 300) return "🟡 Idle";
    return "🔴 Offline";
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activityLogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="admin-management">
      <h2>Admin Management</h2>
      <button onClick={() => setShowModal(true)}>➕ Add Staff</button>

      {message && <p className="message">{message}</p>}

      <div className="admin-sections">
        <div className="staff-section">
          <h3>Staff List</h3>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList && staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr key={staff.id}>
                    <td>{getStatusBadge(staff.last_active)}</td>
                    <td>{staff.username}</td>
                    <td>
                      {staff.first_name} {staff.last_name}
                    </td>
                    <td>{staff.email}</td>
                    <td>
                      <button onClick={() => handleDelete(staff.id)}>🗑️ Delete</button>
                    </td>
                    <td>
                      <button onClick={() => setEditData(staff)}>✏️ Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="activity-logs-section">
          <h3>Staff Activity Logs</h3>
          {isLoadingLogs ? (
            <div className="loading-spinner">Loading logs...</div>
          ) : message ? (
            <div className="error-message">{message}</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Staff Member</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems && currentItems.length > 0 ? (
                    currentItems.map(log => (
                      <tr key={log.id}>
                        <td>{format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}</td>
                        <td>{log.staff_member || "Unknown"}</td>
                        <td>
                          <span className={`action-badge ${(log.action || "").toLowerCase()}`}>
                            {log.action || "Unknown"}
                          </span>
                        </td>
                        <td>{log.details || "No details"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No activity logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {activityLogs && activityLogs.length > 0 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    <span>
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, activityLogs.length)} of {activityLogs.length}{" "}
                      entries
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={e => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="items-per-page"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={30}>30 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <div className="pagination-buttons">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: Math.ceil(activityLogs.length / itemsPerPage) },
                      (_, i) => i + 1
                    )
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === Math.ceil(activityLogs.length / itemsPerPage) ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="pagination-ellipsis">...</span>
                              <button
                                className={`pagination-btn ${
                                  currentPage === page ? "active" : ""
                                }`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <button
                            key={page}
                            className={`pagination-btn ${
                              currentPage === page ? "active" : ""
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}
                    <button
                      className="pagination-btn"
                      onClick={() =>
                        setCurrentPage(prev =>
                          Math.min(prev + 1, Math.ceil(activityLogs.length / itemsPerPage))
                        )
                      }
                      disabled={currentPage === Math.ceil(activityLogs.length / itemsPerPage)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editData && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Staff</h3>
            <input
              name="username"
              value={editData.username}
              onChange={e => setEditData({ ...editData, username: e.target.value })}
            />
            <input
              name="first_name"
              value={editData.first_name}
              onChange={e => setEditData({ ...editData, first_name: e.target.value })}
            />
            <input
              name="last_name"
              value={editData.last_name}
              onChange={e => setEditData({ ...editData, last_name: e.target.value })}
            />
            <input
              name="email"
              value={editData.email}
              onChange={e => setEditData({ ...editData, email: e.target.value })}
            />
            <input
              name="password"
              type="password"
              placeholder="New Password (optional)"
              onChange={e => setEditData({ ...editData, password: e.target.value })}
            />

            <div className="modal-buttons">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/update-staff/${editData.id}/`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(editData),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setMessage("✅ Staff updated!");
                      fetchStaff();
                      setEditData(null);
                    } else {
                      setMessage(`❌ ${data.error || "Update failed"}`);
                    }
                  } catch {
                    setMessage("❌ Error updating staff");
                  }
                }}
              >
                Save
              </button>
              <button onClick={() => setEditData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Staff */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Register Staff</h3>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
            />
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
            />
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <div className="modal-buttons">
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
//

export default AdminManagement;
