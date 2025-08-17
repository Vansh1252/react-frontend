import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DollarSign,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { toast } from "react-toastify";
import "../styles/Sidebar.css";
import logo from "../assets/logo.png"; // Adjust path if needed
import { axiosInstance } from "../lib/axios";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Students", path: "/student" },
  { icon: GraduationCap, label: "Tutors", path: "/tutor" },
  { icon: DollarSign, label: "Revenue", path: "/total-revenue" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: LogOut, label: "Logout (This Device)", action: "logoutThisDevice" },
  { icon: LogOut, label: "Logout (All Devices)", action: "logoutAllDevices" },
];

const Sidebar = ({ collapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (action) => {
    setIsLoading(true);
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      const token = auth.token;
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const endpoint = action === "logoutThisDevice"
        ? "/auth/logout"
        : "/auth/logout-all";

      const response = await axiosInstance(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        localStorage.clear();
        toast.success("Logged out successfully!");
        navigate("/login");
      } else {
        toast.error("error in logout")
      }
    } catch (error) {
      toast.error(`Logout error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {!collapsed && (
            <div className="sidebar-logo">
              <button onClick={() => navigate("/")} aria-label="Go to dashboard">
                <img src={logo} alt="Logo" />
              </button>
            </div>
          )}
          {onToggle && (
            <button onClick={onToggle} className="sidebar-toggle" aria-label="Toggle sidebar">
              {collapsed ? (
                <ChevronRight className="sidebar-nav-icon" />
              ) : (
                <ChevronLeft className="sidebar-nav-icon" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-list">
          {navItems.map((item) => (
            item.path ? (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                <item.icon className="sidebar-nav-icon" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ) : (
              <button
                key={item.action}
                onClick={() => handleLogout(item.action)}
                className="sidebar-nav-item"
                disabled={isLoading}
                aria-label={item.label}
              >
                <item.icon className="sidebar-nav-icon" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          ))}
        </div>
      </nav>
    </div>
  );
};

export { Sidebar };