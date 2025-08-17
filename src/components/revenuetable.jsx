// components/tutortable.jsx (or recentpaymentssTable.jsx)
import React from 'react';
import moment from 'moment'; // Import moment for date formatting
import '../styles/TutorTables.css'; // Ensure your CSS is linked

// Assuming this component is named TutorTable and receives 'data' prop
export const RevenueTable = ({ data }) => { // 'data' will now be 'recentpaymentss' array
    return (
        <div className="tutor-table-container">
            <h3>Revenue</h3> {/* Changed title */}
            <table className="tutor-table">
                <thead>
                    <tr>
                        <th>Tutor Name</th> {/* New header */}
                        <th>Students Name</th> {/* New header */}
                        <th>Transaction fees</th>
                        <th>Total Amount </th>   {/* Changed to End Date for payments context */}
                        <th>Profit 1 Week</th>
                        <th>Profit 4 Week</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((payments) => ( // Loop through payments objects
                            <tr key={payments._id}> {/* Use payments._id for key */}
                                <td>{`${payments.obj_tutorId.str_firstName} ${payments.obj_tutorId.str_lastName}` || 'N/A'}</td> {/* Access paymentsNumber */}
                                <td>{`${payments.obj_studentId.str_firstName || ''} ${payments.obj_studentId.str_lastName || ''}`.trim()}</td> {/* Access firstName, lastName */}
                                <td>{payments.int_transactionFee || 'N/A'}</td> {/* Access startDate */}
                                <td>{payments.int_totalAmount || 'N/A'}</td> {/* Access dischargeDate */}
                                <td>{payments.int_profitWeek || 'N/A'}</td> {/* Access email */}
                                <td>{payments.int_profitMonth || 'N/A'}</td> {/* Access email */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No recent paymentss found.</td> {/* Adjust colspan */}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};