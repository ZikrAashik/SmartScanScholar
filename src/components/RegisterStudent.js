import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, updateEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const RegisterStudent = ({ onSubmit }) => {
    const location = useLocation();
    const isEditMode = location.state && location.state.student;
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        grade: '',
        stream: '',
        dateJoined: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const streams = ['Science', 'Commerce', 'Arts'];

    useEffect(() => {
        if (isEditMode) {
            const student = location.state.student;
            setFormData({
                email: student.email,
                password: '',
                confirmPassword: '',
                firstName: student.firstname,
                lastName: student.lastname,
                grade: student.grade,
                stream: student.stream,
                dateJoined: student.dateJoined
            });
        }
    }, [isEditMode, location.state]);

    const validateForm = () => {
        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        if (!isEditMode) {
            if (!formData.password) errors.password = 'Password is required';
            if (formData.password.length < 6) errors.password = 'Password should be at least 6 characters';
            if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.firstName) errors.firstName = 'First Name is required';
        if (!formData.lastName) errors.lastName = 'Last Name is required';
        if (!formData.grade) errors.grade = 'Grade is required';
        if (!formData.stream) errors.stream = 'Stream is required';
        if (!formData.dateJoined) errors.dateJoined = 'Date Joined is required';
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
                    const studentRef = doc(db, 'students', location.state.student.id);
                    await updateDoc(studentRef, {
                        email: formData.email,
                        firstname: formData.firstName,
                        lastname: formData.lastName,
                        grade: formData.grade,
                        stream: formData.stream,
                        dateJoined: formData.dateJoined
                    });
                    if (formData.email !== location.state.student.email) {
                        await updateEmail(auth.currentUser, formData.email);
                    }
                    setNotification({ message: 'Student updated successfully!', type: 'success' });
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                    const user = userCredential.user;
                    await setDoc(doc(db, 'students', user.uid), {
                        email: formData.email,
                        firstname: formData.firstName,
                        lastname: formData.lastName,
                        grade: formData.grade,
                        stream: formData.stream,
                        dateJoined: formData.dateJoined
                    });
                    setNotification({ message: 'Student registered successfully!', type: 'success' });
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
                                                <label className="col-lg-3 col-form-label">Email address<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="email" className="form-control" placeholder="Your valid email.." 
                                                        value={formData.email} 
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                                        required />
                                                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
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
                                                <label className="col-lg-3 col-form-label">Grade<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="text" className="form-control" placeholder="Grade" 
                                                        value={formData.grade} 
                                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })} 
                                                        required />
                                                    {formErrors.grade && <div className="invalid-feedback">{formErrors.grade}</div>}
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
                                                <label className="col-lg-3 col-form-label">Date Joined<span className="text-danger">*</span></label>
                                                <div className="col-lg-9">
                                                    <input type="date" className="form-control" 
                                                        value={formData.dateJoined} 
                                                        onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })} 
                                                        required />
                                                    {formErrors.dateJoined && <div className="invalid-feedback">{formErrors.dateJoined}</div>}
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <div className="col-lg-9 ms-auto">
                                                    <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Student' : 'Register Student'}</button>
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

export default RegisterStudent;