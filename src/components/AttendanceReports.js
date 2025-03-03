import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AttendanceReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sessions'));
        const sessions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Extract unique stream and subject values
        const uniqueStreams = [...new Set(sessions.map(session => session.stream))];
        const uniqueSubjects = [...new Set(sessions.map(session => session.subject))];

        setStreams(uniqueStreams);
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'sessions'));
      const sessions = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(session => session.stream === selectedStream && session.subject === selectedSubject);

      const attendancePromises = sessions.map(async (session) => {
        const enrolledStudentsSnapshot = await getDocs(collection(db, `sessions/${session.id}/enrolledStudents`));
        const enrolledStudents = enrolledStudentsSnapshot.docs.map(studentDoc => ({
          studentId: studentDoc.id,
          ...studentDoc.data(),
          sessionTitle: session.title,
          sessionDate: session.date,
          sessionTime: session.time,
        }));
        return enrolledStudents;
      });

      const attendanceData = (await Promise.all(attendancePromises)).flat();
      setAttendanceData(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const handleStreamChange = (e) => {
    setSelectedStream(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleGenerateReport = () => {
    fetchAttendanceData();
  };

  return (
    <div>
      <h1>Attendance Reports</h1>
      <div className="form-group">
        <label htmlFor="stream">Stream</label>
        <select id="stream" className="form-control" value={selectedStream} onChange={handleStreamChange}>
          <option value="">Select Stream</option>
          {streams.map((stream, index) => (
            <option key={index} value={stream}>{stream}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="subject">Subject</label>
        <select id="subject" className="form-control" value={selectedSubject} onChange={handleSubjectChange}>
          <option value="">Select Subject</option>
          {subjects.map((subject, index) => (
            <option key={index} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleGenerateReport}>Generate Report</button>
      {attendanceData.length > 0 && (
        <CSVLink data={attendanceData} filename="attendance_report.csv" className="btn btn-success mt-3">
          Download Report
        </CSVLink>
      )}
    </div>
  );
};

export default AttendanceReports;
