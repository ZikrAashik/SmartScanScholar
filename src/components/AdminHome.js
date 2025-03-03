import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; 

function AdminHome() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [lecturersCount, setLecturersCount] = useState(0);

  // Fetch Students from Firestore
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      setStudentsCount(querySnapshot.size); // Get total number of students
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Fetch Lecturers from Firestore
  const fetchLecturers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lecturers"));
      setLecturersCount(querySnapshot.size); // Get total number of lecturers
    } catch (err) {
      console.error("Error fetching lecturers:", err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
    fetchLecturers();
  }, []);

  return (
    <Fragment>
      <div className="row">
        {/* Card for Total Lecturers */}
        <div className="col-xl-6 col-xxl-5 col-lg-6">
          <div className="card container-box">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">Total Lecturers</span>
                  <h2 className="fs-40 text-white mb-0">{lecturersCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of lecturers currently in the system.</p>
              <Link to={"/admin-dashboard/manage-lecturers"} className="text-white">
                View details<i className="las la-long-arrow-alt-right scale5 ms-3"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Card for Total Students */}
        <div className="col-xl-6 col-xxl-5 col-lg-6">
          <div className="card container-box">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">Total Students</span>
                  <h2 className="fs-40 text-white mb-0">{studentsCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of students currently in the system.</p>
              <Link to={"/admin-dashboard/manage-students"} className="text-white">
                View details<i className="las la-long-arrow-alt-right scale5 ms-3"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default AdminHome;
