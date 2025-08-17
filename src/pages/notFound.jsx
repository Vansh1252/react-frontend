import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for doesn't exist or has been moved.</p>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;