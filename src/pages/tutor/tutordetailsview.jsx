import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Edit, Plus, MoreHorizontal, X } from 'lucide-react';
import '../../styles/student-details.css';
import { Sidebar } from '../../components/sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import Loader from "../../components/Loader";
import TutorEdits from "./edit-tutor";
import AssignStudent from "./aissgn-student";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = ["30 minutes", "60 minutes", "90 minutes"]; // Available duration options

function TutorDetails() {
    const navigate = useNavigate();
    const { tutorId } = useParams();
    const [activeNav, setActiveNav] = useState('students');
    const [tutorDetails, setTutorDetails] = useState(null);
    const [tutorData, setTutorData] = useState({
        selectedDays: [],
        selectedSlots: {},
        durationMinutes: "60 minutes" // Default duration
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [apiSlotData, setApiSlotData] = useState({}); // Stores the fetched slots grouped by day
    const [showassignstudentmodal, setShowassignstudentmodal] = useState(false);

    useEffect(() => {
        const fetchTutorDetails = async () => {
            if (!tutorId) {
                setError("Tutor ID is missing in the URL.");
                toast.error("Tutor ID missing. Redirecting to tutor list.");
                navigate('/tutor');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get(`/tutor/details/${tutorId}`);
                setTutorDetails(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch tutor details:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to load tutor details.");
                toast.error(err.response?.data?.message || "Failed to load tutor details.");
                setTutorDetails(null);
                setLoading(false);
            }
        };

        fetchTutorDetails();
    }, [tutorId, navigate]);

    const fetchSlots = useCallback(async () => {
        const { durationMinutes } = tutorData;

        if (!tutorId || !durationMinutes) {
            setApiSlotData({});
            toast.error("Tutor ID or duration is missing.");
            return;
        }

        try {
            setLoading(true);
            const durationValue = parseInt(durationMinutes.split(' ')[0]);
            const res = await axiosInstance.get(`/slot/generate-available-tutor-display/${tutorId}`, {
                params: {
                    durationMinutes: durationValue
                }
            });
            const groupedSlots = {};
            res.data.data.forEach(slot => {
                if (!groupedSlots[slot.dayOfWeek]) {
                    groupedSlots[slot.dayOfWeek] = [];
                }
                groupedSlots[slot.dayOfWeek].push(slot);
            });
            setApiSlotData(groupedSlots);
            setTutorData(prev => {
                const newSelectedSlots = {};
                for (const day of prev.selectedDays) {
                    if (groupedSlots[day]) {
                        newSelectedSlots[day] = prev.selectedSlots[day]
                            ?.filter(selectedSlot => groupedSlots[day]
                                .some(apiSlot => apiSlot.startTime === selectedSlot.startTime && apiSlot.endTime === selectedSlot.endTime && apiSlot.status !== 'booked' && apiSlot.status !== 'completed')) || [];
                    }
                }
                return { ...prev, selectedSlots: newSelectedSlots };
            });
        } catch (err) {
            console.error("Failed to load slots:", err);
            if (err.response?.status === 403) {
                toast.error("You do not have permission to view tutor slots.");
            } else {
                toast.error(err.response?.data?.message || "Failed to load slots. Please check tutor's availability or try again.");
            }
            setApiSlotData({});
        } finally {
            setLoading(false);
        }
    }, [tutorId, tutorData]);

    const handleDurationChange = (e) => {
        setTutorData(prev => ({
            ...prev,
            durationMinutes: e.target.value,
            selectedSlots: {}, // Reset selected slots when duration changes
            selectedDays: []   // Reset selected days when duration changes
        }));
    };

    const handleFetchSlots = () => {
        fetchSlots();
    };

    const handleDayToggle = (day) => {
        setTutorData(prev => {
            const selectedDays = prev.selectedDays.includes(day)
                ? prev.selectedDays.filter(d => d !== day)
                : [...prev.selectedDays, day];

            const newSelectedSlots = { ...prev.selectedSlots };
            if (!selectedDays.includes(day)) {
                delete newSelectedSlots[day];
            } else {
                if (!newSelectedSlots[day]) {
                    newSelectedSlots[day] = [];
                }
            }

            return {
                ...prev,
                selectedDays,
                selectedSlots: newSelectedSlots
            };
        });
    };

    const handleSlotToggle = (day, slot) => {
        if (slot.status === 'booked' || slot.status === 'completed') {
            toast.error("This slot has conflicts or is unavailable.");
            return;
        }

        setTutorData(prev => {
            const daySlots = prev.selectedSlots[day] || [];
            const isSelected = daySlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);

            const updatedSlots = isSelected
                ? daySlots.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime))
                : [...daySlots, {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    durationMinutes: parseInt(tutorData.durationMinutes.split(' ')[0]),
                    dayOfWeek: day
                }];

            return {
                ...prev,
                selectedSlots: {
                    ...prev.selectedSlots,
                    [day]: updatedSlots
                }
            };
        });
    };

    const isSlotSelected = (day, slot) => {
        const daySlots = tutorData.selectedSlots[day] || [];
        return daySlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
    };

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    const handleViewStudent = (studentId) => {
        navigate(`/student-details/${studentId}`);
    };

    if (loading) {
        return (
            <div className="container-4 loading-overlay">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-4">
                <p className="error-message">{error}</p>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            </div>
        );
    }

    if (!tutorDetails) {
        return (
            <div className="container-4">
                <p className="no-data-message">No tutor details found.</p>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            </div>
        );
    }

    return (
        <div className="container-4">
            <div className="sidebar">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
            <div className="main-content">
                <div className="header">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                    </div>
                    <div className="header-right">
                        <span className="user-name">Angelica Lima</span>
                        <div className="user-avatar">AL</div>
                    </div>
                </div>

                <div className="content-header">
                    <div>
                        <button className="archive-btn">Archive</button>
                    </div>
                    <div>
                        <button className="assign-btn" onClick={() => setShowassignstudentmodal(true)}>
                            + Assign Students
                        </button>
                    </div>
                </div>

                <div className="tutor-card">
                    <div className="tutor-header">
                        <h2 className="tutor-name">{`${tutorDetails?.firstName ?? 'N/A'} ${tutorDetails?.lastName ?? ''}`}</h2>
                        <div className="tutor-meta">
                            <span>📍 {tutorDetails?.address ?? 'N/A'}, {tutorDetails?.city ?? 'N/A'}</span>
                            <span>📧 {tutorDetails?.email ?? 'N/A'}</span>
                            <span>📞 {tutorDetails?.phoneNumber ?? 'N/A'}</span>
                            <span>⏰ {tutorDetails?.timezone ?? 'N/A'}</span>
                        </div>
                    </div>
                    <div className="tutor-actions" onClick={() => setShowAssignModal(true)}>
                        <Edit size={16} /> {/* Edit button */}
                    </div>

                    <div className="tutor-stats">
                        <div className="stat-box">
                            <span className="stat-label">Current Students Assigned</span>
                            <span className="stat-value">{tutorDetails?.totalAssignedStudents ?? 'N/A'}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Rate per hour</span>
                            <span className="stat-value">${tutorDetails?.rate ?? 'N/A'}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Total Profit - 1 Week</span>
                            <span className="stat-value">${tutorDetails?.profitOneWeek?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Total Profit - 4 Week</span>
                            <span className="stat-value">${tutorDetails?.profitFourWeeks?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Select duration and fetch available times</label>
                    <div className="duration-selector">
                        <select
                            value={tutorData.durationMinutes}
                            onChange={handleDurationChange}
                            className="duration-dropdown"
                        >
                            {DURATION_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleFetchSlots}
                            className="fetch-slots-btn"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Fetch Slots"}
                        </button>
                    </div>
                    <div className="days-container">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="day-section">
                                <div className="day-header">
                                    <label className="day-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={tutorData.selectedDays.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                            disabled={!apiSlotData[day] && !loading}
                                        />
                                        <span className="day-name">{day}</span>
                                    </label>
                                </div>

                                {tutorData.selectedDays.includes(day) && apiSlotData[day] && (
                                    <div className="slots-grid">
                                        {apiSlotData[day].map(slot => (
                                            <button
                                                key={`${day}-${slot.startTime}`}
                                                type="button"
                                                className={`slot-button ${slot.status === 'booked' ? 'booked' :
                                                    slot.status === 'completed' ? 'completed' :
                                                        isSlotSelected(day, slot) ? 'selected' : 'available'
                                                    }`}
                                                onClick={() => handleSlotToggle(day, slot)}
                                                disabled={slot.status === 'booked' || slot.status === 'completed'}
                                            >
                                                {slot.startTime}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {tutorData.selectedDays.includes(day) && !apiSlotData[day] && !loading && (
                                    <p className="no-slots-message">No slots available for this day, tutor, or duration.</p>
                                )}
                                {tutorData.selectedDays.includes(day) && loading && (
                                    <p className="loading-slots-message">Loading slots...</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="assigned-students">
                    <div className="section-header">
                        <h3>Assigned Students</h3>
                    </div>
                    <button className="reset-filter">Reset all filter</button>
                    <table className="table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-header">Student Number</th>
                                <th className="table-header">Student Name</th>
                                <th className="table-header">Start Date</th>
                                <th className="table-header">End Date</th>
                                <th className="table-header">Acc Created</th>
                                <th className="table-header">Referral Source</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(tutorDetails?.assignedStudentsDetails ?? []).map((row) => (
                                <tr key={row.id} className="table-row">
                                    <td className="table-cell">{row.studentNumber || 'N/A'}</td>
                                    <td className="table-cell tutor-name-link">
                                        {row.firstName} {row.lastName}
                                    </td>
                                    <td className="table-cell">
                                        {row.startDate ? moment(row.startDate).format('DD/MM/YYYY') : 'N/A'}
                                    </td>
                                    <td className="table-cell">
                                        {row.dischargeDate ? moment(row.dischargeDate).format('DD/MM/YYYY') : 'N/A'}
                                    </td>
                                    <td className="table-cell">{row.accountCreated ? 'Yes' : 'No'}</td>
                                    <td className="table-cell">{row.referralSource || 'N/A'}</td>
                                    <td className="table-cell">{row.status || 'N/A'}</td>
                                    <td className="table-cell">
                                        <button onClick={() => handleViewStudent(row.id)}>
                                            ℹ️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="payout-section">
                    <div className="section-header">
                        <h3>Payout History</h3>
                        <button className="reset-filter">Reset all filter</button>
                    </div>
                    <div className="table-container">
                        {tutorDetails?.payoutHistory && tutorDetails.payoutHistory.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr className="table-header-row">
                                        <th className="table-header">Payment ID</th>
                                        <th className="table-header">Student Name</th>
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
                                    {(tutorDetails?.payoutHistory ?? []).map((row) => (
                                        <tr key={row.razorpayOrderId || row.id} className="table-row">
                                            <td className="table-cell">{row.razorpayOrderId || 'N/A'}</td>
                                            <td className="table-cell tutor-name-link">{row.studentName || 'N/A'}</td>
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
                            <p>No payout history recorded for this tutor.</p>
                        )}
                    </div>
                </div>
            </div>
            {showAssignModal && (
                <TutorEdits
                    tutorId={tutorId}
                    onClose={() => setShowAssignModal(false)}
                />
            )}
            {showassignstudentmodal && (
                <AssignStudent
                    tutor={tutorDetails}
                    onClose={() => setShowassignstudentmodal(false)}
                />
            )}
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
}

export default TutorDetails;