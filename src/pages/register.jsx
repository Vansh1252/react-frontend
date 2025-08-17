import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../components/Loader"; // Import Loader
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';
import '../styles/register.css'
import { axiosInstance } from "../lib/axios";

function RegisterPage() {
    const [fullName, setfullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isloggedInUser") === "true";
        if (isLoggedIn) {
            window.location.replace("/");
        }
    }, []);

    const isValidInput = () => {
        if (!fullName || !email || !password) {
            toast.warn("All fields are required.");
            return false;
        }
        if (password.length < 8) {
            toast.warn("Password must be at least 8 characters.");
            return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidInput()) return;
        setLoading(true);

        try {
            const response = await axiosInstance.post("auth/register", {
                fullName,
                email,
                password,
                role: 'admin'
            });
            if (response.status === 200 || response.status === 201) {
                toast.success("Registration successful!");
                setLoading(false);
                setTimeout(() => {
                    setLoading(false);
                    window.location.href = "/login";
                }, 2000);
            } else if (response.status === 400) {
                toast.error(response.data.message);
                setLoading(false);
            } else {
                toast.error("Invalid credentials or server error.");
                setLoading(false);
            }
        } catch (error) {
            toast.error("Invalid credentials or server error.");
            setLoading(false);
        }
    }

    return (
        <div className="main">
            <div className="overlay"></div>
            <div className="container">
                {loading && (
                    <div style={{
                        position: "fixed",
                        top: 0, left: 0, width: "100vw", height: "100vh",
                        background: "rgba(255,255,255,0.6)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Loader />
                    </div>
                )}
                <div className="logo">
                    <img src={logo} alt="logo" />
                </div>
                <div className="form-container">
                    <form className="form-box" onSubmit={handleSubmit}>
                        <div className="input-container">
                            <h2>Signup</h2>
                            <label htmlFor="fullName">Full Name</label>
                            <input type="text" id="fullName" value={fullName} onChange={(e) => setfullName(e.target.value)} />
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="submit" disabled={loading}>Register</button>
                        </div>
                    </form>
                </div>
                <div className="welcome-statment">
                    <h3>Welcome</h3>
                    <p>Private Reading Tutors for Emerging and Struggling Readers</p>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={2000} limit={1} />
        </div>
    )
}

export default RegisterPage;