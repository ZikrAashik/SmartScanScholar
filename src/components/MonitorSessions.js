import React, { Fragment, useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

function MonitorSessions() {
  const [sessionsData, setSessionsData] = useState([]);

  // Fetch in-progress sessions for the current lecturer from Firestore
  const fetchSessions = () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    const lecturerUid = user.uid;
    const q = query(collection(db, "sessions"), where("lecturerId", "==", lecturerUid), where("status", "==", "In Progress"));
    onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessionsData(sessions);
    });
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSessions();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = sessionsData.map((session) => {
      const enrolledStudentsRef = collection(db, `sessions/${session.id}/enrolledStudents`);
      return onSnapshot(enrolledStudentsRef, (snapshot) => {
        const enrolledStudents = snapshot.docs.map((doc) => doc.data());
        setSessionsData((prevSessions) =>
          prevSessions.map((s) =>
            s.id === session.id ? { ...s, enrolledStudents } : s
          )
        );
      });
    });

    return () => {
      unsubscribe.forEach((unsub) => unsub());
    };
  }, [sessionsData]);

  const getAttendanceData = (session) => {
    const totalStudents = session.enrolledStudents ? session.enrolledStudents.length : 0;
    const presentStudents = session.enrolledStudents ? session.enrolledStudents.filter(student => student.attendance === 'present').length : 0;
    return {
      labels: ['Present', 'Absent'],
      datasets: [
        {
          data: [presentStudents, totalStudents - presentStudents],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };
  };

  return (
    <Fragment>
      <div className="row">
        {sessionsData.map((session) => {
          const totalStudents = session.enrolledStudents ? session.enrolledStudents.length : 0;
          const presentStudents = session.enrolledStudents ? session.enrolledStudents.filter(student => student.attendance  === 'present').length : 0;
          return (
            <div key={session.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card">
                <div className="card-body pt-2">
                  <h4 className="card-title">{session.title} Attendance</h4>
                  <div className="index-chart-point">
                    <Doughnut data={getAttendanceData(session)} />
                  </div>
                  <div className="mt-3">
                    <p>Total Students: {totalStudents}</p>
                    <p>Remaining Students: {totalStudents - presentStudents}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
}

export default MonitorSessions;