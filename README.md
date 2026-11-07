<h1 align="center">Tutoring Platform – Admin Panel</h1>

<p align="center">
  React admin dashboard for running an online tutoring business: manage students and tutors, assign tutors, set weekly availability, track revenue and handle payouts.
</p>

<p align="center">
  <a href="https://react-frontend-2pxh.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Visit_Site-000000?style=for-the-badge&logo=vercel&logoColor=white"/></a>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white"/>
</p>

> Backend API: [node_project_sql](https://github.com/Vansh1252/node_project_sql)

---

## Features

- **Auth:** login and register pages, with JWT decoded on the client to protect routes
- **Dashboard:** metric cards, a revenue table and a tutor overview
- **Students:** add, edit, list and view students, manage additional details, assign a tutor and handle payouts
- **Tutors:** add, edit, list and view tutors, assign students and set **weekly available hours**
- **Revenue:** a total revenue page
- **Real-time:** a Socket.IO client keeps data in sync with the backend
- **UX:** toast notifications, loaders, and 404 and 500 error pages

## Tech stack

| Area | Tools |
|---|---|
| Framework | React + Vite |
| Routing | React Router |
| UI | React Bootstrap, Lucide icons |
| HTTP | Axios with credentials |
| Real-time | socket.io-client |
| Utilities | jwt-decode, moment, react-hot-toast, react-toastify |

## Project structure

~~~text
src/
├── App.jsx                # Routes
├── main.jsx               # Entry point
├── components/            # Sidebar, metric cards, tables, loader
├── lib/
│   ├── axios.js           # API client
│   └── socket.js          # Socket.IO client
└── pages/
    ├── dashborad.jsx      # Dashboard
    ├── TotalRevenue.jsx
    ├── login.jsx, register.jsx, settings.jsx
    ├── student/           # Student list, add, edit, details, assign tutor, payout
    └── tutor/             # Tutor list, add, edit, details, assign students, weekly hours
~~~

## Getting started

**Prerequisites:** Node.js 18+ and the backend running locally or deployed

~~~bash
git clone https://github.com/Vansh1252/react-frontend.git
cd react-frontend
npm install
~~~

Create a `.env` file:

~~~env
VITE_API_BASE_URL=http://localhost:5000
~~~

Run it:

~~~bash
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview the build
~~~

## Author

**Vansh Jain**: [GitHub](https://github.com/Vansh1252) · sanklechav65@gmail.com
