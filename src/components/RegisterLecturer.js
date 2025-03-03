import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, updateEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const RegisterLecturer = ({ onSubmit }) => {
    const location = useLocation();
    const isEditMode = location.state && location.state.lecturer;
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        stream: '',
        subject: '',
        dateOfJoining: '',
        password: '',
        confirmPassword: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const streams = ['Science', 'Commerce', 'Arts'];
    const subjects = {
        Science: ['Maths', 'Physics', 'Chemistry'],
        Commerce: ['Business Studies', 'Accounts', 'Economics'],
        Arts: ['History', 'Geography', 'Political Science'],
    };

    useEffect(() => {
        if (isEditMode) {
            const lecturer = location.state.lecturer;
            setFormData({
                firstName: lecturer.firstname,
                lastName: lecturer.lastname,
                email: lecturer.email,
                phone: lecturer.phone,
                stream: lecturer.stream,
                subject: lecturer.subject,
                dateOfJoining: lecturer.dateOfJoining,
                password: '',
                confirmPassword: '',
            });
        }
    }, [isEditMode, location.state]);

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName) errors.firstName = 'First Name is required';
        if (!formData.lastName) errors.lastName = 'Last Name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (!formData.stream) errors.stream = 'Stream is required';
        if (!formData.subject) errors.subject = 'Subject is required';
        if (!formData.dateOfJoining) errors.dateOfJoining = 'Date of Joining is required';
        if (!isEditMode) {
            if (!formData.password) errors.password = 'Password is required';
            if (formData.password.length < 6) errors.password = 'Password should be at least 6 characters';
            if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            setLoading(true);
            const auth = getAuth();
            try {
                if (isEditMode) {
                    const lecturerRef = doc(db, 'lecturers', location.state.lecturer.id);
                    await updateDoc(lecturerRef, {
                        firstname: formData.firstName,
                        lastname: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        stream: formData.stream,
                        subject: formData.subject,
                        dateOfJoining: formData.dateOfJoining,
                    });
                    if (formData.email !== location.state.lecturer.email) {
                        await updateEmail(auth.currentUser, formData.email);
                    }
                    setNotification({ message: 'Lecturer updated successfully!', type: 'success' });
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                    const user = userCredential.user;
                    await setDoc(doc(db, 'lecturers', user.uid), {
                        firstname: formData.firstName,
                        lastname: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        stream: formData.stream,
                        subject: formData.subject,
                        dateOfJoining: formData.dateOfJoining,
                    });
                    setNotification({ message: 'Lecturer registered successfully!', type: 'success' });
                }
                onSubmit(formData);
            } catch (error) {
                setNotification({ message: error.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        } else {
            setFormErrors(errors);
            const errorMessages = Object.values(errors).join(' ');
            setNotification({ message: errorMessages, type: 'error' });
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="form-validation">
                                <form className="needs-validation" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">First Name<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control" placeholder="First Name" 
                                                        value={formData.firstName} 
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                                                        required />
                                                    {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Last Name<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control" placeholder="Last Name" 
                                                        value={formData.lastName} 
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                                                        required />
                                                    {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Email address<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="email" className="form-control" placeholder="Your valid email.." 
                                                        value={formData.email} 
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                                        required />
                                                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Phone<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control" placeholder="Phone" 
                                                        value={formData.phone} 
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                                        required />
                                                    {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Stream<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <select className="form-control" 
                                                        value={formData.stream} 
                                                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })} 
                                                        required>
                                                        <option value="">Select Stream</option>
                                                        {streams.map(stream => (
                                                            <option key={stream} value={stream}>{stream}</option>
                                                        ))}
                                                    </select>
                                                    {formErrors.stream && <div className="invalid-feedback">{formErrors.stream}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Subject<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <select className="form-control" 
                                                        value={formData.subject} 
                                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                                                        required>
                                                        <option value="">Select Subject</option>
                                                        {formData.stream && subjects[formData.stream].map(subject => (
                                                            <option key={subject} value={subject}>{subject}</option>
                                                        ))}
                                                    </select>
                                                    {formErrors.subject && <div className="invalid-feedback">{formErrors.subject}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label className="col-lg-3 col-form-label">Date of Joining<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="date" className="form-control" 
                                                        value={formData.dateOfJoining} 
                                                        onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })} 
                                                        required />
                                                    {formErrors.dateOfJoining && <div className="invalid-feedback">{formErrors.dateOfJoining}</div>}
                                                </div>
                                            </div>
                                            {!isEditMode && (
                                                <>
                                                    <div className="mb-3 row">
                                                        <label className="col-lg-3 col-form-label">Password<span className="text-danger">*</span></label>
                                                        <div className="col-lg-9">
                                                            <input type="password" className="form-control" placeholder="Password" 
                                                                value={formData.password} 
                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                                                required />
                                                            {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="mb-3 row">
                                                        <label className="col-lg-3 col-form-label">Confirm Password<span className="text-danger">*</span></label>
                                                        <div className="col-lg-9">
                                                            <input type="password" className="form-control" placeholder="Confirm Password" 
                                                                value={formData.confirmPassword} 
                                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                                                                required />
                                                            {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <div className="mb-3 row">
                                                <div className="col-lg-9 ms-auto">
                                                    <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Lecturer' : 'Register Lecturer'}</button>
                                                </div>
                                            </div>
                                            {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
                                        </div>
                                    </div>
                                </form>
                                {loading && <div className="progress-overlay"><div className="progress-bar"></div></div>}
                                {notification.message && (
                                    <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
                                        {notification.message}
                                        <button type="button" className="close" onClick={() => setNotification({ message: '', type: '' })}>
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterLecturer;