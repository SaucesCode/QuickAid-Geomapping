import React, { useEffect, useState } from "react";
import "./AdminManagement.css"; // Add styles if needed
import { API_URL } from "../../services/api";

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

  useEffect(() => {
    document.title = "Quickaid | Admin Management";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Fetch all staff on load
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/staff-list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Staff list:", data);
      setStaffList(data);
    } catch (error) {
      setMessage("Error loading staff list");
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

  return (
    <div className="admin-management">
      <h2>Admin Management</h2>
      <button onClick={() => setShowModal(true)}>➕ Add Staff</button>

      {message && <p className="message">{message}</p>}

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
          {staffList.map(staff => (
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
          ))}
        </tbody>
      </table>
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

export default AdminManagement;
