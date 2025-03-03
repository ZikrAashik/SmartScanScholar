import React, { Fragment, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

function StudentHome() {
  const [createdCount, setCreatedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [endedCount, setEndedCount] = useState(0);

  // Fetch Sessions for the current student from Firestore
  const fetchSessions = async () => {
    try {
      const studentUid = auth.currentUser.uid;
      const q = query(collection(db, "sessions"));
      const querySnapshot = await getDocs(q);
      let created = 0;
      let inProgress = 0;
      let ended = 0;

      for (const doc of querySnapshot.docs) {
        const sessionData = doc.data();
        const enrolledStudentsSnapshot = await getDocs(collection(db, `sessions/${doc.id}/enrolledStudents`));
        const isEnrolled = enrolledStudentsSnapshot.docs.some(studentDoc => studentDoc.id === studentUid);

        if (isEnrolled) {
          if (sessionData.status === "Created") {
            created++;
          } else if (sessionData.status === "In Progress") {
            inProgress++;
          } else if (sessionData.status === "Ended") {
            ended++;
          }
        }
      }

      setCreatedCount(created);
      setInProgressCount(inProgress);
      setEndedCount(ended);
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
        {/* Card for Created Sessions */}
        <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card container-box">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">Created Sessions</span>
                  <h2 className="fs-40 text-white mb-0">{createdCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of sessions created for the student.</p>
            </div>
          </div>
        </div>

        {/* Card for In Progress Sessions */}
        <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card container-box secondary">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">In Progress Sessions</span>
                  <h2 className="fs-40 text-white mb-0">{inProgressCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of sessions in progress for the student.</p>
            </div>
          </div>
        </div>

        {/* Card for Ended Sessions */}
        <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card container-box danger">
            <div className="card-body">
              <div className="d-sm-flex d-block pb-sm-3 align-items-end">
                <div className="me-auto pr-3 mb-2 mb-sm-0">
                  <span className="text-white fs-20 font-w200 d-block mb-sm-3 mb-2">Ended Sessions</span>
                  <h2 className="fs-40 text-white mb-0">{endedCount}</h2>
                </div>
              </div>
              <p className="fs-12">This shows the total number of sessions ended for the student.</p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default StudentHome;