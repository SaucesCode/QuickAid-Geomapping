import React, { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { logoutUser } from "../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openApplicants, setOpenApplicants] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Auto-open Applicants menu if current route is inside it
  useEffect(() => {
    if (
      location.pathname.startsWith("/register-applicant") ||
      location.pathname.startsWith("/applicants") ||
      location.pathname.startsWith("/approved") ||
      location.pathname.startsWith("/archived-applicants")
    ) {
      setOpenApplicants(true);
    }
  }, [location.pathname]);

  const getPageTitle = () => {
    const map = {
      "/dashboard": "Dashboard",
      "/geomapping": "Geomapping",
      "/register-applicant": "New Applicant",
      "/applicants": "Applicants",
      "/approved": "Approved",
      "/archived-applicants": "Archived",
      "/analytics": "Analytics",
      "/admin-management": "Admin",
      "/settings": "Settings",
    };
    return map[location.pathname] || "QuickAid";
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
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
        className={`fixed top-0 left-0 h-screen flex flex-col bg-gray-800 text-gray-300 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } z-50`}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4">
          <NavLink to="/">
            {collapsed ? (
              <img src="/QUICKAID LOGO heart only 1.png" alt="QuickAid Logo" className="w-6" />
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
        <nav className="flex-1 overflow-y-auto space-y-2">
          {/* --- Section: Dashboard --- */}
          <div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 hover:bg-gray-700 ${
                  isActive ? "bg-gray-900 text-white border-l-4 border-teal-500" : ""
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <LayoutDashboard className="h-6 w-6" />
              {!collapsed && <span className="ml-4">Dashboard</span>}
            </NavLink>

            {user?.is_superuser && (
              <NavLink
                to="/geomapping"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-700 ${
                    isActive ? "bg-gray-900 text-white border-l-4 border-teal-500" : ""
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Map className="h-6 w-6" />
                {!collapsed && <span className="ml-4">Geomapping</span>}
              </NavLink>
            )}

            {user?.is_superuser && (
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-700 ${
                    isActive ? "bg-gray-900 text-white border-l-4 border-teal-500" : ""
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <BarChart3 className="h-6 w-6" />
                {!collapsed && <span className="ml-4">Analytics</span>}
              </NavLink>
            )}
          </div>

          {/* Divider */}
          {!collapsed && <div className="border-t border-gray-700 my-2" />}

          {/* --- Section: Applicants --- */}
          <div>
            <button
              onClick={() => setOpenApplicants(!openApplicants)}
              className={`flex items-center w-full px-4 py-3 hover:bg-gray-700 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Users className="h-6 w-6" />
              {!collapsed && (
                <>
                  <span className="ml-4 flex-1 text-left">Applicants</span>
                  {openApplicants ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </>
              )}
            </button>

            {openApplicants && !collapsed && (
              <div className="ml-10 space-y-1">
                <NavLink
                  to="/register-applicant"
                  className={({ isActive }) =>
                    `block px-2 py-2 rounded hover:bg-gray-700 ${
                      isActive ? "bg-gray-900 text-white" : ""
                    }`
                  }
                >
                  <UserPlus className="inline h-4 w-4 mr-2" />
                  New Applicant
                </NavLink>
                <NavLink
                  to="/applicants"
                  className={({ isActive }) =>
                    `block px-2 py-2 rounded hover:bg-gray-700 ${
                      isActive ? "bg-gray-900 text-white" : ""
                    }`
                  }
                >
                  <Users className="inline h-4 w-4 mr-2" />
                  All Applicants
                </NavLink>
                <NavLink
                  to="/approved"
                  className={({ isActive }) =>
                    `block px-2 py-2 rounded hover:bg-gray-700 ${
                      isActive ? "bg-gray-900 text-white" : ""
                    }`
                  }
                >
                  <CheckCircle className="inline h-4 w-4 mr-2" />
                  Approved
                </NavLink>
                <NavLink
                  to="/archived-applicants"
                  className={({ isActive }) =>
                    `block px-2 py-2 rounded hover:bg-gray-700 ${
                      isActive ? "bg-gray-900 text-white" : ""
                    }`
                  }
                >
                  <Archive className="inline h-4 w-4 mr-2" />
                  Archived
                </NavLink>
              </div>
            )}
          </div>

          {/* Divider */}
          {!collapsed && <div className="border-t border-gray-700 my-2" />}

          {/* --- Section: Admin --- */}
          {user?.is_superuser && (
            <NavLink
              to="/admin-management"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 hover:bg-gray-700 ${
                  isActive ? "bg-gray-900 text-white border-l-4 border-teal-500" : ""
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Shield className="h-6 w-6" />
              {!collapsed && <span className="ml-4">Admin</span>}
            </NavLink>
          )}
        </nav>

        {/* Footer (Settings + Logout) */}
        <div className="border-t border-gray-700">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 hover:bg-gray-700 ${
                isActive ? "bg-gray-900 text-white" : ""
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Settings className="h-6 w-6" />
            {!collapsed && <span className="ml-4">Settings</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 hover:bg-gray-700 ${
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
        className={`flex-1 bg-gray-100 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white p-4 shadow-md border-b border-gray-200">
          <div className="flex items-center">
            <button className="mr-4 text-gray-600" onClick={toggleSidebar}>
              {collapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center">
            <button className="mr-6 text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <span className="mr-4 font-medium text-gray-800">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </span>
              <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
