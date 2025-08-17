import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Plus, MoreHorizontal, X } from 'lucide-react'; // Assuming Lucide icons are installed
import '../../styles/student-details.css'; // Ensure your CSS is linked
import { Sidebar } from '../../components/sidebar';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams and useNavigate
import { axiosInstance } from '../../lib/axios'; // Import axiosInstance
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import moment from 'moment'; // For date formatting
import Loader from "../../components/Loader"; // Import Loader
import AssignTutorModal from "./assigntutormodel";
import "../../styles/assign-tutor.css";
import StudentEdits from "./StudentEdit";
import EditAdditionalDetails from "./edit-additional-details";

function StudentDetails() {
    const navigate = useNavigate();
    const { studentId } = useParams(); // Get studentId from URL parameters
    const [activeNav, setActiveNav] = useState('students'); // For Sidebar
    const [studentDetails, setStudentDetails] = useState(null); // State to store fetched student data
    const [loading, setLoading] = useState(true); // Loading state for data fetch
    const [error, setError] = useState(null); // Error state for data fetch
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditAdditionalDetailsOpen, setIsEditAdditionalDetailsOpen] = useState(false);

    // --- Fetch Student Details on component mount or studentId change ---
    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (!studentId) {
                setError("Student ID is missing in the URL.");
                setLoading(false);
                toast.error("Student ID missing. Redirecting to student list.");
                navigate('/student'); // Redirect if ID is missing
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // API call to get one student's details
                // Backend endpoint: GET /api/v1/students/:studentId
                const response = await axiosInstance.get(`/student/details/${studentId}`);
                console.log(response.data.data)
                setStudentDetails(response.data.data); // Set the fetched data
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch student details:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to load student details.");
                toast.error(err.response?.data?.message || "Failed to load student details.");
                setStudentDetails(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [studentId, navigate]); // Re-fetch if studentId changes or navigate function changes

    // Loading state display
    if (loading) {
        return (
            <div className="container-4 loading-overlay">
                <Loader />
            </div>
        );
    }

    // Error state display
    if (error) {
        return (
            <div className="container-4">
                <p className="error-message">{error}</p>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            </div>
        );
    }

    // If no studentDetails after loading (e.g., 404 from API)
    if (!studentDetails) {
        return (
            <div className="container-4">
                <p className="no-data-message">No student details found.</p>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            </div>
        );
    }

    // Helper for toggling times in the modal (if used)
    const toggleTimeSlot = (day, time) => {
        setSelectedTimes(prev => ({
            ...prev,
            [day]: prev[day].includes(time)
                ? prev[day].filter(t => t !== time)
                : [...prev[day], time]
        }));
    };

    // Helper to format date for display
    const formatDate = (dateString) => {
        return dateString ? moment(dateString).format('DD/MM/YYYY') : '-';
    };

    // Helper to format currency for display (consistent with Payout.js)
    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    return (
        <div className="container-4">
            <div className="sidebar">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <div className="header">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                    </div>
                    <div className="header-right">
                        <span className="user-name">Angelica Lima</span> {/* Dynamic user name if available */}
                        <div className="user-avatar">AL</div>
                    </div>
                </div>

                {/* Content Header */}
                <div className="content-header">
                    <div>
                        <button className="archive-btn">Archive</button>
                    </div>
                    <div>
                        {!studentDetails.assignedTutorName && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Assign Tutor
                            </button>
                        )}
                    </div>
                </div>

                {/* Student Info Card */}
                <div className="tutor-card">
                    <div className="tutor-header">
                        <div>
                            <h2 className="tutor-name">{`${studentDetails.firstName} ${studentDetails.lastName}`}</h2>
                            <div className="tutor-meta">
                                <span>📍 {studentDetails.address}, {studentDetails.city}, {studentDetails.state}, {studentDetails.country}</span>
                                <span>📧 {studentDetails.email}</span>
                                <span>📞 {studentDetails.phoneNumber}</span>
                                <span>⏰ {studentDetails.timezone || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="tutor-actions" onClick={() => setIsEditModalOpen(true)}>
                            <Edit size={16} /> {/* Edit button */}
                        </div>
                    </div>

                    <div className="tutor-details">
                        <div className="detail-item">
                            <span className="detail-label">Status</span>
                            <span className={`detail-value status-indicator ${studentDetails.status === 'active' ? 'active-status' : studentDetails.status === 'paused' ? 'paused-status' : 'inactive-status'}`}>
                                {studentDetails.status}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Student Number</span>
                            <span className="detail-value">{studentDetails.studentNumber}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Current Tutor </span>
                            <span className="detail-value">{studentDetails.assignedTutorName || 'Not Assigned'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Session Duration</span>
                            <span className="detail-value">{studentDetails.sessionDuration ? `${studentDetails.sessionDuration} min` : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Year</span>
                            <span className="detail-value">{studentDetails.year}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Grade</span>
                            <span className="detail-value">{studentDetails.grade}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Meeting Link</span>
                            <span className="detail-value meeting-link">
                                {studentDetails.meetingLink ? <a href={studentDetails.meetingLink} target="_blank" rel="noopener noreferrer">↗</a> : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="additional-details">
                    <div className="section-header">
                        <h3>Additional Details</h3>
                        <Edit size={16} onClick={() => setIsEditAdditionalDetailsOpen(true)} />
                    </div>
                    <div className="additional-details-content">
                        <div className="detail-item">
                            <span className="detail-label">Start Date</span>
                            <span className="detail-value">{formatDate(studentDetails.startDate)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">End Date</span>
                            <span className="detail-value">{formatDate(studentDetails.dischargeDate)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Ref. Source</span>
                            <span className="detail-value">{studentDetails.referralSource || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Account Created</span>
                            <span className="detail-value">{studentDetails.accountCreated ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
                {/* Payout History */}
                <div className="payout-section">
                    <div className="section-header"> {/* Reusing section-header class */}
                        <h3>Payout History</h3>
                        <button className="reset-filter">Reset all filter</button>
                    </div>

                    <div className="table-container">
                        {studentDetails.payoutHistory && studentDetails.payoutHistory.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-header">Payment ID</th>
                                        <th className="table-header">Tutor Name</th>
                                        <th className="table-header">Amount</th>
                                        <th className="table-header">Transaction Fee</th>
                                        <th className="table-header">Total Received</th>
                                        <th className="table-header">Tutor Payout</th>
                                        <th className="table-header">Platform Profit</th>
                                        <th className="table-header">Status</th>
                                        <th className="table-header">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentDetails.payoutHistory.map((row) => (
                                        <tr key={row.razorpayOrderId || row.id} className="table-row">
                                            <td className="table-cell">{row.razorpayOrderId || 'N/A'}</td>
                                            <td className="table-cell tutor-name-link">{row.tutorName || 'N/A'}</td>
                                            <td className="table-cell">{formatCurrency(row.amount)}</td>
                                            <td className="table-cell">{formatCurrency(row.transactionFee)}</td>
                                            <td className="table-cell">{formatCurrency(row.totalAmount)}</td>
                                            <td className="table-cell">{formatCurrency(row.tutorPayout)}</td>
                                            <td className="table-cell">{formatCurrency(row.profitWeek + row.profitMonth)}</td>
                                            <td className="table-cell">{row.status || 'N/A'}</td>
                                            <td className="table-cell">{row.createdAt ? moment(row.createdAt).format('DD/MM/YYYY') : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payout history recorded for this student.</p>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <AssignTutorModal
                    studentId={studentId}
                    onClose={() => setIsModalOpen(false)}
                />      
            )}
            {isEditModalOpen && (
                <StudentEdits
                    studentId={studentId}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
            {isEditAdditionalDetailsOpen && (
                <EditAdditionalDetails
                    studentId={studentId}
                    onClose={() => setIsEditAdditionalDetailsOpen(false)}
                />
            )}
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div >
    );
}

export default StudentDetails;