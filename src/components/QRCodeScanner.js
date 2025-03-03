import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRCodeScanner = () => {
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(handleScan, handleError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error('Failed to clear scanner:', error));
        scannerRef.current = null;
      }
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }
    };
  }, []);

  const handleScan = async (data) => {
    if (data) {
      try {
        const sessionRef = doc(db, `sessions/${data}`);
        const sessionDoc = await getDoc(sessionRef);

        if (sessionDoc.exists()) {
          setSessionDetails({ id: data, ...sessionDoc.data() });
          setShowModal(true);
        } else {
          setMessage('Invalid QR code.');
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        setMessage('Error fetching session details. Please try again.');
      }
    }
  };

  const handleError = (error) => {
    console.error('QR code scan error:', error);
    setMessage('Error scanning QR code. Please try again.');
  };

  const markAttendance = async () => {
    try {
      const studentUid = auth.currentUser.uid;
      const enrolledStudentRef = doc(db, `sessions/${sessionDetails.id}/enrolledStudents/${studentUid}`);
      const enrolledStudentDoc = await getDoc(enrolledStudentRef);

      if (enrolledStudentDoc.exists()) {
        await updateDoc(enrolledStudentRef, { attendance: 'present', attendDateTime: new Date().toISOString() });
        setMessage('Attendance marked successfully.');
      } else {
        setMessage('You are not enrolled in this session.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage('Error marking attendance. Please try again.');
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div>
      <h2>Scan QR Code to Mark Attendance</h2>
      <div id="reader" style={{ width: '100%' }}></div>
      {message && <p>{message}</p>}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Session Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sessionDetails && (
            <div>
              <p><strong>Title:</strong> {sessionDetails.title}</p>
              <p><strong>Date:</strong> {sessionDetails.date}</p>
              <p><strong>Time:</strong> {sessionDetails.time}</p>
              <p><strong>Duration:</strong> {sessionDetails.duration}</p>
              <p><strong>Details:</strong> {sessionDetails.sessionDetails}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={markAttendance}>
            Mark Attendance
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QRCodeScanner;