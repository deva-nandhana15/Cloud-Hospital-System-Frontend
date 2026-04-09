import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUserPlus,
  FiFileText,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/patients', icon: <FiUsers />, label: 'Patients' },
    { path: '/doctors', icon: <FiUserPlus />, label: 'Doctors' },
    { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
    { path: '/billing', icon: <FiDollarSign />, label: 'Billing' },
    { path: '/lab-reports', icon: <FiFileText />, label: 'Lab Reports' },
  ];

  const doctorLinks = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
    { path: '/patients', icon: <FiUsers />, label: 'My Patients' },
    { path: '/lab-reports', icon: <FiFileText />, label: 'Lab Reports' },
  ];

  const receptionistLinks = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/patients', icon: <FiUsers />, label: 'Patients' },
    { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
    { path: '/billing', icon: <FiDollarSign />, label: 'Billing' },
  ];

  const nurseLinks = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/patients', icon: <FiUsers />, label: 'Patients' },
    { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
    { path: '/lab-reports', icon: <FiFileText />, label: 'Lab Reports' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'doctor':
        return doctorLinks;
      case 'receptionist':
        return receptionistLinks;
      case 'nurse':
        return nurseLinks;
      default:
        return [];
    }
  };

  const roleEmoji =
    user?.role === 'admin'
      ? '👑'
      : user?.role === 'doctor'
        ? '👨‍⚕️'
        : user?.role === 'nurse'
          ? '👩‍⚕️'
          : '💼';

  return (
    <div style={styles.sidebar}>
      <div style={styles.roleSection}>
        <div style={styles.roleIcon}>{roleEmoji}</div>
        <div style={styles.roleText}>
          <span style={styles.roleName}>{user?.full_name}</span>
          <span style={styles.roleLabel}>{user?.role}</span>
        </div>
      </div>
      <nav style={styles.nav}>
        {getLinks().map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              ...styles.navLink,
              ...(location.pathname === link.path ? styles.activeLink : {}),
            }}
          >
            <span style={styles.icon}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: '64px',
    boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
    overflowY: 'auto',
    zIndex: 999,
  },
  roleSection: {
    padding: '20px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roleIcon: { fontSize: '32px' },
  roleText: { display: 'flex', flexDirection: 'column' },
  roleName: { fontSize: '13px', fontWeight: '600', color: '#1e3a8a' },
  roleLabel: {
    fontSize: '11px',
    color: '#6b7280',
    textTransform: 'capitalize',
    marginTop: '2px',
  },
  nav: { padding: '12px 8px' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
    transition: 'all 0.2s',
  },
  activeLink: {
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
    fontWeight: '600',
  },
  icon: { marginRight: '10px', fontSize: '16px' },
};

export default Sidebar;
