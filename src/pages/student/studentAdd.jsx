import React, { useState } from "react";
import { Sidebar } from "../../components/sidebar";
import "../../styles/studentAdd.css";
import { axiosInstance } from "../../lib/axios";
import { useNavigate } from 'react-router-dom';




const StudentAdd = () => {
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
        country: ''
    });

    const [activeNav, setActiveNav] = useState('tutors')

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setStudentData(prev => ({
            ...prev,
            [name]: value
        }))
    }

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

    const handleNext = () => {
        // Store the student data in localStorage to pass to next page
        localStorage.setItem('studentData', JSON.stringify(studentData))
        navigate('/student/additional-details')
    }

    const calculateProgress = () => {
        const fields = Object.values(studentData)
        const filledFields = fields.filter(field => field.trim() !== '').length
        return Math.round((filledFields / fields.length) * 100)
    }

    return (
        <div className="Student-add">
            <div className="sidebar">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
            <div className="form-container-2">
                <div className="from-inner-container">

                    <h1 className="form-title">Add New Student</h1>

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
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-next"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default StudentAdd;