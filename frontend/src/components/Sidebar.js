import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
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
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomToast from "./CustomToast";
import { logoutUser } from "../services/api";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // New unified popout system
  const [openPopout, setOpenPopout] = useState(null);
  const [popoutY, setPopoutY] = useState(0);
  const hoverTimeout = useRef(null);

  // Refs for Y-position tracking
  const applicantsRef = useRef(null);
  const analyticsRef = useRef(null);
  const mapsRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));

  /* ───────────────────────────────────────────
        SIDEBAR COLLAPSE / MOBILE  
  ─────────────────────────────────────────── */
  const toggleSidebar = () => {
    if (!collapsed) setShowContent(false);
    setCollapsed(prev => !prev);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  useEffect(() => {
    if (!collapsed) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  /* ───────────────────────────────────────────
      HOVER POPUP LOGIC (Collapsed only)
  ─────────────────────────────────────────── */
  const handleMouseEnter = (section, ref) => {
    if (!collapsed) return;

    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }

    if (ref?.current) {
      setPopoutY(ref.current.offsetTop);
    }

    setOpenPopout(section);
  };

  const handleMouseLeave = () => {
    if (!collapsed) return;

    hoverTimeout.current = setTimeout(() => {
      setOpenPopout(null);
    }, 160);
  };

  const handleSubmenuEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const handleSubmenuLeave = () => {
    if (!collapsed) return;

    hoverTimeout.current = setTimeout(() => {
      setOpenPopout(null);
    }, 160);
  };

  /* ───────────────────────────────────────────
      EXPANDED — CLICK ACCORDION SYSTEM (A)
  ─────────────────────────────────────────── */
  const [openSections, setOpenSections] = useState({
    applicants: false,
    analytics: false,
    maps: false,
  });

  const toggleAccordion = section => {
    if (collapsed) return; // hover mode only, click does nothing

    setOpenSections(prev => {
      const newState = {
        applicants: false,
        analytics: false,
        maps: false,
      };
      newState[section] = !prev[section];
      return newState;
    });
  };

  /* ───────────────────────────────────────────
      AUTO-OPEN BASED ON ROUTE  
  ─────────────────────────────────────────── */
  useEffect(() => {
    const path = location.pathname;

    const newSections = {
      applicants: false,
      analytics: false,
      maps: false,
    };

    if (
      path.includes("/register-applicant") ||
      path.includes("/applicants") ||
      path.includes("/approved") ||
      path.includes("/disbursement") ||
      path.includes("/archived-applicants") ||
      path.includes("/export-applicants")
    ) {
      newSections.applicants = true;
    }

    if (path.includes("/analytics")) {
      newSections.analytics = true;
    }

    if (path.includes("/geomapping") || path.includes("/heatmap")) {
      newSections.maps = true;
    }

    setOpenSections(newSections);
  }, [location.pathname]);

  /* ───────────────────────────────────────────
      MOBILE MENU AUTO CLOSE  
  ─────────────────────────────────────────── */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /* ───────────────────────────────────────────
      PAGE TITLES  
  ─────────────────────────────────────────── */
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
      "/analytics/trends": "Application Trends Analysis",
      "/analytics/performance": "Performance Insights",
      "/admin-management": "Admin Management",
      "/settings": "Settings",
      "/disbursement": "Disbursement",
    };
    return map[location.pathname] || "Dashboard";
  };

  /* ───────────────────────────────────────────
      LOGOUT  
  ─────────────────────────────────────────── */
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("userData");
      toast.custom(t => <CustomToast t={t} type="logout" />);

      setTimeout(() => navigate("/login"), 800);
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  /* ───────────────────────────────────────────
      HELPERS
  ─────────────────────────────────────────── */
  const handleNavClick = () => {
    // Close any open popout after navigation
    setOpenPopout(null);
    // close mobile menu on navigation (already handled by effect on pathname, but safe)
    setMobileMenuOpen(false);
  };

  // header left/width (matches tailwind widths)
  const collapsedLeft = mobileMenuOpen ? "0" : "3.5rem";
  const collapsedWidth = mobileMenuOpen ? "100%" : "calc(100% - 3.5rem)";
  const expandedLeft = mobileMenuOpen ? "0" : "16rem";
  const expandedWidth = mobileMenuOpen ? "100%" : "calc(100% - 16rem)";

  return (
    <div className="flex min-h-screen h-full bg-gray-100 overflow-x-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out z-50
          ${collapsed ? "w-14 sm:w-16" : "w-48 sm:w-56 md:w-60 lg:w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top */}
        <div className="flex-shrink-0 p-3 border-b border-gray-700 flex flex-col gap-3">
          <div className={`flex ${collapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-white hover:bg-gray-700 p-2 rounded-full transition-colors hidden md:block"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={() => navigate("/new-applicant")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors duration-200"
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

        {/* Scrollable nav */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            className="flex-1 overflow-y-auto px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="space-y-4 py-4">
              {/* Overview */}
              <div>
                {!collapsed && (
                  <h3
                    className={`text-white font-bold uppercase tracking-wider px-3 mb-1 transition-opacity duration-300 text-xs ${
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
                      `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-gray-700 text-white font-semibold shadow-inner shadow-gray-900/50"
                          : "text-white hover:bg-gray-700 hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                    onClick={handleNavClick}
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

              {/* Maps */}
              {user?.is_superuser && (
                <div>
                  {!collapsed && (
                    <h3
                      className={`text-white font-bold uppercase tracking-wider px-3 mb-1 transition-opacity duration-300 text-xs ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Mapping
                    </h3>
                  )}

                  <div className="space-y-1">
                    <button
                      ref={mapsRef}
                      onClick={() => toggleAccordion("maps")}
                      onMouseEnter={() => handleMouseEnter("maps", mapsRef)}
                      onMouseLeave={handleMouseLeave}
                      className={`flex items-center gap-3 w-full px-3 py-1.5 text-xs rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
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

                    {/* submenu: floating when collapsed; inline when expanded */}
                    {(openPopout === "maps" || (!collapsed && openSections.maps)) && (
                      <div
                        onMouseEnter={handleSubmenuEnter}
                        onMouseLeave={handleSubmenuLeave}
                        className={`${
                          collapsed
                            ? "absolute left-full ml-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-50"
                            : `ml-4 space-y-0.5 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 ${
                                showContent ? "opacity-100" : "opacity-0"
                              }`
                        }`}
                        style={collapsed ? { top: popoutY } : {}}
                      >
                        <NavLink
                          to="/geomapping"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-white">Geographic Map</span>
                        </NavLink>

                        <NavLink
                          to="/heatmap"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
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

              {/* Analytics */}
              {user?.is_superuser && (
                <div>
                  {!collapsed && (
                    <h3
                      className={`text-white font-bold uppercase tracking-wider px-3 mb-1 transition-opacity duration-300 text-xs ${
                        showContent ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Analytics
                    </h3>
                  )}

                  <div className="space-y-1">
                    <button
                      ref={analyticsRef}
                      onClick={() => toggleAccordion("analytics")}
                      onMouseEnter={() => handleMouseEnter("analytics", analyticsRef)}
                      onMouseLeave={handleMouseLeave}
                      className={`flex items-center gap-3 w-full px-3 py-1.5 text-xs rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      {!collapsed && (
                        <>
                          <span
                            className={`flex-1 text-left text-white transition-opacity duration-300 ${
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

                    {(openPopout === "analytics" ||
                      (!collapsed && openSections.analytics)) && (
                      <div
                        onMouseEnter={handleSubmenuEnter}
                        onMouseLeave={handleSubmenuLeave}
                        className={`${
                          collapsed
                            ? "absolute left-full ml-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-50"
                            : "ml-4 space-y-0.5 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 " +
                              (showContent ? "opacity-100" : "opacity-0")
                        }`}
                        style={collapsed ? { top: popoutY } : {}}
                      >
                        <NavLink
                          to="/analytics/geographic"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-white">Geographic</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/demographics-economics"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-white">Demographics & Economics</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/trends"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-white">Trends Analysis</span>
                        </NavLink>

                        <NavLink
                          to="/analytics/performance"
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-gray-700 text-white font-medium"
                                : "text-white hover:bg-gray-700 hover:text-white"
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

              {/* Applicants (management) */}
              <div>
                {!collapsed && (
                  <h3
                    className={`text-white font-bold uppercase tracking-wider px-3 mb-1 transition-opacity duration-300 text-xs ${
                      showContent ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Management
                  </h3>
                )}

                <div className="space-y-1">
                  <button
                    ref={applicantsRef}
                    onClick={() => toggleAccordion("applicants")}
                    onMouseEnter={() => handleMouseEnter("applicants", applicantsRef)}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center gap-3 w-full px-3 py-1.5 text-xs rounded-lg transition-all duration-200 text-white hover:bg-gray-700 hover:text-white ${
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

                  {(openPopout === "applicants" ||
                    (!collapsed && openSections.applicants)) && (
                    <div
                      onMouseEnter={handleSubmenuEnter}
                      onMouseLeave={handleSubmenuLeave}
                      className={`${
                        collapsed
                          ? "absolute left-full ml-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-50"
                          : "ml-4 space-y-0.5 border-l-2 border-gray-600 pl-3 transition-opacity duration-300 " +
                            (showContent ? "opacity-100" : "opacity-0")
                      }`}
                      style={collapsed ? { top: popoutY } : {}}
                    >
                      {/* All Applicants - Available to all staff */}
                      <NavLink
                        to="/applicants"
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gray-700 text-white font-medium"
                              : "text-white hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-white">All Applicants</span>
                      </NavLink>

                      {/* Superuser-only items */}
                      {user?.is_superuser && (
                        <>
                          <NavLink
                            to="/approved"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
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
                            to="/disbursement"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-gray-700 text-white font-medium"
                                  : "text-white hover:bg-gray-700 hover:text-white"
                              }`
                            }
                          >
                            <Wallet className="w-4 h-4" />
                            <span className="text-white">Disbursement</span>
                          </NavLink>

                          <NavLink
                            to="/export-applicants"
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
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

                      {/* Archived - Available to all staff */}
                      <NavLink
                        to="/archived-applicants"
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gray-700 text-white font-medium"
                              : "text-white hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        <Archive className="w-4 h-4" />
                        <span className="text-white">Archived</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin */}
              {user?.is_superuser && (
                <NavLink
                  to="/admin-management"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gray-700 text-white font-semibold shadow-inner shadow-gray-900/50"
                        : "text-white hover:bg-gray-700 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  onClick={handleNavClick}
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

          {/* Profile / settings */}
          <div className="border-t border-gray-700 px-2 py-2">
            <div className="relative">
              <button
                ref={profileRef}
                onClick={() => {
                  if (!collapsed) setProfileMenuOpen(v => !v);
                }}
                onMouseEnter={() => handleMouseEnter("profile", profileRef)}
                onMouseLeave={handleMouseLeave}
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
                    <p className="text-xs font-semibold text-white truncate">
                      {user ? `${user.first_name} ${user.last_name}` : "User"}
                    </p>
                    <p className="text-xs text-white">
                      {user?.is_superuser ? "Administrator" : "Staff Member"}
                    </p>
                  </div>
                )}
              </button>

              {/* Profile dropdown: floating when collapsed; inline when expanded */}
              {(openPopout === "profile" || (!collapsed && profileMenuOpen)) && (
                <div
                  onMouseEnter={handleSubmenuEnter}
                  onMouseLeave={handleSubmenuLeave}
                  className={`${
                    collapsed
                      ? "absolute left-full ml-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 px-1 min-w-[200px] z-50"
                      : "absolute bottom-14 left-0.5 right-0.5 min-w-[200px] bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 z-50 animate-fade-in"
                  }`}
                  style={collapsed ? { top: popoutY } : {}}
                >
                  <div className="px-3 py-1.5 border-b border-gray-700">
                    <p className="text-xs font-semibold text-white">
                      {user ? `${user.first_name} ${user.last_name}` : "User"}
                    </p>
                    <p className="text-xs text-white">
                      {user?.is_superuser ? "Administrator" : "Staff Member"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/settings");
                      setProfileMenuOpen(false);
                      handleNavClick();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>

                  <button
                    onClick={() => {
                      navigate("/");
                      setProfileMenuOpen(false);
                      handleNavClick();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white hover:bg-gray-700 transition-colors"
                  >
                    <Home className="w-4 h-4" /> Home
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      handleNavClick();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 pt-[3rem] ${
          collapsed
            ? "w-full md:w-auto md:ml-14 lg:ml-16"
            : "w-full md:w-auto md:ml-48 lg:ml-56 xl:ml-60 2xl:ml-64"
        }`}
      >
        {/* Fixed header */}
        <header
          className="fixed top-0 right-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 shadow-sm transition-all duration-300"
          style={{
            left: collapsed ? collapsedLeft : expandedLeft,
            width: collapsed ? collapsedWidth : expandedWidth,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 justify-between">
            <button
              className="text-gray-600 md:hidden flex-shrink-0"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              {getPageTitle()}
            </h1>

            <img
              src="/QuickaidText.png"
              alt="Logo"
              className="h-3 sm:h-5 md:h-6 object-contain mr-10"
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0"></div>
        </header>

        {/* Page content with padding-top so fixed header doesn't cover it */}
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 md:py-5 pt-20">
          <Outlet context={{ isSidebarMinimized: collapsed }} />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
