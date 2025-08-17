import { io } from "socket.io-client";

// Replace with your backend URL
const SOCKET_SERVER_URL = "http://localhost:3000"; // or your actual backend

export const socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket'], // Optional: avoid polling fallback
    withCredentials: true,     // Optional: if you’re using cookies
});
