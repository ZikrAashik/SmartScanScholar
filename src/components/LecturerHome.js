import React, { Fragment, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

function LecturerHome() {
  const [sessionsCount, setSessionsCount] = useState(0);

  // Fetch Sessions for the current lecturer from Firestore
  const fetchSessions = async () => {
    try {
      const lecturerUid = auth.currentUser.uid;
      const q = query(collection(db, "sessions"), where("lecturerId", "==", lecturerUid));
      const querySnapshot = await getDocs(q);
      setSessionsCount(querySnapshot.size); // Get total number of sessions for the lecturer
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <Fragment>
      <div className="row">
        {/* Card for Total Sessions */}
        <div className="col-xl-6 col-xxl-5 col-lg-6">
          <div className="card container-box">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">Total Sessions</span>
                  <h2 className="fs-40 text-white mb-0">{sessionsCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of sessions created by the lecturer.</p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default LecturerHome;