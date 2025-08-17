import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-content">
                <h1>500</h1>
                <h2>Server Error</h2>
                <p>Sorry, something went wrong on our end. Please try again later.</p>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default ServerError;