import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import BrowserRouter, Routes, and Route
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/style.css";
import StudentDashboard from "./pages/StudentDashboard";

const App = () => {
  const body = document.querySelector("body");
  body.setAttribute("data-theme-version", "light");
  body.setAttribute("data-sibebarbg", "color_13");
  body.setAttribute("data-primary", "color_3");
  body.setAttribute("data-headerbg", "color_3");	
  body.setAttribute("data-nav-headerbg", "color_13");
  return (
    <BrowserRouter>
      <Routes>
        {/* Define Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard/*" element={<AdminDashboard />}/>
        <Route path="/lecturer-dashboard/*" element={<LecturerDashboard />}/>
        <Route path="/student-dashboard/*" element={<StudentDashboard />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;