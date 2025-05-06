import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { logoutUser } from "../../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("userData"));

  const toggleSidebar = () => setCollapsed(!collapsed);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/geomapping":
        return "Geomapping";
      case "/register-applicant":
        return "Input New Applicant";
      case "/applicants":
        return "Applicants";
      case "/analytics":
        return "Analytics";
      case "/admin-management":
        return "Admin Management";
      case "/settings":
        return "Settings";
      default:
        return "QuickAid";
    }
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <NavLink to="/">{collapsed ? "QA" : "QuickAid"}</NavLink>
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
          <div className="header-left">
            <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
              {collapsed ? "▶️" : "◀️"}
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-menu">
              <span>{user ? `${user.first_name} ${user.last_name}` : "User"}</span>
              <div className="user-avatar">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
