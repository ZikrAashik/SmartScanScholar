import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../layouts/";
import Footer from "../layouts/Footer";
import LecturerHome from "../components/LecturerHome";
import CreateSession from "../components/CreateSession";
import ManageSessions from "../components/ManageSessions";
import MonitorSessions from "../components/MonitorSessions";
import { Routes, Route, Outlet } from "react-router-dom";

const LecturerDashboard = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [menuToggle, setMenuToggle] = useState(false);

    
    const handleSessionubmit = (formData) => {
      console.log('Student registered:', formData);
      setNotification({ message: 'Session created successfully!', type: 'success' });
      navigate('/lecturer-dashboard');
  };

    const allroutes = [
        { url: "", component: <LecturerHome /> },
        { url: "create-session", component: <CreateSession onSubmit={handleSessionubmit} /> },
        { url: "manage-sessions", component: <ManageSessions /> },
        { url: "monitor-sessions", component: <MonitorSessions /> },
    ];

    return (
        <>
            <Routes>
                <Route element={<MainLayout notification={notification} setNotification={setNotification} />}>
                    {allroutes.map((data, i) => (
                        <Route
                            key={i}
                            exact
                            path={`${data.url}`}
                            element={data.component}
                        />
                    ))}
                </Route>
            </Routes>
        </>
    );
};

function MainLayout({ notification, setNotification }) {
  return (
    <div id="main-wrapper" className={`show menu-toggle`}>  
            <Nav />
            <div className="content-body" style={{ minHeight: window.screen.height - 45 }}>
                <div className="container-fluid">
                    {notification.message && (
                        <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
                            {notification.message}
                            <button type="button" className="close" onClick={() => setNotification({ message: '', type: '' })}>
                                <span>&times;</span>
                            </button>
                        </div>
                    )}
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LecturerDashboard;