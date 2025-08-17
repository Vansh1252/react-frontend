import { useState, useEffect } from 'react';
import '../../styles/payout.css';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../../lib/axios";
import { Sidebar } from '../../components/sidebar';
import { ToastContainer, toast } from 'react-toastify';
import Loader from '../../components/Loader';

const Payout = () => {
    const navigate = useNavigate();

    const [completeStudentData, setCompleteStudentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeNav, setActiveNav] = useState('students');

    const [displayFormData, setDisplayFormData] = useState({
        paypal: '',
        stripe: '',
        transactionFee: '0.00',
        totalAmount: '0.00',
        tutorPayout: '0.00',
        profit1Week: '0.00',
        profit4Week: '0.00'
    });

    useEffect(() => {
        const storedData = localStorage.getItem('completeStudentDataForPayout');
        const currentStudentId = localStorage.getItem('currentStudentId');

        if (storedData && currentStudentId) {
            const parsedData = JSON.parse(storedData);
            setCompleteStudentData(parsedData);

            const paymentDetails = parsedData.initialPaymentForBooking;

            if (paymentDetails) {
                const amount = paymentDetails.amount || 0;
                const transactionFee = paymentDetails.transactionFee || 0;
                const tutorPayout = paymentDetails.tutorPayout || 0;

                const netAmountReceivedByPlatform = amount - transactionFee;
                const platformProfit = netAmountReceivedByPlatform - tutorPayout;

                setDisplayFormData({
                    paypal: paymentDetails.razorpay_payment_id || 'N/A',
                    stripe: '',
                    transactionFee: transactionFee.toFixed(2),
                    totalAmount: netAmountReceivedByPlatform.toFixed(2),
                    tutorPayout: tutorPayout.toFixed(2),
                    profit1Week: platformProfit.toFixed(2),
                    profit4Week: platformProfit.toFixed(2)
                });
            } else {
                toast.warn("No payment details found. Student may be created without immediate payment.");
            }
        } else {
            toast.error("Student creation data or ID missing. Please start student creation from the beginning.");
            // localStorage.removeItem('completeStudentDataForPayout');
            // localStorage.removeItem('studentData');
            // localStorage.removeItem('currentStudentId');
            // navigate('/student');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDisplayFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!completeStudentData) {
            toast.error("No data to submit. Please return to the previous page.");
            return;
        }

        const studentId = localStorage.getItem('currentStudentId');
        if (!studentId) {
            toast.error("Student ID missing. Cannot complete creation.");
            return;
        }

        // --- CRITICAL CHANGE HERE: Constructing the trimmed payload ---
        const payloadForBackend = {
            tutorId: completeStudentData.assignedTutor,
            timezone: completeStudentData.timezone, // Needed by backend service for slot context
            sessionDuration: completeStudentData.sessionDuration, // Needed by backend service for slot context
            selectedRecurringPatterns: completeStudentData.selectedRecurringPatterns,
            initialPaymentForBooking: completeStudentData.initialPaymentForBooking,
        };
        // Ensure assignedTutor is not null if patterns are selected
        if (!payloadForBackend.tutorId && payloadForBackend.selectedRecurringPatterns.length > 0) {
            toast.error("Cannot book slots without an assigned tutor.");
            return;
        }


        setLoading(true);
        try {
            // Call the NEW API for assigning tutor, booking slots, and processing payment
            // This is POST /api/v1/students/:studentId/assign-tutor-with-slots
            const response = await axiosInstance.post(`/student/assign-tutor/${studentId}`, payloadForBackend);

            if (response.status === 200) {
                toast.success("Student assigned and slots booked successfully!");
                localStorage.removeItem('completeStudentDataForPayout');
                localStorage.removeItem('studentData');
                localStorage.removeItem('currentStudentId');
                navigate(`/student-details/${studentId}`); // Redirect to the student's detail page
            } else {
                toast.error(response.data.message || "Failed to complete student assignment.");
            }
        } catch (error) {
            console.error('Error completing student assignment:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "An unexpected error occurred during final submission.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        localStorage.removeItem('completeStudentDataForPayout');
        localStorage.removeItem('studentData');
        localStorage.removeItem('currentStudentId');
        toast.info("Student creation cancelled.");
        navigate('/student');
    };

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    return (
        <div className="student-payout">
            <div className='sidebar'>
                <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
            </div>
            <div className="main-content">
                <div className="content-header">
                    <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                </div>

                <div className="form-container-2">
                    <div className="from-inner-container">
                        <h1 className="form-title">Payout Summary</h1>
                        <form className="student-form">
                            <div className="form-group">
                                <label>Payment Method</label>
                                <input type="text" name="paypal" value="Razorpay" readOnly className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Razorpay Payment ID</label>
                                <input type="text" name="razorpayPaymentId" value={displayFormData.paypal} readOnly className="form-input" placeholder="N/A" />
                            </div>
                            <div className="form-group">
                                <label>Transaction fee</label>
                                <input type="text" name="transactionFee" value={formatCurrency(displayFormData.transactionFee)} readOnly className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Total amount received by platform</label>
                                <input type="text" name="totalAmount" value={formatCurrency(displayFormData.totalAmount)} readOnly className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Tutor payout</label>
                                <input type="text" name="tutorPayout" value={formatCurrency(displayFormData.tutorPayout)} readOnly className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Platform profit (This Payment)</label>
                                <input type="text" name="profit1Week" value={formatCurrency(displayFormData.profit1Week)} readOnly className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Profit for 4 weeks (from this payment)</label>
                                <input type="text" name="profit4Week" value={formatCurrency(displayFormData.profit4Week)} readOnly className="form-input" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-cancel" onClick={handleCancel}>Cancel</button>
                                <button type="button" className="btn btn-submit" onClick={handleSubmit} disabled={loading || !completeStudentData}>Submit Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    );
};

export default Payout;