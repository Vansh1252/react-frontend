import { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import "../styles/settings.css";
import { axiosInstance } from "../lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../components/Loader";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({
        fullName: "",
        email: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [loading, setLoading] = useState(false);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    // === Fetch current profile data ===
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/auth/me");
            setProfile({
                fullName: res.data.fullName,
                email: res.data.email
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // === Update Full Name ===
    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.put("/auth/update", {
                fullName: profile.fullName,
                email: profile.email
            });
            toast.success(res.data.message || "Profile updated successfully");
            fetchProfile(); // Refresh data after update
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // === Change Password ===
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        try {
            setLoading(true);
            const res = await axiosInstance.put("/auth/update-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success(res.data.message || "Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div className="user-info">
                            <div className="user-avatar">
                                <span>
                                    {profile.fullName
                                        ? profile.fullName.split(" ").map(n => n[0]).join("")
                                        : "U"}
                                </span>
                            </div>
                            <span className="user-name">{profile.fullName}</span>
                        </div>
                    </div>
                </header>

                <div className="tab-header">
                    <div
                        className={`tab ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Information
                    </div>
                    <div
                        className={`tab ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Change Password
                    </div>
                </div>

                <div className="tab-content">
                    <div className="tab-full">
                        {activeTab === "profile" && (
                            <div className="form-section">
                                <label>Full name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleProfileChange}
                                />

                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                />

                                <div className="button-group">
                                    <button className="cancel-btn">Cancel</button>
                                    <button className="save-btn" onClick={handleUpdateProfile}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "password" && (
                            <div className="form-section">
                                <label>Current password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                />

                                <label>New password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Enter New Password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />

                                <label>Confirm new password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />

                                <div className="button-group">
                                    <button className="cancel-btn">Cancel</button>
                                    <button className="save-btn" onClick={handleChangePassword}>
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading && <Loader />}
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
};

export default Settings;
