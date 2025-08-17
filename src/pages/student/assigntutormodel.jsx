import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../lib/axios";
import "../../styles/assign-tutor.css";
import { useNavigate } from 'react-router-dom';
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

export default function AssignTutorModal({ studentId, onClose }) {
    const navigate = useNavigate();
    const [tutorData, setTutorData] = useState({
        tutorId: '',
        timezone: '',
        durationMinutes: '', // Stored as a string like "30 Min", need to parse to "30" for API
        selectedDays: [], // ['Monday', 'Tuesday']
        selectedSlots: {}, // { Monday: [{time: '16:30', endTime: '17:00', durationMinutes: 30, dayOfWeek: 'Monday'}, ...], Tuesday: [...] }
    });
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiSlotData, setApiSlotData] = useState({});

    // Load tutors
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                setLoading(true);
                // CORRECTED: Change to GET request
                const res = await axiosInstance.get("/tutor/master");
                setTutors(res.data.data);
            } catch (err) {
                console.error("Failed to load tutors:", err);
                toast.error("Failed to load tutors.");
            } finally {
                setLoading(false);
            }
        };
        fetchTutors();
    }, []);

    const fetchSlots = useCallback(async () => {
        const { tutorId, durationMinutes } = tutorData;

        if (!tutorId || !durationMinutes) {
            setApiSlotData({}); // Clear previous slots if conditions not met
            return;
        }

        try {
            setLoading(true);
            const durationValue = parseInt(durationMinutes.split(' ')[0]);
            // API call: GET /api/v1/slots/generate-available-for-display/:tutorId
            const res = await axiosInstance.get(`slot/generate-available/${studentId}`, {
                params: {
                    tutorId,
                    durationMinutes: durationValue
                }
            });
            const groupedSlots = {};
            console.log(res.data.data)
            res.data.data.forEach(slot => {
                if (!groupedSlots[slot.dayOfWeek]) {
                    groupedSlots[slot.dayOfWeek] = [];
                }
                groupedSlots[slot.dayOfWeek].push(slot);
            });
            console.log("groupedSlots", groupedSlots)
            setApiSlotData(groupedSlots);
            // Re-evaluate selectedSlots based on new API data.
            setTutorData(prev => {
                const newSelectedSlots = {};
                for (const day of prev.selectedDays) {
                    if (groupedSlots[day]) {
                        newSelectedSlots[day] = prev.selectedSlots[day]
                            .filter(selectedSlot => groupedSlots[day]
                                .some(apiSlot => apiSlot.startTime === selectedSlot.startTime && apiSlot.endTime === selectedSlot.endTime && apiSlot.status !== 'booked' && apiSlot.status !== 'completed')); // Filter out completed too
                    }
                }
                console.log(newSelectedSlots)
                return { ...prev, selectedSlots: newSelectedSlots };
            });

        } catch (err) {
            console.error("Failed to load slots:", err);
            toast.error(err.response?.data?.message || "Failed to load slots. Please check tutor's availability or try again.");
            setApiSlotData({});
        } finally {
            setLoading(false);
        }
    }, [tutorData.tutorId, tutorData.durationMinutes]);

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
        // Prevent selection of booked/unavailable slots
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

    // --- RAZORPAY INTEGRATION IN handleNext (MODIFIED FOR /payout REDIRECTION) ---
    const handleNext = async () => {
        // 1. Frontend validation
        if (!tutorData.tutorId || !tutorData.timezone || !tutorData.durationMinutes) {
            toast.error("Please select a tutor, timezone, and session duration.");
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

        // Ensure Razorpay script is loaded
        setLoading(true);
        const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!scriptLoaded) {
            toast.error("Razorpay SDK failed to load. Please check your internet connection.");
            setLoading(false);
            return;
        }

        console.log(import.meta.env.VITE_API_RAZORPAY_KEY_ID);
        try {
            // 3. Call backend to create Razorpay Order
            // CORRECTED: Send actual booking details to backend for amount calculation
            const orderRes = await axiosInstance.post('/slot/create-razorpay-order', {
                tutorId: tutorData.tutorId,
                studentId: studentId, // Use actual student ID from DB or studentNumber if it's the only ID
                selectedRecurringPatterns: selectedSlotPatterns,
            });

            // Extract orderId and calculated amount from backend response
            const { orderId, amount, currency } = orderRes.data.data;
            // 4. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_API_RAZORPAY_KEY_ID, // Your Razorpay Key ID from .env
                amount: amount * 100, // Use amount from backend response (in paisa/cents)
                currency: currency,   // Use currency from backend response
                name: 'Viva Phonics',
                description: 'Student Slot Booking',
                order_id: orderId,
                handler: async (response) => {
                    // This function is called on successful payment
                    try {
                        setLoading(true);
                        // The backend calculated profit/fees. Frontend only passes necessary Razorpay IDs.
                        const initialPaymentForBooking = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount, // Total amount from backend's calculation
                            transactionFee: Math.round(amount * 0.02), // Re-calculate or fetch from backend notes
                            tutorPayout: amount - Math.round(amount * 0.02) - Math.round(amount * 0.3), // Re-calculate or fetch from backend notes
                        };

                        // Complete data for final student creation API call
                        const completeDataForPayout = {
                            assignedTutor: tutorData.tutorId,
                            timezone: tutorData.timezone,
                            sessionDuration: parseInt(tutorData.durationMinutes.split(' ')[0]),
                            selectedRecurringPatterns: selectedSlotPatterns,
                            initialPaymentForBooking: initialPaymentForBooking, // Contains Razorpay response + calculated fees
                        };

                        // Store data in localStorage for the /payout page to retrieve
                        localStorage.setItem('currentStudentId', studentId);
                        localStorage.setItem('completeStudentDataForPayout', JSON.stringify(completeDataForPayout));
                        localStorage.removeItem('studentData'); // Clear previous partial studentData

                        // Navigate to the /payout page
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
                    'total_amount_calculated': amount // Pass calculated amount to notes for backend verification
                },
                theme: {
                    "color": "#3399CC"
                }
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
            // Loading is managed by rzp handler callbacks
        }
    };
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h1 className="form-title">Assign Tutor and allot Time</h1>
                <form className="student-form">
                    <div className="form-group">
                        <label className="form-label">Tutor assigned</label>
                        <select
                            name="tutorId"
                            value={tutorData.tutorId}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Select Tutor (Optional)</option>
                            {tutors.map(tutor => (
                                <option key={tutor._id} value={tutor._id}>
                                    {`${tutor.tutorName}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {tutorData.tutorId && (
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
                                    {DAYS_OF_WEEK.map(day => ( // Use DAYS_OF_WEEK for consistency
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

                                            {tutorData.selectedDays.includes(day) && apiSlotData[day] && ( // Check if apiSlotData has data for the day
                                                <div className="slots-grid">
                                                    {apiSlotData[day].map(slot => ( // Map through fetched apiSlotData
                                                        <button
                                                            key={`${day}-${slot.startTime}`} // Unique key
                                                            type="button"
                                                            className={`slot-button ${slot.status === 'booked' ? 'booked' : // booked by anyone
                                                                slot.status === 'completed' ? 'completed' : // past slots
                                                                    isSlotSelected(day, slot) ? 'selected' : 'available' // selected by user or truly available
                                                                }`}
                                                            onClick={() => handleSlotToggle(day, slot)}
                                                            disabled={slot.status === 'booked' || slot.status === 'completed'} // Disable if already booked or completed
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
