import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../layouts/";
import Footer from "../layouts/Footer";
import StudentHome from "../components/StudentHome";
import ManageSessions from "../components/ManageSessions";
import { Routes, Route, Outlet } from "react-router-dom";
import QRCodeScanner from "../components/QRCodeScanner";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [menuToggle, setMenuToggle] = useState(false);

    

    const allroutes = [
        { url: "", component: <StudentHome /> },
        { url: "scan-qr", component: <QRCodeScanner/> },
        { url: "manage-sessions", component: <ManageSessions /> },
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

export default StudentDashboard;