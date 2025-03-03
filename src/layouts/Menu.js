import React from 'react';

const getMenuList = () => {
    const commonMenu = [
        {
            title: 'Dashboard',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-layout" />,
            to: '',
        },
    ];

    const adminMenu = [
        {
            title: 'Manage Users',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-diploma" />,
            content: [
                {
                    title: 'Lecturers',
                    classsChange: 'mm-collapse',
                    hasMenu: true,
                    content: [
                        {
                            title: 'Register Lecturer',
                            to: 'register-lecturer',
                        },
                        {
                            title: 'Manage Lecturers',
                            to: 'manage-lecturers',
                        },
                    ],
                },
                {
                    title: 'Students',
                    hasMenu: true,
                    content: [
                        {
                            title: 'Register Student',
                            to: 'register-student',
                        },
                        {
                            title: 'Manage Students',
                            to: 'manage-students',
                        },
                    ],
                },
            ],
        },
        {
            title: 'Attendance Reports',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-calendar-1" />,
            to: 'attendance-reports',
        },
        {
            title: 'Attendance Analytics',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-diploma" />,
            to: 'attendance-analytics',
        },
    ];

    const lecturerMenu = [
        {
            title: 'Sessions',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-book" />,
            content: [
                {
                    title: 'Create Session',
                    to: 'create-session',
                },
                {
                    title: 'Manage Session',
                    to: 'manage-sessions',
                },
            ],
        },
        {
            title: 'Monitor',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-clock" />,
            to: 'monitor-sessions',
        },
    ];

    const studentMenu = [
        {
            title: 'Scan QR',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-clock" />,
            to: 'scan-qr',
        },
        {
            title: 'View History',
            classsChange: 'mm-collapse',
            iconStyle: <i className="flaticon-381-calendar" />,
            to: 'view-attendance-history',
        },
    ];

    const userDetails = JSON.parse(sessionStorage.getItem('user'));

    if (!userDetails) {
        return commonMenu;
    }

    switch (userDetails.role) {
        case 'admin':
            return [...commonMenu, ...adminMenu];
        case 'lecturer':
            return [...commonMenu, ...lecturerMenu];
        case 'student':
            return [...commonMenu, ...studentMenu];
        default:
            return commonMenu;
    }
};

export { getMenuList };