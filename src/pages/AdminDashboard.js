import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../layouts/";
import Footer from "../layouts/Footer";
import AdminHome from "../components/AdminHome";
import ManageLecturers from "../components/ManageLecturers";
import RegisterLecturer from "../components/RegisterLecturer";
import ManageStudents from "../components/ManageStudents";
import RegisterStudent from "../components/RegisterStudent";
import AttendanceAnalytics from "../components/AttendanceAnalytics";
import AttendanceReports from "../components/AttendanceReports";
import { Routes, Route, Outlet } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [menuToggle, setMenuToggle] = useState(false);

    const handleLecturerSubmit = (formData) => {
        console.log('Lecturer registered:', formData);
        setNotification({ message: 'Lecturer registered successfully!', type: 'success' });
        navigate('/admin-dashboard/manage-lecturers');
    };

    const handleStudentSubmit = (formData) => {
      console.log('Student registered:', formData);
      setNotification({ message: 'Student registered successfully!', type: 'success' });
      navigate('/admin-dashboard/manage-students');
  };

    const allroutes = [
        { url: "", component: <AdminHome /> },
        { url: "manage-lecturers", component: <ManageLecturers /> },
        { url: "register-lecturer", component: <RegisterLecturer onSubmit={handleLecturerSubmit} /> },
        { url: "edit-lecturer/:id", component: <RegisterLecturer onSubmit={handleLecturerSubmit} /> },
        { url: "edit-student/:id", component: <RegisterStudent onSubmit={handleStudentSubmit} /> },
        { url: "manage-students", component: <ManageStudents /> },
        { url: "register-student", component: <RegisterStudent onSubmit={handleStudentSubmit} /> },
        { url: "attendance-reports", component: <AttendanceReports /> },
        { url: "attendance-analytics", component: <AttendanceAnalytics /> },
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

export default AdminDashboard;