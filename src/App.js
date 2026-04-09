import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared Pages
import Dashboard from './pages/shared/Dashboard';

// Admin Pages
import ManagePatients from './pages/admin/ManagePatients';
import ManageDoctors from './pages/admin/ManageDoctors';
import AllAppointments from './pages/admin/AllAppointments';
import BillingPage from './pages/admin/BillingPage';

// Nurse Pages
import UploadLabReport from './pages/nurse/UploadLabReport';

const Unauthorized = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>⛔ Unauthorized Access</h1>
    <p>You don't have permission to view this page.</p>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/patients" element={
          <PrivateRoute roles={['admin', 'nurse', 'receptionist', 'doctor']}>
            <ManagePatients />
          </PrivateRoute>
        } />
        <Route path="/doctors" element={
          <PrivateRoute roles={['admin']}>
            <ManageDoctors />
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute roles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <AllAppointments />
          </PrivateRoute>
        } />
        <Route path="/billing" element={
          <PrivateRoute roles={['admin', 'receptionist']}>
            <BillingPage />
          </PrivateRoute>
        } />
        <Route path="/lab-reports" element={
          <PrivateRoute roles={['admin', 'nurse', 'doctor', 'receptionist']}>
            <UploadLabReport />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;