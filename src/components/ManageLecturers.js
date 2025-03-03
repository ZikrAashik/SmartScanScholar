import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from "../firebaseConfig";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageLecturers = () => {
  const [lecturersData, setLecturersData] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, lecturerId: null, email: null });
  const navigate = useNavigate();

  // Fetch lecturers from Firestore
  const fetchLecturers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lecturers"));
      const lecturers = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((lecturer) => lecturer.active !== false);
      setLecturersData(lecturers);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const handleDelete = async (lecturerId, email) => {
    try {
      // Update lecturer document in Firestore to set active to false
      await updateDoc(doc(db, 'lecturers', lecturerId), {
        active: false
      });

      // Update the lecturers state
      setLecturersData(prevLecturersData => 
        prevLecturersData.map(lecturer => 
          lecturer.id === lecturerId ? { ...lecturer, active: false } : lecturer
        )
      );

      setNotification({ message: 'Lecturer deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating lecturer:', error);
      setNotification({ message: 'Error deleting lecturer.', type: 'error' });
    } finally {
      setConfirmDelete({ show: false, lecturerId: null, email: null });
    }
  };

  const handleEditLecturer = (lecturer) => {
    navigate(`/admin-dashboard/edit-lecturer/${lecturer.id}`, { state: { lecturer } });
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Lecturers List</h4>
            <Link to={"/admin-dashboard/register-lecturer"} className="btn btn-primary">Register Lecturer</Link>
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
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Stream</th>
                    <th>Subject</th>
                    <th>Date of Joining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturersData.map((lecturer) => (
                    <tr key={lecturer.id}>
                      <td>{lecturer.firstname}</td>
                      <td>{lecturer.lastname}</td>
                      <td>{lecturer.email}</td>
                      <td>{lecturer.phone}</td>
                      <td>{lecturer.stream}</td>
                      <td>{lecturer.subject}</td>
                      <td>
                        <span className="badge light badge-success">
                          {lecturer.dateOfJoining}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-primary shadow btn-xs sharp me-1"
                            onClick={() => handleEditLecturer(lecturer)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <Link
                            to={"#"}
                            className="btn btn-danger shadow btn-xs sharp"
                            onClick={() => setConfirmDelete({ show: true, lecturerId: lecturer.id, email: lecturer.email })}
                          >
                            <i className="fa fa-trash"></i>
                          </Link>
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

      <Modal  className="fade"  show={confirmDelete.show} onHide={() => setConfirmDelete({ show: false, lecturerId: null, email: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this lecturer?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete({ show: false, lecturerId: null, email: null })}>
            No
          </Button>
          <Button variant="danger" onClick={() => handleDelete(confirmDelete.lecturerId, confirmDelete.email)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageLecturers;