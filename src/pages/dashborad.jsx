import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { MetricsCard } from "../components/metricscards";
import { TutorTable } from "../components/tutortable";
import "../styles/Dashboard.css";
import { axiosInstance } from "../lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../components/Loader";


export const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [metrics, setMetrics] = useState({
        totalActiveStudents: 0,
        onLeaveStudents: 0,
        totalTutors: 0,
        profitWeek: 0,
        profitMonth: 0,
    });
    const [recentStudents, setRecentStudents] = useState([]); // Correctly named for recent students
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('dashboard');


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/auth/dashboard/admin');

                const { totalActiveStudents, onLeaveStudents, totalTutors, profitWeek, profitMonth } = response.data;
                setMetrics({
                    totalActiveStudents: totalActiveStudents || 0,
                    onLeaveStudents: onLeaveStudents || 0,
                    totalTutors: totalTutors || 0,
                    profitWeek: profitWeek || 0,
                    profitMonth: profitMonth || 0,
                });
                setRecentStudents(recentStudents || []);

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err.response?.data || err.message);
                setError(err.response?.data?.message || err.message || "Failed to load dashboard data. Please check server.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-container loading-overlay">
                <Loader />
            </div>
        );
    }
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
                                <span>AL</span>
                            </div>
                            <span className="user-name">Angelica Lima</span>
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="dashboard-content-inner">
                        <div className="metrics-grid">
                            <MetricsCard
                                title="Total Active Students"
                                value={metrics.totalActiveStudents}
                            />
                            <MetricsCard
                                title="On Leave Students"
                                value={String(metrics.onLeaveStudents).padStart(2, '0')}
                            />
                            <MetricsCard
                                title="Total Tutors"
                                value={metrics.totalTutors}
                            />
                            <MetricsCard
                                title="Profit 1 Week"
                                value={`$ ${metrics.profitWeek.toFixed(2)}`}
                            />
                            <MetricsCard
                                title="Profit 4 Week"
                                value={`$ ${metrics.profitMonth.toFixed(2)}`}
                            />
                        </div>

                        <TutorTable data={recentStudents} />
                    </div>
                </main>
            </div>
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
};

export default Dashboard;