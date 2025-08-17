import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../lib/axios";
import Loader from "../components/Loader";
import "../styles/login.css";
import logo from "../assets/logo.png";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isloggedInUser") === "true";
        const remembered = JSON.parse(localStorage.getItem("rememberMe") || "{}");
        if (isLoggedIn) {
            navigate("/");
        } else if (remembered.email && remembered.password) {
            setEmail(remembered.email);
            setPassword(remembered.password);
            setRememberMe(true);
        }
    }, [navigate]);

    const isValidInput = () => {
        if (!email || !password) {
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
            const response = await axiosInstance.post(
                "/auth/login",
                { email, password },
                { withCredentials: true }
            );
            const { accessToken, user } = response.data;
            if (response.status === 200) {
                localStorage.setItem("loggedInUser", JSON.stringify({ user }));
                localStorage.setItem("auth", JSON.stringify({ accessToken }));
                localStorage.setItem("isloggedInUser", "true");
                if (rememberMe) {
                    localStorage.setItem("rememberMe", JSON.stringify({ email, password }));
                } else {
                    localStorage.removeItem("rememberMe");
                }
                localStorage.removeItem("loginAttempts");
                toast.success("Login successful!");
                setTimeout(() => {
                    setLoading(false);
                    navigate("/");
                }, 2000);
            } else {
                toast.error(response.data.message || "Invalid credentials.");
                setLoading(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials or server error.");
            setLoading(false);
        }
    };

    return (
        <div className="main">
            <div className="overlay"></div>
            <div className="container">
                {loading && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(255,255,255,0.6)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Loader />
                    </div>
                )}
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="form-container">
                    <form className="form-box" onSubmit={handleSubmit}>
                        <div className="input-container">
                            <h2>Login</h2>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-label="Email"
                            />
                            <label htmlFor="password">Password</label>
                            <div className="icons-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-label="Password"
                                />
                                <i
                                    className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    style={{ cursor: "pointer" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                ></i>
                            </div>
                            <div className="form-options">
                                <label>
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember Me
                                </label>
                                <Link to="/forgot_password">Forget Password?</Link>
                            </div>
                            <button type="submit" disabled={loading} aria-label="Login">
                                Login
                            </button>
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
    );
}

export default LoginPage;