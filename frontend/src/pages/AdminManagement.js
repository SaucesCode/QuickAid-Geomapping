import React, { useState } from "react";

const AdminManagement = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegisterStaff = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register_staff/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Staff registered successfully!");
        setUsername("");
        setPassword("");
      } else {
        setMessage(`❌ ${data.error || "Registration failed."}`);
      }
    } catch (error) {
      setMessage("❌ Something went wrong.");
    }
  };

  return (
    <div className="admin-management">
      <h2>Admin Management</h2>
      <p>Register New Staff (Superusers Only)</p>

      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleRegisterStaff}>Register Staff</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default AdminManagement;
