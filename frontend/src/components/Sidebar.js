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
  ChevronRight,
  Menu,
  X,
  Plus,
  TrendingUp,
  Activity,
  MapPin,
  Layers,
  ChevronLeft,
  Home,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "./CustomToast";
import { logoutUser } from "../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  const toggleSection = section => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => {
        setOpenSections(prev => ({
          ...prev,
          [section]: !prev[section],
        }));
      }, 200);
    } else {
      setOpenSections(prev => {
        const newState = {
          applicants: false,
          analytics: false,
          maps: false,
        };
        newState[section] = !prev[section];
        return newState;
      });
    }
  };

  // Auto-open sections based on current route
  useEffect(() => {
    const path = location.pathname;
    const newOpenSections = { applicants: false, analytics: false, maps: false };

    if (
      path.includes("/register-applicant") ||
      path.includes("/applicants") ||
      path.includes("/approved") ||
      path.includes("/archived-applicants") ||
      path.includes("/export-applicants")
    ) {
      newOpenSections.applicants = true;
    }
    if (path.includes("/analytics")) {
      newOpenSections.analytics = true;
    }
    if (path.includes("/geomapping") || path.includes("/heatmap")) {
      newOpenSections.maps = true;
    }

    setOpenSections(newOpenSections);
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
      "/analytics/geographic": "Geographic Analytics",
      "/analytics/demographics-economics": "Demographics & Economics",
      "/analytics/trends": "Trends & Forecasting",
      "/analytics/performance": "Performance Insights",
      "/admin-management": "Admin Management",
      "/settings": "Settings",
    };
    return map[location.pathname] || "Dashboard";
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      localStorage.removeItem("userData");

      toast.custom(t => <CustomToast t={t} type="logout" />);

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out z-50
          ${collapsed ? "w-16" : "w-56"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Section - Burger Icon and New Application Button */}
        <div className="flex-shrink-0 p-3 border-b border-gray-700 flex flex-col gap-3">
          {/* Collapse/Expand Toggle (Burger Icon inside Sidebar) */}
          <div className={`flex ${collapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-white hover:bg-gray-700 p-2 rounded-full transition-colors hidden md:block"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* New Application Button */}
          <button
            onClick={() => navigate("/register-applicant")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && (
              <span
                className={`transition-opacity text-white duration-300 ${
                  showContent ? "opacity-100" : "opacity-0"
                }`}
              >
                New Application
              </span>
            )}
          </button>
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
            <div className="space-y-6 py-4">
              {/* Overview Section */}
              <div>
                {!collapsed && (
                  <h3
                    // Ensured this is pure white
                    className={`text-white font-bold uppercase tracking-wider px-3 mb-2 transition-opacity duration-300 text-xs ${
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
                          ? "bg-gray-700 text-white font-semibold shadow-inner shadow-gray-900/50"
                          : // Ensured inactive text is pure white
                            "text-white hover:bg-gray-700 hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {!collapsed && (
                      <span
                        className={`transition-opacity text-white duration-300 ${
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
                      // Ensured this is pure white
                      className={`text-white font-bold uppercase tracking-wider px-3 mb-2 transition-opacity duration-300 text-xs ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Mapping
                    </h3>
                  )}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("maps")}
                      // Ensured button text and icon is pure white
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <Map className="w-5 h-5" />
                      {!collapsed && (
                        <>
                          <span
                            className={`flex-1 text-left text-white transition-opacity duration-300 ${
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
                        className={`ml-4 space-y-1 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 ${
                          showContent ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <NavLink
                          to="/geomapping"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-white">Geographic Map</span>
                        </NavLink>
                        <NavLink
                          to="/heatmap"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <Layers className="w-4 h-4" />
                          <span className="text-white">Heat Map</span>
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
                      // Ensured this is pure white
                      className={`text-white font-bold uppercase tracking-wider px-3 mb-2 transition-opacity duration-300 text-xs ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Analytics
                    </h3>
                  )}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("analytics")}
                      // Ensured button text and icon is pure white
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      {!collapsed && (
                        <>
                          <span
                            className={`flex-1 text-white text-left transition-opacity duration-300 ${
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
                        className={`ml-4 space-y-1 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 ${
                          showContent ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <NavLink
                          to="/analytics/geographic"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-white">Geographic</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/demographics-economics"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-white">Demographics & Economics</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/trends"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-white">Trends & Forecasting</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/performance"
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : // Ensured nested link text is pure white
                                  "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <Activity className="w-4 h-4" />
                          <span className="text-white">Performance</span>
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
                    // Ensured this is pure white
                    className={`text-white font-bold uppercase tracking-wider px-3 mb-2 transition-opacity duration-300 text-xs ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Management
                  </h3>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => toggleSection("applicants")}
                    // Ensured button text and icon is pure white
                    className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    {!collapsed && (
                      <>
                        <span
                          className={`flex-1 text-white text-left transition-opacity duration-300 ${
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
                      className={`ml-4 space-y-1 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <NavLink
                        to="/register-applicant"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gray-700 text-white font-medium"
                              : // Ensured nested link text is pure white
                                "text-white hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-white">New Applicant</span>
                      </NavLink>

                      <NavLink
                        to="/applicants"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gray-700 text-white font-medium"
                              : // Ensured nested link text is pure white
                                "text-white hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-white">All Applicants</span>
                      </NavLink>
                      {user?.is_superuser && (
                        <>
                          <NavLink
                            to="/approved"
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-gray-700 text-white font-medium"
                                  : "text-white hover:bg-gray-700 hover:text-white"
                              }`
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-white">Approved</span>
                          </NavLink>

                          <NavLink
                            to="/export-applicants"
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-gray-700 text-white font-medium"
                                  : "text-white hover:bg-gray-700 hover:text-white"
                              }`
                            }
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-white">Export Data</span>
                          </NavLink>
                        </>
                      )}
                      <NavLink
                        to="/archived-applicants"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gray-700 text-white font-medium"
                              : // Ensured nested link text is pure white
                                "text-white hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        <Archive className="w-4 h-4" />
                        <span className="text-white">Archived</span>
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
                            ? "bg-gray-700 text-white font-semibold shadow-inner shadow-gray-900/50"
                            : // Ensured inactive text is pure white
                              "text-white hover:bg-gray-700 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`
                      }
                    >
                      <Shield className="w-5 h-5" />
                      {!collapsed && (
                        <span
                          className={`text-white transition-opacity duration-300 ${
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

          {/* User Profile/Settings/Logout Section */}
          <div className="border-t border-gray-700 px-2 py-2">
            <div className="relative">
              {/* Profile Button */}
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center w-full gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
                  {user
                    ? user.first_name
                      ? user.first_name.charAt(0).toUpperCase()
                      : user.username?.charAt(0).toUpperCase() || "?"
                    : "?"}
                </div>

                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white truncate">
                      {user ? `${user.first_name} ${user.last_name}` : "User"}
                    </p>
                    {/* Changed to white for consistency */}
                    <p className="text-xs text-white">
                      {user?.is_superuser ? "Administrator" : "Staff Member"}
                    </p>
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {!collapsed && profileMenuOpen && (
                <div className="absolute bottom-14 left-3 right-3 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white">
                      {user ? `${user.first_name} ${user.last_name}` : "User"}
                    </p>
                    {/* Changed to white for consistency */}
                    <p className="text-xs text-white">
                      {user?.is_superuser ? "Administrator" : "Staff Member"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setProfileMenuOpen(false);
                    }}
                    // Ensured menu button text is pure white
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
  onClick={() => {
    navigate("/");
    setProfileMenuOpen(false);
  }}
  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
>
  <Home className="w-4 h-4" /> Home
</button>

                  <button
                    onClick={handleLogout}
                    // Logout text remains red for safety/prominence
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-16" : "md:ml-56"
        } z-30`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="sticky flex items-center gap-4 z-50">
            {/* Mobile Menu Button (Remains) */}
            <button className="text-gray-600 md:hidden" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* The main title/page name */}
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3"></div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet context={{ isSidebarMinimized: collapsed }} />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
