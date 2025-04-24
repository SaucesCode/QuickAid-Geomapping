import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Sidebar.css";
import { logoutUser } from "../../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("userData"));

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{collapsed ? "QA" : "QuickAid"}</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="icon">📊</span>
            {!collapsed && <span className="link-text">Dashboard</span>}
          </NavLink>
          {user && user.is_superuser && (
            <NavLink to="/geomapping" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="icon">🗺️</span>
              {!collapsed && <span className="link-text">Geomapping</span>}
            </NavLink>
          )}

          <NavLink
            to="/register-applicant"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">➕</span>
            {!collapsed && <span className="link-text">Input Applicant</span>}
          </NavLink>

          <NavLink to="/applicants" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="icon">👥</span>
            {!collapsed && <span className="link-text">Applicants</span>}
          </NavLink>
          {user && user.is_superuser && (
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="icon">📈</span>
              {!collapsed && <span className="link-text">Analytics</span>}
            </NavLink>
          )}

          {user && user.is_superuser && (
            <NavLink
              to="/admin-management"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="icon">🛠️</span>
              {!collapsed && <span className="link-text">Admin Management</span>}
            </NavLink>
          )}

          <div className="spacer"></div>

          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="icon">⚙️</span>
            {!collapsed && <span className="link-text">Settings</span>}
          </NavLink>

          <NavLink to="#" onClick={logoutUser}>
            <span className="icon">🚪</span>
            {!collapsed && <span className="link-text">Logout</span>}
          </NavLink>
        </nav>

        {!collapsed && (
          <div className="sidebar-footer">
            <p>QuickAid v1.0</p>
          </div>
        )}
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>QuickAid Dashboard</h1>
        </header>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
