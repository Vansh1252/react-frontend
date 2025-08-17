import React, { useState, useEffect } from "react";
import '../../styles/edit-tutor.css'; // Update to tutor-edit.css if needed
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import Loader from "../../components/Loader";

const TutorEdits = ({ onClose }) => {
    const navigate = useNavigate();
    const { tutorId } = useParams();

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const [tutorData, setTutorData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        rate: '',
        timeZone: '',
        availability: days.reduce((acc, day) => ({ ...acc, [day]: { isAvailable: false, slots: [] } }), {}),
        // hidden fields
        startDate: '',
        dischargeDate: '',
        meetingLink: '',
        status: '',
        assignedTutor: ''
    });
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    // Fetch tutor details on mount
    useEffect(() => {
        const fetchTutorDetails = async () => {
            try {
                const res = await axiosInstance.get(`tutor/details/${tutorId}`);
                const data = res.data.data;

                const dayMap = {
                    'sunday': 'sun',
                    'monday': 'mon',
                    'tuesday': 'tue',
                    'wednesday': 'wed',
                    'thursday': 'thu',
                    'friday': 'fri',
                    'saturday': 'sat'
                };

                const mappedAvailability = days.reduce((acc, day) => ({ ...acc, [day]: { isAvailable: false, slots: [] } }), {});

                if (data.weeklyHours) {
                    data.weeklyHours.forEach(wh => {
                        const shortDay = dayMap[wh.str_day.toLowerCase()];
                        if (shortDay) {
                            mappedAvailability[shortDay] = {
                                isAvailable: wh.arr_slots.length > 0,
                                slots: wh.arr_slots.map(s => ({ start: s.str_start, end: s.str_end }))
                            };
                        }
                    });
                }

                // Assume API returns availability and timeZone; adjust if needed
                setTutorData(prev => ({
                    ...prev,
                    ...data,
                    province: data.province || data.state || '', // Compatibility if state is used
                    timeZone: data.timezone || '',
                    availability: mappedAvailability
                }));
            } catch (error) {
                console.error("Error fetching tutor details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTutorDetails();
    }, [tutorId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTutorData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleAvailability = (day) => {
        setTutorData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    isAvailable: !prev.availability[day].isAvailable
                }
            }
        }));
    };

    const addSlot = (day) => {
        setTutorData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    slots: [...prev.availability[day].slots, { start: '09:00', end: '13:00' }]
                }
            }
        }));
    };

    const removeSlot = (day, index) => {
        setTutorData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    slots: prev.availability[day].slots.filter((_, i) => i !== index)
                }
            }
        }));
    };

    const handleSlotChange = (day, index, field, value) => {
        setTutorData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    slots: prev.availability[day].slots.map((slot, i) =>
                        i === index ? { ...slot, [field]: value } : slot
                    )
                }
            }
        }));
    };

    const handleSave = async () => {
        try {
            const payload = { ...tutorData };
            payload.timezone = tutorData.timeZone;
            payload.weeklyHours = [];

            const reverseDayMap = {
                sun: 'sunday',
                mon: 'monday',
                tue: 'tuesday',
                wed: 'wednesday',
                thu: 'thursday',
                fri: 'friday',
                sat: 'saturday'
            };

            for (const [shortDay, avail] of Object.entries(tutorData.availability)) {
                if (avail.isAvailable && avail.slots.length > 0) {
                    const fullDay = reverseDayMap[shortDay];
                    const slots = avail.slots.map(slot => ({
                        start: slot.start,
                        end: slot.end
                    }));
                    payload.weeklyHours.push({
                        day: fullDay,
                        slots
                    });
                }
            }

            await axiosInstance.put(`tutor/update/${tutorId}`, payload);
            navigate('/tutor');
        } catch (error) {
            console.error("Error updating tutor:", error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="student-edit"> {/* Update class to tutor-edit if styles differ */}
            <div className="student-edit-form">
                {step === 1 ? (
                    <>
                        <h1 className="form-title">Edit Tutor Profile</h1>
                        <form className="student-form">
                            <div className="form-group">
                                <label className="form-label">First name*</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={tutorData.firstName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last name*</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={tutorData.lastName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={tutorData.email}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone number*</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={tutorData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={tutorData.address}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City*</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={tutorData.city}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Province*</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={tutorData.province}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Postal code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={tutorData.postalCode}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <select
                                    name="country"
                                    value={tutorData.country}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="Canada">Canada</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rate*</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={tutorData.rate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                                <span> Per hour</span>
                            </div>
                        </form>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-next"
                                onClick={() => setStep(2)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="form-title">Edit Tutor Availability</h1>
                        <form className="student-form">
                            <div className="form-group">
                                <label className="form-label">Time zone*</label>
                                <input
                                    type="text"
                                    name="timeZone"
                                    value={tutorData.timeZone}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weekly hours*</label>
                                {days.map((day) => (
                                    <div key={day} style={{ marginBottom: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={tutorData.availability[day].isAvailable}
                                            onChange={() => toggleAvailability(day)}
                                        />
                                        <span style={{ marginLeft: '5px', textTransform: 'capitalize' }}>{day}</span>
                                        {tutorData.availability[day].isAvailable ? (
                                            <div style={{ marginLeft: '20px' }}>
                                                {tutorData.availability[day].slots.map((slot, index) => (
                                                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                        <input
                                                            type="time"
                                                            value={slot.start}
                                                            onChange={(e) => handleSlotChange(day, index, 'start', e.target.value)}
                                                            style={{ marginRight: '5px' }}
                                                        />
                                                        -
                                                        <input
                                                            type="time"
                                                            value={slot.end}
                                                            onChange={(e) => handleSlotChange(day, index, 'end', e.target.value)}
                                                            style={{ marginLeft: '5px', marginRight: '5px' }}
                                                        />
                                                        <button type="button" onClick={() => removeSlot(day, index)}>x</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addSlot(day)}>+</button>
                                            </div>
                                        ) : (
                                            <span style={{ marginLeft: '10px' }}>Unavailable</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </form>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="btn btn-next"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TutorEdits;