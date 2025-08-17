import { useState } from "react";
import '../../styles/tutorWeeklyhour.css';
import { Sidebar } from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const TutorWeeklyhour = () => {
    const [timezone, setTimezone] = useState("(+UTC 8:00) Pacific Time");
    const [schedules, setSchedules] = useState([
        { day: "sunday", enabled: false, slots: [] },
        { day: "monday", enabled: false, slots: [] },
        { day: "tuesday", enabled: false, slots: [] },
        { day: "wednesday", enabled: false, slots: [] },
        { day: "thursday", enabled: false, slots: [] },
        { day: "friday", enabled: false, slots: [] },
        { day: "saturday", enabled: false, slots: [] },
    ]);
    const [copyTargetDay, setCopyTargetDay] = useState("");

    const toggleDay = (dayIndex) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].enabled = !newSchedules[dayIndex].enabled;
        if (!newSchedules[dayIndex].enabled) {
            newSchedules[dayIndex].slots = [];
        }
        setSchedules(newSchedules);
    };

    const addTimeSlot = (dayIndex) => {
        const newSchedules = [...schedules];
        const newSlot = {};
        newSchedules[dayIndex].slots.push(newSlot);
        setSchedules(newSchedules);
    };

    const removeTimeSlot = (dayIndex, slotId) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].slots = newSchedules[dayIndex].slots.filter(slot => slot.id !== slotId);
        setSchedules(newSchedules);
    };

    const updateTimeSlot = (dayIndex, slotId, field, value) => {
        const newSchedules = [...schedules];
        const slotIndex = newSchedules[dayIndex].slots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
            newSchedules[dayIndex].slots[slotIndex][field] = value;
            setSchedules(newSchedules);
        }
    };

    const copyTimesToDay = (targetDay) => {
        const sourceDay = schedules.find(s => s.enabled && s.slots.length > 0);
        if (!sourceDay) return;

        const newSchedules = [...schedules];
        const targetIndex = newSchedules.findIndex(s => s.day === targetDay);
        if (targetIndex !== -1) {
            newSchedules[targetIndex].enabled = true;
            newSchedules[targetIndex].slots = sourceDay.slots.map(slot => ({
                ...slot,
                id: Date.now().toString() + Math.random()
            }));
            setSchedules(newSchedules);
        }
    };
    const handleCancel = () => {
        setStudentData({
            studentNumber: '',
            firstName: '',
            lastName: '',
            familyName: '',
            grade: '',
            year: '',
            email: '',
            phoneNumber: '',
            address: '',
            city: '',
            state: '',
            country: ''
        })
    }
    const navigate = useNavigate(); // ← ADD THIS LINE
    const handleSubmit = async () => {
        const profileData = JSON.parse(localStorage.getItem("TutorData"));

        if (!profileData) {
            alert("Missing data from first page.");
            return;
        }

        // ✅ Filter only enabled days with slots
        const selectedSchedules = schedules
            .filter(day => day.enabled && day.slots.length > 0)
            .map(day => ({
                ...day,
                slots: day.slots.filter(slot => slot.start && slot.end) // optional: ensure valid slots only
            }));

        const payload = {
            ...profileData,
            timezone,
            weeklyHours: selectedSchedules, // 👈 only selected days
        };

        const response = await axiosInstance.post("/tutor/create", payload);

        if (response.status === 200 || response.status === 201) {
            toast.success("Tutor created successfully");
            localStorage.removeItem("TutorData");
            navigate(`/tutor/details/${response.data.data._id}`);
        } else {
            toast.error(submitError.response?.data?.message || "Error processing payment. Please contact support.");
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <div className="header">
                    <div>
                        <button className="back-button" onClick={() => navigate('/tutor/add')}>
                            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Back
                        </button>
                    </div>
                    <div className="user-info">
                        <div className="user-avatar">A</div>
                        <span className="user-name">Angelica Lima</span>
                    </div>
                </div>

                {/* Content */}
                <div className="content">
                    {/* Progress Section */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">Weekly Hours Available</span>
                            <span className="progress-value">55%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>

                    {/* Form */}
                    <div>
                        {/* Timezone */}
                        <div className="form-section">
                            <label className="form-label">
                                Time zone *
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="form-select"
                            >
                                <option value="(+UTC 8:00) Pacific Time">(+UTC 8:00) Pacific Time</option>
                            </select>
                        </div>

                        {/* Weekly Hours */}
                        <div className="schedule-section">
                            <label className="schedule-label">
                                Weekly hours *
                            </label>

                            <div>
                                {schedules.map((schedule, dayIndex) => (
                                    <div key={schedule.day} className="day-row">
                                        {/* Checkbox and Day */}
                                        <div className="day-checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={schedule.enabled}
                                                onChange={() => toggleDay(dayIndex)}
                                                className="day-checkbox"
                                            />
                                            <span className="day-name">
                                                {schedule.day}
                                            </span>
                                        </div>

                                        {/* Time Slots or Unavailable */}
                                        <div className="time-slots">
                                            {!schedule.enabled ? (
                                                <span className="unavailable">Unavailable</span>
                                            ) : (
                                                <>
                                                    {schedule.enabled ? (
                                                        <div className="enabled-slots">
                                                            {schedule.slots.length === 0 ? (
                                                                <span className="unavailable">No time slots added yet</span>
                                                            ) : (
                                                                schedule.slots.map((slot, slotIndex) => (
                                                                    <div key={slot.id} className="time-slot">
                                                                        {slotIndex > 0 && <span className="time-separator">,</span>}
                                                                        <input
                                                                            type="time"
                                                                            value={slot.start}
                                                                            onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'start', e.target.value)}
                                                                            className="time-input"
                                                                        />
                                                                        <span className="time-separator">-</span>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.end}
                                                                            onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'end', e.target.value)}
                                                                            className="time-input"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeTimeSlot(dayIndex, slot.id)}
                                                                            className="icon-button remove-button"
                                                                        >
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                                <path d="M18 6L6 18M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="unavailable">Unavailable</span>
                                                    )}
                                                    <button
                                                        onClick={() => addTimeSlot(dayIndex)}
                                                        className="icon-button add-button"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M12 5v14M5 12h14" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Copy Button */}
                                        <button className="icon-button copy-button">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Copy Times Section */}
                            <div className="copy-section">
                                <label className="copy-label">COPY TIMES TO</label>
                                <select
                                    className="copy-select"
                                    value={copyTargetDay}
                                    onChange={(e) => setCopyTargetDay(e.target.value)}
                                >
                                    <option value="">Select day ▼</option>
                                    <option value="sunday">Sunday</option>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                </select>
                                <button
                                    className="apply-button"
                                    onClick={() => {
                                        if (copyTargetDay) {
                                            copyTimesToDay(copyTargetDay);
                                            toast.success(`Time slots copied to ${copyTargetDay}`);
                                        } else {
                                            toast.error("Please select a day to copy to.");
                                        }
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="submit-button" onClick={handleSubmit}>
                                Submit Profile
                            </button>
                        </div>
                    </div>
                </div>
                <ToastContainer position="top-center" autoClose={2000} limit={1} />
            </div>
        </div >
    );
};

export default TutorWeeklyhour;