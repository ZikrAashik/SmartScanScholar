import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import logo from '../assets/images/logo.png';
import login from "../assets/images/bg-login2.png";
import loginbg from "../assets/images/bg-login.jpg";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    async function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { email: '', password: '' };

        if (!email) {
            errorObj.email = 'Email is required';
            error = true;
        }
        if (!password) {
            errorObj.password = 'Password is required';
            error = true;
        } 
        setErrors(errorObj);

        if (error) return;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDetails = await getUserDetails(user.uid);
            const { role: userRole, firstname, lastname } = userDetails;

            if (userRole) {
                console.log('User role:', userDetails);
                // Store user session
                await sessionStorage.setItem('user', JSON.stringify({ 
                    uid: user.uid, 
                    role: userRole,
                    firstname: firstname,
                    lastname: lastname 
                }));

                // Navigate based on user role
                if (userRole === 'admin') {
                    navigate('/admin-dashboard');
                } else if (userRole === 'lecturer') {
                    navigate('/lecturer-dashboard');
                } else if (userRole === 'student') {
                    navigate('/student-dashboard');
                } else {
                    setErrorMessage('Invalid user role');
                }

                setSuccessMessage('Login successful!');
                setErrorMessage('');
            } else {
                setErrorMessage('User data not found');
            }
        } catch (err) {
            setErrorMessage(err.message);
            setSuccessMessage('');
        }
    }

    async function getUserDetails(uid) {
        const collections = ['admins', 'lecturers', 'students'];
        for (const collection of collections) {
            const userDoc = await getDoc(doc(db, collection, uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    role: collection.slice(0, -1),
                    firstname: userData.firstname,
                    lastname: userData.lastname
                };
            }
        }
        return null;
    }
    
    return (
        <div className="login-main-page" style={{ backgroundImage: "url(" + loginbg + ")" }}>
            <div className="login-wrapper">
                <div className="login-aside-left" style={{ backgroundImage: "url(" + login + ")" }}>
                    <Link to="/dashboard" className="login-logo">
                        <img src={logo} alt="" />
                    </Link>
                    <div className="login-description">
                        <h2 className="mb-2">Smart Attendance</h2>
                        <p className="fs-12">
                            Smart Scan is a web application that allows you to easily manage lecturer session
                            and student attendance system.
                        </p>
                        <ul className="social-icons mt-4">
                            <li><Link to={"#"}><i className="fab fa-facebook-f"></i></Link></li>
                            <li><Link to={"#"}><i className="fab fa-twitter"></i></Link></li>
                            <li><Link to={"#"}><i className="fab fa-linkedin-in"></i></Link></li>
                        </ul>
                        <div className="mt-5">                            
                            <Link to={"#"}>© 2025 </Link>
                        </div>
                    </div>
                </div>
                <div className="login-aside-right">
                    <div className="row m-0 justify-content-center h-100 align-items-center">
                        <div className="col-xl-7 col-xxl-7">
                            <div className="authincation-content">
                                <div className="row no-gutters">
                                    <div className="col-xl-12">
                                        <div className="auth-form-1">
                                            <div className="mb-4">
                                                <h3 className="text-primary mb-1">Welcome to SmartScan</h3>
                                                <p>Sign in by entering information below</p>
                                            </div>
                                            {errorMessage && (
                                                <div className='bg-red-300 text-red-900 border border-red-900 p-1 my-2'>
                                                    {errorMessage}
                                                </div>
                                            )}
                                            {successMessage && (
                                                <div className='bg-green-300 text-green-900 border border-green-900 p-1 my-2'>
                                                    {successMessage}
                                                </div>
                                            )}
                                            <form onSubmit={onLogin}>
                                                <div className="form-group">
                                                    <label className="mb-2">
                                                        <strong>Email</strong>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                    {errors.email && <div className="text-danger fs-12">{errors.email}</div>}
                                                </div>
                                                <div className="form-group">
                                                    <label className="mb-2"><strong>Password</strong></label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    {errors.password && <div className="text-danger fs-12">{errors.password}</div>}
                                                </div>
                                                <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                                    <div className="form-group">
                                                        <div className="form-check custom-checkbox ms-1">
                                                            <input type="checkbox" className="form-check-input" id="basic_checkbox_1" />
                                                            <label className="form-check-label" htmlFor="basic_checkbox_1">
                                                                Remember my preference
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <button type="submit" className="btn btn-primary btn-block">
                                                        Sign In
                                                    </button>
                                                </div>
                                            </form>
                                            <div className="new-account mt-2">
                                                <p>
                                                    Forgot Your Password?{" "}
                                                    <Link className="text-primary" to="/page-reset-password">
                                                        Reset
                                                    </Link>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;