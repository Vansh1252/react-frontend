import React, { useState } from "react";
import { Sidebar } from "../../components/sidebar";
import "../../styles/studentAdd.css";
import { axiosInstance } from "../../lib/axios";
import { useNavigate } from 'react-router-dom';




const TutorAdd = () => {
    const navigate = useNavigate();
    const [TutorData, setTutorData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        rate: ''
    })
    const [activeNav, setActiveNav] = useState('tutors')
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setTutorData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const handleCancel = () => {
        setTutorData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            country: '',
            rate: ''
        });
        navigate('/Tutor')
    }

    const handleNext = () => {
        localStorage.setItem('TutorData', JSON.stringify(TutorData))
        navigate('/Tutor/weeklyhour')
    }

    return (
        <div className="Student-add">
            <div className="sidebar">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
            <div className="form-container-2">
                <div className="from-inner-container">

                    <h1 className="form-title">Add New Tutor</h1>

                    <form className="student-form">
                        <div className="form-group">
                            <label className="form-label">First Name*</label>
                            <input
                                type="text"
                                name="firstName"
                                value={TutorData.firstName}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last name*</label>
                            <input
                                type="text"
                                name="lastName"
                                value={TutorData.lastName}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>


                        <div className="form-group">
                            <label className="form-label">Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={TutorData.email}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone number*</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={TutorData.phoneNumber}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={TutorData.address}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">City*</label>
                            <input
                                type="text"
                                name="city"
                                value={TutorData.city}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Province*</label>
                            <input
                                type="text"
                                name="province"
                                value={TutorData.province}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Postal code</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={TutorData.postalCode}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Country*</label>
                            <select
                                name="country"
                                value={TutorData.country}
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
                        <div className="form-group">
                            <label className="form-label">Rate*</label>
                            <input
                                type="text"
                                name="rate"
                                value={TutorData.rate}
                                onChange={handleInputChange}
                                className="form-input"
                            />
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

export default TutorAdd;