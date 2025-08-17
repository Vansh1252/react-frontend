import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../lib/axios";
import "../../styles/assign-tutor.css";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function AssignStudent({ tutor, onClose }) {
    const navigate = useNavigate();
    const [tutorData, setTutorData] = useState({
        tutorId: tutor?.tutorId || '', // Pre-select tutorId from prop
        studentId: '', // Student to assign tutor to
        timezone: '',
        durationMinutes: '', // Stored as a string like "30 Min", parsed to "30" for API
        selectedDays: [], // ['Monday', 'Tuesday']
        selectedSlots: {}, // { Monday: [{startTime: '16:30', endTime: '17:00', durationMinutes: 30, dayOfWeek: 'Monday'}, ...], Tuesday: [...] }
    });
    const [students, setStudents] = useState([]); // List of students
    const [loading, setLoading] = useState(false);
    const [apiSlotData, setApiSlotData] = useState({});
    const { tutorId } = useParams();

    // Load students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get("/student/master");
                setStudents(res.data.data);
            } catch (err) {
                console.error("Failed to load students:", err);
                toast.error("Failed to load students.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const fetchSlots = useCallback(async () => {
        const { studentId, durationMinutes } = tutorData;

        if (!studentId || !durationMinutes) {
            setApiSlotData({});
            return;
        }

        try {
            setLoading(true);
            const durationValue = parseInt(durationMinutes.split(' ')[0]);
            // API call: GET /slot/generate-available/:studentId with tutorId as param
            const res = await axiosInstance.get(`/slot/generate-available/${studentId}`, {
                params: {
                    tutorId: tutorId,
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
            toast.error(err.response?.data?.message || "Failed to load slots. Please check student's availability or try again.");
            setApiSlotData({});
        } finally {
            setLoading(false);
        }
    }, [tutorData.studentId, tutorData.durationMinutes, tutorData.tutorId]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const timezones = [
        '(UTC-8:00) Pacific Time',
        '(UTC-5:00) Eastern Time',
        '(UTC+0:00) GMT',
        '(UTC+5:30) India Standard Time'
    ];

    const durationMinutess = [
        '25 Min',
        '30 Min',
        '45 Min',
        '60 Min',
        '90 Min'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTutorData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const handleNext = async () => {
        if (!tutorId || !tutorData.studentId || !tutorData.timezone || !tutorData.durationMinutes) {
            toast.error("Please select a student, tutor, timezone, and session duration.");
            return;
        }

        const selectedSlotPatterns = [];
        for (const day of DAYS_OF_WEEK) {
            if (tutorData.selectedSlots[day] && tutorData.selectedSlots[day].length > 0) {
                selectedSlotPatterns.push(...tutorData.selectedSlots[day]);
            }
        }

        if (selectedSlotPatterns.length === 0) {
            toast.error("Please select at least one available time slot.");
            return;
        }

        setLoading(true);
        const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!scriptLoaded) {
            toast.error("Razorpay SDK failed to load. Please check your internet connection.");
            setLoading(false);
            return;
        }

        try {
            const orderRes = await axiosInstance.post('/slot/create-razorpay-order', {
                tutorId: tutorId,
                studentId: tutorData.studentId,
                selectedRecurringPatterns: selectedSlotPatterns,
            });

            const { orderId, amount, currency } = orderRes.data.data;
            const options = {
                key: import.meta.env.VITE_API_RAZORPAY_KEY_ID,
                amount: amount * 100,
                currency: currency,
                name: 'Viva Phonics',
                description: 'Student Slot Booking',
                order_id: orderId,
                handler: async (response) => {
                    try {
                        setLoading(true);
                        const initialPaymentForBooking = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount,
                            transactionFee: Math.round(amount * 0.02),
                            tutorPayout: amount - Math.round(amount * 0.02) - Math.round(amount * 0.3),
                        };

                        const completeDataForPayout = {
                            assignedTutor: tutorId,
                            studentId: tutorData.studentId,
                            timezone: tutorData.timezone,
                            sessionDuration: parseInt(tutorData.durationMinutes.split(' ')[0]),
                            selectedRecurringPatterns: selectedSlotPatterns,
                            initialPaymentForBooking: initialPaymentForBooking,
                        };

                        localStorage.setItem('currentStudentId', tutorData.studentId);
                        localStorage.setItem('completeStudentDataForPayout', JSON.stringify(completeDataForPayout));
                        localStorage.removeItem('studentData');

                        navigate('/student/payout');
                    } catch (submitError) {
                        console.error('Error during payment processing callback:', submitError.response?.data || submitError.message);
                        toast.error(submitError.response?.data?.message || "Error processing payment. Please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                notes: {
                    'tutor_id': tutorData.tutorId,
                    'student_id': tutorData.studentId,
                    'total_amount_calculated': amount
                },
                theme: { "color": "#3399CC" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('razorpay_payment_failed', (response) => {
                console.error('Razorpay payment failed:', response.error);
                toast.error(response.error?.description || "Payment failed. Please try again.");
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Error initiating Razorpay order:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const tutorname = `${tutor.firstName} ${tutor.lastName}`;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h1 className="form-title">Assign Tutor to Student</h1>
                <form className="student-form">
                    <div className="form-group">
                        <label className="form-label">Tutor assigned *</label>
                        <input type="text" name="tutorName" value={tutorname} readOnly />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Student *</label>
                        <select
                            name="studentId"
                            value={tutorData.studentId}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Select Student</option>
                            {students.map(student => (
                                <option key={student._id} value={student._id}>
                                    {`${student.str_firstName} ${student.str_lastName}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {tutorData.studentId && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Time zone *</label>
                                <select
                                    name="timezone"
                                    value={tutorData.timezone}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select timezone</option>
                                    {timezones.map(timezone => (
                                        <option key={timezone} value={timezone}>{timezone}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Session duration *</label>
                                <select
                                    name="durationMinutes"
                                    value={tutorData.durationMinutes}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select duration</option>
                                    {durationMinutess.map(duration => (
                                        <option key={duration} value={duration}>{duration}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select available time</label>
                                <div className="days-container">
                                    {DAYS_OF_WEEK.map(day => (
                                        <div key={day} className="day-section">
                                            <div className="day-header">
                                                <label className="day-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={tutorData.selectedDays.includes(day)}
                                                        onChange={() => handleDayToggle(day)}
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
                                                <p className="no-slots-message">No slots available for this day, student, or duration.</p>
                                            )}
                                            {tutorData.selectedDays.includes(day) && loading && (
                                                <p className="loading-slots-message">Loading slots...</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-actions">
                        <button onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-next"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            Assign Tutor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}