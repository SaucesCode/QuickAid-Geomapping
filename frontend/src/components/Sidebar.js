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
  Bell,
  ChevronRight,
  Menu,
  X,
  Plus,
  TrendingUp,
  PieChart,
  Activity,
  MapPin,
  Layers,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { logoutUser } from "../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    applicants: false,
    analytics: false,
    maps: false,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));

  const toggleSidebar = () => {
    if (!collapsed) {
      setShowContent(false);
    }
    setCollapsed(!collapsed);
  };
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  useEffect(() => {
    if (!collapsed) {
      const timer = setTimeout(() => setShowContent(true), 250);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  const toggleSection = section => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Auto-open sections based on current route
  useEffect(() => {
    if (
      location.pathname.startsWith("/register-applicant") ||
      location.pathname.startsWith("/applicants") ||
      location.pathname.startsWith("/approved") ||
      location.pathname.startsWith("/archived-applicants")
    ) {
      setOpenSections(prev => ({ ...prev, applicants: true }));
    }
    if (location.pathname.startsWith("/analytics")) {
      setOpenSections(prev => ({ ...prev, analytics: true }));
    }
    if (
      location.pathname.startsWith("/geomapping") ||
      location.pathname.startsWith("/heatmap")
    ) {
      setOpenSections(prev => ({ ...prev, maps: true }));
    }
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    const map = {
      "/dashboard": "Dashboard",
      "/geomapping": "Geographic Mapping",
      "/heatmap": "Heat Map Analysis",
      "/register-applicant": "New Applicant",
      "/applicants": "All Applicants",
      "/approved": "Approved Applications",
      "/archived-applicants": "Archived Applications",
      "/export-applicants": "Export Data",
      "/analytics": "Analytics Overview",
      "/analytics/reports": "Detailed Reports",
      "/analytics/trends": "Trend Analysis",
      "/admin-management": "Admin Management",
      "/settings": "Settings",
    };
    return map[location.pathname] || "QuickAid";
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Successfully logged out", {
        duration: 3000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #334155",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#f1f5f9",
        },
      });
      navigate("/login");
    } catch (err) {
      toast.error("Failed to logout. Please try again.", {
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #334155",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#f1f5f9",
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out z-50
          ${collapsed ? "w-16" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Section */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800">
          {/* New Application Button */}
          <button
            onClick={() => navigate("/register-applicant")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors mb-4"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && (
              <span
                className={`transition-opacity duration-300 ${
                  showContent ? "opacity-100" : "opacity-0"
                }`}
              >
                New Application
              </span>
            )}
          </button>

          {/* User Profile */}
          {!collapsed && (
            <div
              onClick={() => {
                navigate("/settings");
              }}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer mb-2 transition-opacity duration-300 ${
                showContent ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {user ? `${user.first_name} ${user.last_name}` : "User"}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.is_superuser ? "Administrator" : "Staff Member"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            className="flex-1 overflow-y-auto px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Main Navigation */}
            <div className="space-y-6 pt-4">
              {/* Overview Section */}
              <div>
                {!collapsed && (
                  <h3
                    className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 transition-opacity duration-300 ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Overview
                  </h3>
                )}
                <div className="space-y-1">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {!collapsed && (
                      <span
                        className={`transition-opacity duration-300 ${
                          showContent ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Dashboard
                      </span>
                    )}
                  </NavLink>
                </div>
              </div>

              {/* Maps Section */}
              {user?.is_superuser && (
                <div>
                  {!collapsed && (
                    <h3
                      className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 transition-opacity duration-300 ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Mapping
                    </h3>
                  )}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("maps")}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span
                            className={`flex-1 text-left transition-opacity duration-300 ${
                              showContent ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            Maps
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              openSections.maps ? "rotate-90" : ""
                            } ${showContent ? "opacity-100" : "opacity-0"}`}
                          />
                        </>
                      )}
                    </button>

                    {openSections.maps && !collapsed && (
                      <div
                        className={`ml-4 space-y-1 border-l border-slate-700 pl-3 transition-opacity duration-300 ${
                          showContent ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <NavLink
                          to="/geomapping"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Geographic Map</span>
                        </NavLink>
                        <NavLink
                          to="/heatmap"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          <Layers className="w-4 h-4" />
                          <span>Heat Map</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Section */}
              {user?.is_superuser && (
                <div>
                  {!collapsed && (
                    <h3
                      className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 transition-opacity duration-300 ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Analytics
                    </h3>
                  )}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("analytics")}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span
                            className={`flex-1 text-left transition-opacity duration-300 ${
                              showContent ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            Analytics
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              openSections.analytics ? "rotate-90" : ""
                            } ${showContent ? "opacity-100" : "opacity-0"}`}
                          />
                        </>
                      )}
                    </button>

                    {openSections.analytics && !collapsed && (
                      <div
                        className={`ml-4 space-y-1 border-l border-slate-700 pl-3 transition-opacity duration-300 ${
                          showContent ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <NavLink
                          to="/analytics"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          <Activity className="w-4 h-4" />
                          <span>Overview</span>
                        </NavLink>
                        <NavLink
                          to="/analytics/reports"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          <PieChart className="w-4 h-4" />
                          <span>Detailed Reports</span>
                        </NavLink>
                        <NavLink
                          to="/analytics/trends"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                          }
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Trend Analysis</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Applicants Section */}
              <div>
                {!collapsed && (
                  <h3
                    className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 transition-opacity duration-300 ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Management
                  </h3>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => toggleSection("applicants")}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {!collapsed && (
                      <>
                        <span
                          className={`flex-1 text-left transition-opacity duration-300 ${
                            showContent ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          Applicants
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            openSections.applicants ? "rotate-90" : ""
                          } ${showContent ? "opacity-100" : "opacity-0"}`}
                        />
                      </>
                    )}
                  </button>

                  {openSections.applicants && !collapsed && (
                    <div
                      className={`ml-4 space-y-1 border-l border-slate-700 pl-3 transition-opacity duration-300 ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <NavLink
                        to="/register-applicant"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>New Applicant</span>
                      </NavLink>
                      <NavLink
                        to="/applicants"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        <span>All Applicants</span>
                      </NavLink>
                      <NavLink
                        to="/approved"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved</span>
                      </NavLink>
                      <NavLink
                        to="/export-applicants"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Export Data</span>
                      </NavLink>
                      <NavLink
                        to="/archived-applicants"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archived</span>
                      </NavLink>
                    </div>
                  )}

                  {/* Admin Section */}
                  {user?.is_superuser && (
                    <NavLink
                      to="/admin-management"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`
                      }
                    >
                      <Shield className="w-4 h-4" />
                      {!collapsed && (
                        <span
                          className={`transition-opacity duration-300 ${
                            showContent ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          Admin
                        </span>
                      )}
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-shrink-0 border-t border-slate-700 p-2">
            <div className="space-y-1">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-slate-700 text-blue-400 font-medium shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Settings className="w-4 h-4" />
                {!collapsed && (
                  <span
                    className={`transition-opacity duration-300 ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Settings
                  </span>
                )}
              </NavLink>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-white ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <LogOut className="w-4 h-4" />
                {!collapsed && (
                  <span
                    className={`transition-opacity duration-300 ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Logout
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-64"
        } z-50`}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4 z-50">
            {/* Mobile Menu Button */}
            <button className="text-slate-600 md:hidden" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              className="text-slate-600 hidden md:block hover:bg-slate-100 p-2 rounded-lg transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
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
