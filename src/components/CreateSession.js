import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import QRCodeGenerator from './QRCodeGenerator';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const saveSession = async (sessionData) => {
    try {
        const { enrolledStudents, ...sessionWithoutStudents } = sessionData;
        const sessionRef = doc(db, `sessions`, sessionData.id);
        await setDoc(sessionRef, sessionWithoutStudents);

        // Create sub-collection for enrolled students
        const enrolledStudentsRef = collection(sessionRef, 'enrolledStudents');
        for (const student of enrolledStudents) {
            const studentRef = doc(enrolledStudentsRef, student.id);
            await setDoc(studentRef, { attendance: 'absent' });
        }

        console.log('Session saved successfully');
    } catch (error) {
        console.error('Error saving session:', error);
        throw new Error('Error saving session');
    }
};

const CreateSession = ({ onSubmit }) => {
    const [sessionData, setSessionData] = useState({
        title: '',
        date: '',
        time: '',
        duration: '',
        sessionDetails: '',
        subject: '', // Add subject field
        qrCode: '',
        lecturerId: auth.currentUser.uid,
        createdAt: '',
        status: 'Created',
        enrolledStudents: [],
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [studentsData, setStudentsData] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [lecturerName, setLecturerName] = useState('');
    const [streams, setStreams] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchLecturerData = async () => {
            try {
                const lecturerRef = doc(db, `lecturers/${auth.currentUser.uid}`);
                const lecturerDoc = await getDoc(lecturerRef);
                if (lecturerDoc.exists()) {
                    const lecturerData = lecturerDoc.data();
                    setLecturerName(`${lecturerData.firstname} ${lecturerData.lastname}`);
                    setStreams([lecturerData.stream]);
                    setSubjects(Array.isArray(lecturerData.subjects) ? lecturerData.subjects : []);
                    setSessionData(prevData => ({
                        ...prevData,
                        stream: lecturerData.stream,
                        subject: lecturerData.subject
                    }));
                }
            } catch (error) {
                console.error('Error fetching lecturer data:', error);
            }
        };

        const fetchStudents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "students"));
                const students = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setStudentsData(students);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchLecturerData();
        fetchStudents();
    }, []);

    const handleStreamChange = (e) => {
        const selectedStream = e.target.value;
        setSessionData((prevData) => ({
            ...prevData,
            stream: selectedStream,
            enrolledStudents: studentsData
                .filter(student => student.stream === selectedStream)
                .map(student => ({ id: student.id }))
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'stream') {
            handleStreamChange(e);
        } else {
            setSessionData({ ...sessionData, [name]: value });
        }
    };

    const handleStudentSelect = (studentId) => {
        setSessionData((prevData) => {
            const enrolledStudents = prevData.enrolledStudents.some(enrolled => enrolled.id === studentId)
                ? prevData.enrolledStudents.filter((enrolled) => enrolled.id !== studentId)
                : [...prevData.enrolledStudents, { id: studentId }];
            return { ...prevData, enrolledStudents };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sessionData.enrolledStudents.length === 0) {
            setNotification({ message: 'Please select at least one student.', type: 'danger' });
            return;
        }
        try {
            const sessionId = uuidv4();
            const createdAt = new Date().toISOString();
            const startDateTime = new Date(`${sessionData.date}T${sessionData.time}`).toISOString();
            const updatedSessionData = { ...sessionData, id: sessionId, createdAt, startDateTime };
            const qrCodeUrl = await QRCode.toDataURL(sessionId);
            updatedSessionData.qrCode = qrCodeUrl;
            await saveSession(updatedSessionData);
            setNotification({ message: 'Session created successfully!', type: 'success' });
            onSubmit(updatedSessionData);
        } catch (error) {
            setNotification({ message: 'Error creating session. Please try again.', type: 'danger' });
        }
    };

    return (
        <div className="row">
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-body">
                        <h2 className="card-title">Create Session</h2>
                        {notification.message && (
                            <div className={`alert alert-${notification.type}`}>
                                {notification.message}
                                <button type="button" className="close" onClick={() => setNotification({ message: '', type: '' })}>
                                    <span>&times;</span>
                                </button>
                            </div>
                        )}
                        <div className="form-validation">
                            <form className="needs-validation" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-xl-12">
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Lecturer Name</label>
                                            <div className="col-lg-9">
                                                <input type="text" className="form-control" value={lecturerName} readOnly />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Stream<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <input type="text" className="form-control" name="stream" value={sessionData.stream} readOnly />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Subject<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                            <input type="text" className="form-control" name="subject" value={sessionData.subject} readOnly />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Session Title<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <input type="text" className="form-control" name="title" placeholder="Session Title" onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Date<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <input type="date" className="form-control" name="date" onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Time<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <input type="time" className="form-control" name="time" onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Duration (minutes)<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <input type="number" className="form-control" name="duration" placeholder="Duration (minutes)" onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label">Session Details<span className="text-danger">*</span></label>
                                            <div className="col-lg-9">
                                                <textarea className="form-control" name="sessionDetails" placeholder="Session Details" onChange={handleChange} required></textarea>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label className="col-lg-3 col-form-label"></label>
                                            <div className="col-lg-9">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(true)}>Select Students</button>
                                                <ul>
                                                    {sessionData.enrolledStudents.map((enrolled) => {
                                                        const student = studentsData.find((student) => student.id === enrolled.id);
                                                        return (
                                                            <li key={enrolled.id}>
                                                                {student.firstname} {student.lastname}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <div className="col-lg-9 ms-auto">
                                                <button type="submit" className="btn btn-primary">Create Session</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            {sessionData.qrCode && <QRCodeGenerator sessionDetails={sessionData.qrCode} />}
                        </div>
                    </div>
                </div>
            </div>

            <Modal className="fade" show={showStudentModal} onHide={() => setShowStudentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Students</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="table-responsive ticket-table">
                        <table className="display dataTablesCard table-responsive-xl dataTable no-footer w-100">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Grade</th>
                                    <th>Stream</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsData
                                    .filter(student => student.stream === sessionData.stream)
                                    .map((student) => (
                                        <tr key={student.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={sessionData.enrolledStudents.some(enrolled => enrolled.id === student.id)}
                                                    onChange={() => handleStudentSelect(student.id)}
                                                />
                                            </td>
                                            <td>{student.firstname}</td>
                                            <td>{student.lastname}</td>
                                            <td>{student.email}</td>
                                            <td>{student.grade}</td>
                                            <td>{student.stream}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStudentModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreateSession;