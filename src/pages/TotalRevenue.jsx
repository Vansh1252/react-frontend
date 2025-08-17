import { useState, useEffect } from 'react';
import { Sidebar } from "../components/sidebar";
import { MetricsCard } from "../components/metricscards";
import { RevenueTable } from "../components/revenuetable";
import "../styles/Dashboard.css";
import { axiosInstance } from "../lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../components/Loader";


export const TotalRevenue = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [metrics, setMetrics] = useState({
        totalActiveStudents: 0,
        onLeaveStudents: 0,
        totalTutors: 0,
        profitWeek: 0,
        profitMonth: 0,
    });
    const [recentPayments, setRecentPayments] = useState([]); // Correctly named for recent students
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNav, setActiveNav] = useState('dashboard');


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/auth/total-revenue');

                const fetchedRevenue = response.data; // Corrected variable name for clarity

                console.log("Fetched Dashboard Data:", fetchedRevenue); // New log to see the correct data

                setMetrics({
                    totalRevenue:fetchedRevenue.totalRevenueAmount,
                    profitWeek: fetchedRevenue.weeklyProfitAmount || 0,
                    profitMonth: fetchedRevenue.monthlyProfitAmount || 0,
                });
                setRecentPayments(fetchedRevenue.recentPayments|| []);

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err.response?.data || err.message);
                setError(err.response?.data?.message || err.message || "Failed to load dashboard data. Please check server.");
                toast.error(err.response?.data?.message || err.message || "Failed to load dashboard data.");
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
                                title="Total Revenue"
                                value={`$ ${metrics.totalRevenue.toFixed(2)}`}
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

                        <RevenueTable data={recentPayments} />
                    </div>
                </main>
            </div>
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
};

export default TotalRevenue;