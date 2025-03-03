import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from "../firebaseConfig";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageSessions = () => {
  const [sessionsData, setSessionsData] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, sessionId: null });
  const [qrCodeModal, setQrCodeModal] = useState({ show: false, qrCode: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch sessions from Firestore
  const fetchSessions = async () => {
    try {
      const lecturerUid = auth.currentUser.uid;
      const q = query(collection(db, `sessions`), where("lecturerId", "==", lecturerUid));
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessionsData(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteDoc(doc(db, `sessions`, sessionId));
      setSessionsData(sessionsData.filter(session => session.id !== sessionId));
      setNotification({ message: 'Session deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting session:', error);
      setNotification({ message: 'Error deleting session.', type: 'danger' });
    } finally {
      setConfirmModal({ show: false, action: null, sessionId: null });
    }
  };

  const handleStartClick = (session) => {
    setConfirmModal({ show: true, action: 'start', sessionId: session.id });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.sessionId) {
      const sessionRef = doc(db, `sessions/${confirmModal.sessionId}`);
      if (confirmModal.action === 'start') {
        await updateDoc(sessionRef, { status: "In Progress" });
      } else if (confirmModal.action === 'end') {
        await updateDoc(sessionRef, { status: "Ended" });
      } else if (confirmModal.action === 'reopen') {
        await updateDoc(sessionRef, { status: "In Progress" });
      } else if (confirmModal.action === 'delete') {
        await handleDelete(confirmModal.sessionId);
      }
      setConfirmModal({ show: false, action: null, sessionId: null });
      fetchSessions(); // Refresh sessions data
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<img src="${qrCodeModal.qrCode}" alt="QR Code" style="width: 100%;" />`);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Sessions List</h4>
            <Link to={"/lecturer-dashboard/create-session"} className="btn btn-primary">Create Session</Link>
          </div>
          {notification.message && (
            <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
              {notification.message}
              <button type="button" className="close" onClick={() => setNotification({ message: '', type: '' })}>
                <span>&times;</span>
              </button>
            </div>
          )}
          <div className="card-body">
            <div className="table-responsive ticket-table">
              <table className="display dataTablesCard table-responsive-xl dataTable no-footer w-100">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Primary Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsData.map((session) => (
                    <tr key={session.id}>
                      <td>{session.title}</td>
                      <td>{session.date}</td>
                      <td>{session.time}</td>
                      <td>{session.duration}</td>
                      <td>
                        <span className={`badge ${session.status === 'Created' ? 'badge-primary' : session.status === 'In Progress' ? 'badge-info' : 'badge-danger'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td>
                        {session.status === 'Created' && (
                          <button
                            onClick={() => handleStartClick(session)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Start
                          </button>
                        )}
                        {session.status === 'In Progress' && (
                          <button
                            onClick={() => setConfirmModal({ show: true, action: 'end', sessionId: session.id })}
                            className="btn btn-outline-danger btn-sm"
                          >
                            End
                          </button>
                        )}
                        {session.status === 'Ended' && (
                          <button
                            onClick={() => setConfirmModal({ show: true, action: 'reopen', sessionId: session.id })}
                            className="btn btn-outline-secondary btn-sm"
                          >
                            Re Open
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-primary shadow btn-xs sharp me-1"
                            onClick={() => handleViewSession(session)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <Link
                            to={"#"}
                            className="btn btn-info shadow btn-xs sharp me-1"
                            onClick={() => setQrCodeModal({ show: true, qrCode: session.qrCode })}
                          >
                            <i className="fas fa-qrcode"></i>
                          </Link>
                          <button
                            className="btn btn-danger shadow btn-xs sharp"
                            onClick={() => setConfirmModal({ show: true, action: 'delete', sessionId: session.id })}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal className="fade" show={confirmModal.show} onHide={() => setConfirmModal({ show: false, action: null, sessionId: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to {confirmModal.action} this session?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal({ show: false, action: null, sessionId: null })}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmAction}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="fade" show={qrCodeModal.show} onHide={() => setQrCodeModal({ show: false, qrCode: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={qrCodeModal.qrCode} alt="QR Code" style={{ width: '100%' }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setQrCodeModal({ show: false, qrCode: '' })}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrintQRCode}>
            Print
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal className="fade" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Session Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSession && (
            <div>
              <p><strong>Title:</strong> {selectedSession.title}</p>
              <p><strong>Date:</strong> {selectedSession.date}</p>
              <p><strong>Time:</strong> {selectedSession.time}</p>
              <p><strong>Duration:</strong> {selectedSession.duration}</p>
              <p><strong>Details:</strong> {selectedSession.sessionDetails}</p>
              <p><strong>Status:</strong> {selectedSession.status}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageSessions;