import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/sidebar";
import '../../styles/studentlist.css';
import { axiosInstance } from "../../lib/axios";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


function Studentlist() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentsPerPage] = useState(10);
    const [students, setStudents] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/student', {
                params: {
                    page: currentPage,
                    limit: studentsPerPage,
                    name: searchTerm
                }
            });
            console.log(response.data)
            const { data, totalPages, totalRecords } = response.data;

            setStudents(data);
            setTotalPages(totalPages);
            setTotalRecords(totalRecords);
        } catch (error) {
            console.error('Failed to fetch students:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [currentPage, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // reset to page 1 when searching
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleAction = async (action, studentId) => {
        switch (action) {
            case 'delete':
                const confirmDelete = window.confirm("Are you sure you want to delete this student?");
                if (!confirmDelete) return;
                try {
                    setLoading(true);
                    await axiosInstance.delete(`/student/${studentId}`); // Corrected endpoint
                    toast.success("Student deleted successfully.");
                    fetchStudents(); // Refresh the list
                } catch (error) {
                    console.error("Failed to delete student:", error.response?.data || error.message);
                    toast.error(error.response?.data?.message || "Failed to delete the student. Please try again.");
                } finally {
                    setLoading(false);
                }
                break;

            case 'assign':
                // Store studentId in localStorage for the AssignTutor page
                localStorage.setItem('currentStudentId', studentId);
                // Navigate to the AssignTutor page
                navigate(`/student/assign-tutor/${studentId}`); // Assuming this is your route for AssignTutor
                break;

            case 'info':
                // Navigate to the student details page
                navigate(`/student-details/${studentId}`); // Assuming your route is /student-details/:id
                break;

            case 'edit':
                // Navigate to the student edit page (if you have one)
                navigate(`/student/edit/${studentId}`); // Example route for editing an existing student
                break;

            default:
                console.log(`${action} action for student ID: ${studentId} is not defined.`);
                break;
        }
    };

    const navigate = useNavigate(); // ← ADD THIS LINE

    return (
        <div className="app">
            <Sidebar />
            <div className="main-content">
                <div className="header">
                    <div className="user-info">
                        <div className="user-avatar">A</div>
                        <span>Angelica Lima</span>
                    </div>
                </div>

                <div className="content-area">
                    <div className="page-header">
                        <h1>Students</h1>
                        <div className="header-actions">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search Student"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                            <button className="add-student-btn" onClick={() => navigate('/student/add')}>+ Add Student</button>
                        </div>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-text">Loading...</div>
                        ) : (
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" /></th>
                                        <th>Student No.</th>
                                        <th>Name</th>
                                        <th>Assigned Tutor</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">No students found.</td>
                                        </tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student._id}>
                                                <td><input type="checkbox" /></td>
                                                <td>{student.studentNumber}</td>
                                                <td className="student-name">{`${student.firstName} ${student.lastName}`}</td>
                                                <td className={!student.assignedTutorName ? 'not-assigned' : ''}>
                                                    {student.assignedTutorName || 'Not Assigned'}
                                                </td>
                                                <td>{moment(student.startDate).format('DD-MMM-YYYY')}</td>
                                                <td>{student.dischargeDate ? moment(student.dischargeDate).format('DD-MMM-YYYY') : '-'}</td>
                                                <td>
                                                    <span className={`status ${student.status === 'active' ? 'active' : 'inactive'}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="actions">
                                                    {!student.assignedTutorName && (
                                                        <button
                                                            className="action-btn assign-btn"
                                                            onClick={() => handleAction('assign', student._id)}
                                                            title="Assign Tutor"
                                                        >
                                                            ⊕
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn info-btn"
                                                        onClick={() => handleAction('info', student._id)}
                                                        title="View Info"
                                                    >
                                                        ℹ️
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleAction('delete', student._id)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <div className="pagination-info">
                            <span>{(currentPage - 1) * studentsPerPage + 1}-{Math.min(currentPage * studentsPerPage, totalRecords)} of {totalRecords}</span>
                        </div>
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                ›
                            </button>

                            <div className="per-page">
                                <span>{studentsPerPage}/page</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Studentlist;
