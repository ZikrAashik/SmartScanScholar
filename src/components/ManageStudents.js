import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from "../firebaseConfig";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageStudents = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, studentId: null, email: null });
  const navigate = useNavigate();

  // Fetch students from Firestore
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const students = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((student) => student.active !== false);
      setStudentsData(students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleDelete = async (studentId, email) => {
    try {
      // Update student document in Firestore to set active to false
      await updateDoc(doc(db, 'students', studentId), {
        active: false
      });

       // Fetch the updated list of students
       const querySnapshot = await getDocs(collection(db, "students"));
       const students = querySnapshot.docs
           .map((doc) => ({ id: doc.id, ...doc.data() }))
           .filter((student) => student.active !== false);

       // Update the students state
       setStudentsData(students);

      setNotification({ message: 'Student deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating student:', error);
      setNotification({ message: 'Error deleting student.', type: 'error' });
    } finally {
      setConfirmDelete({ show: false, studentId: null, email: null });
    }
  };

  const handleEditStudent = (student) => {
    navigate(`/admin-dashboard/edit-student/${student.id}`, { state: { student } });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Students List</h4>
            <Link to={"/admin-dashboard/register-student"} className="btn btn-primary">Register Student</Link>
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
                    <th>Grade</th>
                    <th>Stream</th>
                    <th>Date of Joining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id}>
                      <td>{student.firstname}</td>
                      <td>{student.lastname}</td>
                      <td>{student.email}</td>
                      <td>{student.grade}</td>
                      <td>{student.stream}</td>
                      <td>
                        <span className="badge light badge-success">
                          {student.dateJoined}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-primary shadow btn-xs sharp me-1"
                            onClick={() => handleEditStudent(student)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <Link
                            to={"#"}
                            className="btn btn-danger shadow btn-xs sharp"
                            onClick={() => setConfirmDelete({ show: true, studentId: student.id, email: student.email })}
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

      <Modal  className="fade"  show={confirmDelete.show} onHide={() => setConfirmDelete({ show: false, studentId: null, email: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this student?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete({ show: false, studentId: null, email: null })}>
            No
          </Button>
          <Button variant="danger" onClick={() => handleDelete(confirmDelete.studentId, confirmDelete.email)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageStudents;