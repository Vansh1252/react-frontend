import React, { useState, useEffect } from "react";
import '../../styles/student-edit.css';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import Loader from "../../components/Loader";

const StudentEdits = ({ onClose }) => {
    const navigate = useNavigate();
    const { studentId } = useParams();

    const [studentData, setStudentData] = useState({
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
        country: '',
        // hidden fields
        startDate: '',
        dischargeDate: '',
        meetingLink: '',
        status: '',
        assignedTutor: ''
    });
    const [loading, setLoading] = useState(true);

    // Fetch student details on mount
    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const res = await axiosInstance.get(`student/details/${studentId}`);
                setStudentData(prev => ({
                    ...prev,
                    ...res.data.data // this will include hidden fields too
                }));
            } catch (error) {
                console.error("Error fetching student details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentDetails();
    }, [studentId]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleNext = async () => {
        try {
            await axiosInstance.put(`student/update/${studentId}`, studentData);
            navigate('/student');
        } catch (error) {
            console.error("Error updating student:", error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="student-edit">
            <div className="student-edit-form">
                <h1 className="form-title">Edit Student</h1>
                <form className="student-form">
                    <div className="form-group">
                        <label className="form-label">Assign student number*</label>
                        <input
                            type="text"
                            name="studentNumber"
                            value={studentData.studentNumber}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">First Name*</label>
                        <input
                            type="text"
                            name="firstName"
                            value={studentData.firstName}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Last name*</label>
                        <input
                            type="text"
                            name="lastName"
                            value={studentData.lastName}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Family name*</label>
                        <input
                            type="text"
                            name="familyName"
                            value={studentData.familyName}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Grade*</label>
                        <input
                            type="text"
                            name="grade"
                            value={studentData.grade}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year*</label>
                        <input
                            type="text"
                            name="year"
                            value={studentData.year}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email*</label>
                        <input
                            type="email"
                            name="email"
                            value={studentData.email}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone number*</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={studentData.phoneNumber}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={studentData.address}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">City*</label>
                        <input
                            type="text"
                            name="city"
                            value={studentData.city}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">State*</label>
                        <input
                            type="text"
                            name="state"
                            value={studentData.state}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Country*</label>
                        <select
                            name="country"
                            value={studentData.country}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="Direct">Direct</option>
                            <option value="Canada">Canada</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onClose} // just close modal
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-next"
                            onClick={handleNext}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentEdits;
