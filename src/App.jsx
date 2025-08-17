import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { socket } from './lib/socket'; // ✅ import socket
import RegisterPage from './pages/register';
import LoginPage from './pages/login';
import ServerError from './pages/500';
import NotFound from './pages/notFound';
import { Dashboard } from './pages/dashborad';
import { axiosInstance } from './lib/axios';
import './App.css';
import StudentAdd from './pages/student/studentAdd';
import Studentlist from './pages/student/studentlist';
import AdditionalDetails from './pages/student/additional_details';
import AssignTutor from './pages/student/assign_tutor';
import Payout from './pages/student/payout';
import StudentDetails from './pages/student/studentdetailsview';
import Tutorlist from './pages/tutor/tutorlist';
import TutorAdd from './pages/tutor/tutorAdd';
import TutorWeeklyhour from './pages/tutor/tutorweeklyhour';
import TutorDetails from './pages/tutor/tutordetailsview';
import {jwtDecode} from "jwt-decode";
import StudentEdits from './pages/student/StudentEdit';
import TotalRevenue from './pages/TotalRevenue';
import Settings from './pages/settings';

// Import for notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Notification listener component
// In App.js, NotificationListener component
const NotificationListener = () => {
  useEffect(() => {
    console.log("Notification permission:", Notification.permission);
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Permission after request:", permission);
      });
    }

    socket.on('studentcreated', (data) => {
      console.log('Received studentcreated event:', data);
      toast.info(`Student created: ${data.firstName} ${data.lastName}`);
      if (Notification.permission === "granted") {
        new Notification('Student Created', {
          body: `Student created: ${data.firstName} ${data.lastName}`,
        });
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification('Student Created', {
              body: `Student created: ${data.firstName} ${data.lastName}`,
            });
          }
        });
      }
    });

    return () => {
      socket.off('studentcreated');
    };
  }, []);

  return null;
};


// ✅ Protected layout: only for authenticated routes
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshAccessToken = async () => {
      const isLoggedIn = localStorage.getItem("isloggedInUser") === "true";
      const isAuthPage = ["/login", "/register"].includes(location.pathname);

      if (!isLoggedIn && !isAuthPage) {
        navigate("/login");
        return;
      }

      if (isAuthPage) {
        // Let login and register pages load without redirect
        return;
      }

      // Continue your token refresh logic if logged in
      const authData = localStorage.getItem("auth");
      let accessToken = null;

      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          accessToken = parsed.token;
        } catch (e) {
          console.error("Failed to parse access token");
        }
      }

      let isTokenExpired = true;

      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
          isTokenExpired = decoded.exp < currentTime;
        } catch (e) {
          console.error("Failed to decode access token", e);
        }
      }

      if (!isTokenExpired) {
        return;
      }

      try {
        const res = await axiosInstance.get("/auth/refresh-token", {
          withCredentials: true,
        });
        const { accessToken, user } = res.data;

        if (accessToken && user) {
          localStorage.setItem("auth", JSON.stringify({ token: accessToken }));
          localStorage.setItem("loggedInUser", JSON.stringify(user));
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (err) {
        console.error("Token refresh failed:", err?.response?.data || err.message);
        localStorage.removeItem("auth");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("isloggedInUser");
        navigate("/login");
      }
    };

    refreshAccessToken();
  }, [location.pathname, navigate]);

  return <Outlet />;
};


// ✅ Router definition
const router = createBrowserRouter([
  // Public routes
  { path: "/register", element: <RegisterPage /> },
  { path: "/login", element: <LoginPage /> },

  // Protected routes
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/student", element: <Studentlist /> },
      { path: "/student/add", element: <StudentAdd /> },
      { path: "/student/additional-details", element: <AdditionalDetails /> },
      { path: "/student/assign-tutor/:studentId", element: <AssignTutor /> },
      { path: "/student-details/:studentId", element: <StudentDetails /> },
      { path: "/student-edits/:studentId", element: <StudentEdits /> },
      { path: "/student/edit/:studentId", element: <StudentAdd /> },
      { path: "/student/payout", element: <Payout /> },
      { path: "/tutor", element: <Tutorlist /> },
      { path: "/tutor/add", element: <TutorAdd /> },
      { path: "/tutor/weeklyhour", element: <TutorWeeklyhour /> },
      { path: "/tutor/details/:tutorId", element: <TutorDetails /> },
      { path: "/total-revenue", element: <TotalRevenue /> },
      { path: "/settings", element: <Settings /> },
      { path: "/500", element: <ServerError /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <>
      <NotificationListener />  {/* <-- Add listener here */}
      <RouterProvider router={router} />
      <ToastContainer position="top-center" autoClose={3000} limit={1} />  {/* <-- Toast container here */}
    </>
  );
}

export default App;
