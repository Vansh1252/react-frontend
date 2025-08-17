import axios from "axios";

// Create an axios instance with baseURL and credentials
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_BASE_URL // Use .env variable in development
      : "/api", // Use relative path in production
  withCredentials: true, // Send cookies with requests
});

// Add request interceptor to attach token and role to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const auth = localStorage.getItem("auth");
    let token = "";
    if (auth) {
      try {
        token = JSON.parse(auth).token || auth;
      } catch {
        token = auth;
      }
    }
    // Attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user role to headers if available
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      try {
        const role = JSON.parse(loggedInUser)?.userobject?.role;
        if (role) {
          config.headers["x-user-role"] = role;
        }
      } catch {
        // ignore parse errors
      }
    }

    return config;
  },
  (error) => Promise.reject(error) // Forward request errors
);