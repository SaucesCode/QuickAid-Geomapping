import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  UserPlus,
  Users,
  CheckCircle,
  BarChart3,
  Archive,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/geomapping", icon: Map, label: "Geomapping", superuser: true },
  { to: "/register-applicant", icon: UserPlus, label: "New Applicant" },
  { to: "/applicants", icon: Users, label: "Applicants" },
  { to: "/approved", icon: CheckCircle, label: "Approved" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", superuser: true },
  { to: "/archived-applicants", icon: Archive, label: "Archived" },
  { to: "/admin-management", icon: Shield, label: "Admin", superuser: true },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));

  const toggleSidebar = () => setCollapsed(!collapsed);

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.to === location.pathname);
    return currentItem ? currentItem.label : "QuickAid";
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("userData");
      localStorage.removeItem("accessToken");
      toast.success("Logged out successfully ✅");
      navigate("/login");
    } catch (err) {
      toast.error("Error logging out ❌");
    }
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""} flex min-h-screen z-100`}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen max-h-screen flex flex-col bg-gray-800 text-gray-300 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } z-50`}
      >
        {/* Header */}
        <div className="sidebar-header flex items-center justify-center p-4 flex-shrink-0 z-1001">
          <NavLink to="/">
            {collapsed ? (
              <img src="/QUICKAID LOGO heart only 1.png" alt="QuickAid Logo" className="w-5" />
            ) : (
              <img
                src="/QUICKAID LOGO heart only 1.png"
                alt="QuickAid Logo"
                className="w-24"
              />
            )}
          </NavLink>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto z-1001">
          {navItems.map(
            item =>
              (!item.superuser || (user && user.is_superuser)) && (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                      isActive ? "bg-gray-900 text-white border-l-4 border-teal-500" : ""
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <item.icon className="h-6 w-6" />
                  {!collapsed && <span className="ml-4">{item.label}</span>}
                </NavLink>
              )
          )}
        </nav>

        {/* Footer (pinned bottom) */}
        <div className="sidebar-footer flex-shrink-0 border-t border-gray-700">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                isActive ? "bg-gray-900 text-white" : ""
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Settings className="h-6 w-6" />
            {!collapsed && <span className="ml-4">Settings</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 hover:bg-gray-700 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-6 w-6" />
            {!collapsed && <span className="ml-4">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`main-content flex-1 bg-gray-100 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="content-header sticky top-0 z-50 flex items-center justify-between bg-white p-4 shadow-md border-b border-gray-200">
          <div className="header-left flex items-center">
            <button className="toggle-sidebar-btn mr-4 text-gray-600" onClick={toggleSidebar}>
              {collapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>
          <div className="header-actions flex items-center">
            <button className="notification-btn mr-6 text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
            <div className="user-menu flex items-center">
              <span className="mr-4 font-medium text-gray-800">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </span>
              <div className="user-avatar h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-container p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
