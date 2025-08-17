import React, { useState, useEffect } from "react";
import '../../styles/student-edit.css';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import Loader from "../../components/Loader";

const EditAdditionalDetails = ({ onClose }) => {
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
        // additional fields we show
        startDate: '',
        dischargeDate: '',
        accountCreated: '',
        referralSource: '',
        // hidden fields
        meetingLink: '',
        status: '',
        assignedTutor: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const res = await axiosInstance.get(`student/details/${studentId}`);
                const data = res.data.data;

                setStudentData(prev => ({
                    ...prev,
                    ...data,
                    startDate: data.startDate ? data.startDate.split('T')[0] : '',
                    dischargeDate: data.dischargeDate ? data.dischargeDate.split('T')[0] : ''
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

    const handleSubmit = async () => {
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
                <h1 className="form-title">Edit Additional Details</h1>
                <form className="student-form">

                    {/* Start Date */}
                    <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={studentData.startDate || ""}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {/* Discharge Date */}
                    <div className="form-group">
                        <label className="form-label">Discharge Date</label>
                        <input
                            type="date"
                            name="dischargeDate"
                            value={studentData.dischargeDate || ""}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {/* Account Created */}
                    <div className="form-group">
                        <label className="form-label">Account Created</label>
                        <input
                            type="text"
                            name="accountCreated"
                            value={studentData.accountCreated || ""}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {/* Referral Source */}
                    <div className="form-group">
                        <label className="form-label">Referral Source</label>
                        <input
                            type="text"
                            name="referralSource"
                            value={studentData.referralSource || ""}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

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
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAdditionalDetails;
