import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/sidebar";
import '../../styles/studentlist.css';
import { axiosInstance } from "../../lib/axios";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


function Tutorlist() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [TutorsPerPage] = useState(10);
    const [Tutors, setTutors] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchTutors = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/tutor', {
                params: {
                    page: currentPage,
                    limit: TutorsPerPage,
                    name: searchTerm
                }
            });
            const { data, totalPages, totalRecords } = response.data;
            setTutors(data);
            setTotalPages(totalPages);
            setTotalRecords(totalRecords);
        } catch (error) {
            console.error('Failed to fetch Tutors:', error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTutors();
    }, [currentPage, searchTerm]);
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleAction = async (action, TutorId) => {
        switch (action) {
            case 'delete':
                const confirmDelete = window.confirm("Are you sure you want to delete this Tutor?");
                if (!confirmDelete) return;
                try {
                    setLoading(true);
                    await axiosInstance.delete(`/tutor/${TutorId}`);
                    toast.success("Tutor deleted successfully.");
                    fetchTutors();
                } catch (error) {
                    console.error("Failed to delete Tutor:", error.response?.data || error.message);
                    toast.error(error.response?.data?.message || "Failed to delete the Tutor. Please try again.");
                } finally {
                    setLoading(false);
                }
                break;
            case 'info':
                navigate(`/tutor/details/${TutorId}`);
                break;

            case 'edit':
                navigate(`/tutor/edit/${TutorId}`);
                break;

            default:
                console.log(`${action} action for Tutor ID: ${TutorId} is not defined.`);
                break;
        }
    };
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
                        <h1>Tutors</h1>
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
                            <button className="add-student-btn" onClick={() => navigate('/Tutor/add')}>+ Add Tutor</button>
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
                                        <th>Name</th>
                                        <th>Assigned Students</th>
                                        <th>Active Students</th>
                                        <th>On pause Students</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Tutors.length === 0 ? (
                                        <tr>
                                            <td colSpan="8">No Tutor found.</td>
                                        </tr>
                                    ) : (
                                        Tutors.map(Tutor => (
                                            <tr key={Tutor._id}>
                                                <td><input type="checkbox" /></td>
                                                <td className="student-name">{`${Tutor.tutorName}`}</td>
                                                <td>{`${Tutor.assignedStudentsCount}`}</td>
                                                <td>{`${Tutor.activeStudentsCount}`}</td>
                                                <td>{`${Tutor.pausedStudentsCount}`}</td>
                                                <td>
                                                    <span className={`status ${Tutor.status === 'active' ? 'active' : 'inactive'}`}>
                                                        {Tutor.status}
                                                    </span>
                                                </td>
                                                <td className="actions">
                                                    <button
                                                        className="action-btn info-btn"
                                                        onClick={() => handleAction('info', Tutor._id)}
                                                        title="View Info"
                                                    >
                                                        ℹ️
                                                    </button>
                                                    <button
                                                        className="action-btn edit-btn"
                                                        onClick={() => handleAction('edit', Tutor._id)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleAction('delete', Tutor._id)}
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
                            <span>{(currentPage - 1) * TutorsPerPage + 1}-{Math.min(currentPage * TutorsPerPage, totalRecords)} of {totalRecords}</span>
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
                                <span>{TutorsPerPage}/page</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tutorlist;
