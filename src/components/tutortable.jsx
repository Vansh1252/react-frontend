// components/tutortable.jsx (or recentStudentsTable.jsx)
import React from 'react';
import moment from 'moment'; // Import moment for date formatting
import '../styles/TutorTables.css'; // Ensure your CSS is linked

export const TutorTable = ({ data }) => { 
    console.log(data);
    return (
        <div className="tutor-table-container">
            <h3>Recent Students</h3> {/* Changed title */}
            <table className="tutor-table">
                <thead>
                    <tr>
                        <th>Student No.</th> 
                        <th>Student Name</th> 
                        <th>Assigned Tutor</th> 
                        <th>Start Date</th>
                        <th>End Date</th>  
                        <th>Status</th>
                        <th>Email</th>     
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