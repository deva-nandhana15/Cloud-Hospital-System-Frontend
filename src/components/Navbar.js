import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        🏥 Hospital Management System
      </div>
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <FiUser style={{ marginRight: '8px' }} />
          <span style={styles.userName}>{user?.full_name}</span>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FiLogOut style={{ marginRight: '6px' }} />
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  userName: {
    fontWeight: '600',
    marginRight: '8px',
  },
  roleBadge: {
    backgroundColor: '#2563eb',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
};

export default Navbar;