// components/tutortable.jsx (or recentStudentsTable.jsx)
import React from 'react';
import moment from 'moment'; // Import moment for date formatting
import '../styles/TutorTables.css'; // Ensure your CSS is linked

// Assuming this component is named TutorTable and receives 'data' prop
export const TutorTable = ({ data }) => { // 'data' will now be 'recentStudents' array
    return (
        <div className="tutor-table-container">
            <h3>Recent Students</h3> {/* Changed title */}
            <table className="tutor-table">
                <thead>
                    <tr>
                        <th>Student No.</th> {/* New header */}
                        <th>Student Name</th> {/* New header */}
                        <th>Assigned Tutor</th> {/* New header */}
                        <th>Start Date</th>
                        <th>End Date</th>   {/* Changed to End Date for student context */}
                        <th>Status</th>
                        <th>Email</th>      {/* New header (optional, but in data) */}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((student) => ( // Loop through student objects
                            <tr key={student._id}> {/* Use student._id for key */}
                                <td>{student.studentNumber || 'N/A'}</td> {/* Access studentNumber */}
                                <td>{`${student.firstName || ''} ${student.lastName || ''}`.trim()}</td> {/* Access firstName, lastName */}
                                <td>{student.assignedTutorName || 'Not Assigned'}</td> {/* Access assignedTutorName */}
                                <td>{moment(student.startDate).format('DD-MMM-YYYY') || 'N/A'}</td> {/* Access startDate */}
                                <td>{student.dischargeDate ? moment(student.dischargeDate).format('DD-MMM-YYYY') : '-'}</td> {/* Access dischargeDate */}
                                <td>
                                    <span className={`status ${student.status === 'active' ? 'active' : (student.status === 'paused' ? 'paused' : 'inactive')}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>{student.email || 'N/A'}</td> {/* Access email */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No recent students found.</td> {/* Adjust colspan */}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};