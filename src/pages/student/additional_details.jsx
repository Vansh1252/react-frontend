import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/sidebar';
import '../../styles/studentAdd.css';
import { axiosInstance } from '../../lib/axios'; // Import axiosInstance
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer & toast
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS
import Loader from "../../components/Loader"; // Import Loader
import { socket } from '../../lib/socket'; // Import socket

function AdditionalDetails() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('students');
    const [loading, setLoading] = useState(false);

    const [additionalData, setAdditionalData] = useState({
        startDate: '',
        dischargeDate: '',
        accountCreated: '',
        referralSource: '',
        meetingLink: ''
    });

    // Check if previous student data exists (from Step 1)
    useEffect(() => {
        const studentData = localStorage.getItem('studentData');
        if (!studentData) {
            toast.error("Student profile data missing. Redirecting to first step.");
            navigate('/student/add'); // Assuming /student/add is the first step
        }
    }, [navigate]);

    // Socket listener for 'student created successfully' event
    useEffect(() => {
        socket.on('studentcreated', (data) => {
            toast.info(`Student created: ${data.firstName} ${data.lastName}`);
        });

        return () => {
            socket.off('studentcreated');
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdditionalData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        localStorage.removeItem('studentData');
        localStorage.removeItem('completeStudentDataForPayout');
        localStorage.removeItem('currentStudentId');
        setAdditionalData({
            startDate: '',
            dischargeDate: '',
            accountCreated: '',
            referralSource: '',
            meetingLink: ''
        });
        toast.info("Student creation process cancelled.");
        navigate('/student');
    };

    const handleNext = async () => {
        if (!additionalData.startDate || !additionalData.accountCreated || !additionalData.referralSource) {
            toast.error("Please fill all required fields in Additional Details.");
            return;
        }
        if (additionalData.dischargeDate && additionalData.startDate > additionalData.dischargeDate) {
            toast.error("Discharge Date cannot be before Start Date.");
            return;
        }

        const existingData = localStorage.getItem('studentData');
        if (!existingData) {
            toast.error("Student profile data missing. Redirecting.");
            navigate('/student/add');
            return;
        }

        let baseData = {};
        try {
            baseData = JSON.parse(existingData);
        } catch (err) {
            console.error("Invalid student data in localStorage:", err);
            toast.error("Something went wrong with stored student data. Please start again.");
            localStorage.removeItem('studentData');
            navigate('/student/add');
            return;
        }

        const completeStudentDataForCreation = {
            ...baseData,
            ...additionalData,
            accountCreated: additionalData.accountCreated === 'true'
        };

        setLoading(true);

        try {
            const response = await axiosInstance.post('/student/create', completeStudentDataForCreation);

            if (response.status === 201 && response.data.studentId) {
                toast.success("Student profile created successfully!");
                const newStudentId = response.data.studentId;

                localStorage.setItem('currentStudentId', newStudentId);
                localStorage.removeItem('studentData');

                navigate(`/student/assign-tutor/${newStudentId}`);
            } else {
                toast.error(response.data.message || "Failed to create student profile.");
            }
        } catch (error) {
            console.error('Error creating student profile:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "An unexpected error occurred during student creation.");
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = () => {
        const fields = Object.values(additionalData);
        const filledFields = fields.filter(field => field !== '').length;
        return Math.round((filledFields / 5) * 100);
    };

    return (
        <div className="Student-add">
            {loading && <Loader />}
            <div className="sidebar">
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>

            <div className='main-content'>
                <div className="content-header">
                    <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress" style={{ width: `${calculateProgress()}%` }}></div>
                            <span>{calculateProgress()}% completed</span>
                        </div>
                    </div>
                </div>

                <div className="form-container-2">
                    <div className="from-inner-container">
                        <h1 className="form-title">Additional Details</h1>
                        <form className="student-form">
                            <div className="form-group">
                                <label className="form-label">Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={additionalData.startDate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Discharge Date</label>
                                <input
                                    type="date"
                                    name="dischargeDate"
                                    value={additionalData.dischargeDate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Account Created</label>
                                <select
                                    name="accountCreated"
                                    value={additionalData.accountCreated}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Referral Source *</label>
                                <select
                                    name="referralSource"
                                    value={additionalData.referralSource}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select</option>
                                    <option value="Direct">Direct</option>
                                    <option value="Website">Website</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Advertisement">Advertisement</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Meeting Link</label>
                                <textarea
                                    name="meetingLink"
                                    value={additionalData.meetingLink}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    rows="4"
                                    placeholder="Enter meeting link..."
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
                                    disabled={loading}
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${calculateProgress()}%` }}></div>
                        <span>{calculateProgress()}% completed</span>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
}

export default AdditionalDetails;
