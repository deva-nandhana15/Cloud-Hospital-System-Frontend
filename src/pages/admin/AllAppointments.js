import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AllAppointments = () => {
  const { user } = useAuth();
  const role = user?.role;
  const userId = user?.user_id != null ? Number(user.user_id) : null;

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    reason: '',
  });

  const myDoctorId = useMemo(() => {
    const d = doctors.find((doc) => doc.user_id === userId);
    return d ? d.id : null;
  }, [doctors, userId]);

  const canBook = role === 'admin' || role === 'receptionist';
  const canCancel = role === 'admin' || role === 'receptionist';
  const canCompleteAsStaff = role === 'admin' || role === 'receptionist';
  const isDoctor = role === 'doctor';
  const isNurse = role === 'nurse';

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [apts, docs, pts] = await Promise.all([
        appointmentService.getAllAppointments(),
        doctorService.getAllDoctors(),
        patientService.getAllPatients(),
      ]);
      setAppointments(apts);
      setDoctors(docs);
      setPatients(pts);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.completeAppointment(id);
      toast.success('Appointment marked as completed');
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel');
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.patient_id || !bookForm.doctor_id || !bookForm.appointment_date) {
      toast.error('Select patient, doctor, and date/time');
      return;
    }
    try {
      const iso = new Date(bookForm.appointment_date).toISOString();
      await appointmentService.bookAppointment({
        patient_id: parseInt(bookForm.patient_id, 10),
        doctor_id: parseInt(bookForm.doctor_id, 10),
        appointment_date: iso,
        reason: bookForm.reason || null,
      });
      toast.success('Appointment booked');
      setShowBook(false);
      setBookForm({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        reason: '',
      });
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      scheduled: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      no_show: 'badge-warning',
    };
    return map[status] || 'badge-info';
  };

  const showCompleteCancel = (apt) => {
    if (apt.status !== 'scheduled') return { showComplete: false, showCancel: false };
    if (isNurse) return { showComplete: false, showCancel: false };
    if (canCompleteAsStaff) return { showComplete: true, showCancel: true };
    if (isDoctor && myDoctorId != null && apt.doctor_id === myDoctorId) {
      return { showComplete: true, showCancel: false };
    }
    return { showComplete: false, showCancel: false };
  };

  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '40px' }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>📅 All Appointments</h1>
          {canBook && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowBook(!showBook)}
            >
              {showBook ? 'Close' : '+ Book appointment'}
            </button>
          )}
        </div>

        {showBook && canBook && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={styles.formTitle}>Book appointment</h2>
            <form onSubmit={handleBookSubmit}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    value={bookForm.patient_id}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, patient_id: e.target.value })
                    }
                    required
                  >
                    <option value="">— Select —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select
                    value={bookForm.doctor_id}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, doctor_id: e.target.value })
                    }
                    required
                  >
                    <option value="">— Select —</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} — {d.specialization || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={bookForm.appointment_date}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        appointment_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reason</label>
                  <input
                    type="text"
                    value={bookForm.reason}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, reason: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Confirm booking
              </button>
            </form>
          </div>
        )}

        <div style={styles.statsRow}>
          {['all', 'scheduled', 'completed', 'cancelled'].map((s) => (
            <div
              key={s}
              role="button"
              tabIndex={0}
              onClick={() => setFilter(s)}
              onKeyDown={(e) => e.key === 'Enter' && setFilter(s)}
              style={{
                ...styles.statChip,
                ...(filter === s ? styles.activeChip : {}),
              }}
            >
              <span style={styles.chipCount}>
                {s === 'all'
                  ? appointments.length
                  : appointments.filter((a) => a.status === s).length}
              </span>
              <span style={styles.chipLabel}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date &amp; Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6b7280',
                    }}
                  >
                    No appointments found
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const { showComplete, showCancel } = showCompleteCancel(apt);
                  return (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td>{apt.patient_name || 'N/A'}</td>
                      <td>{apt.doctor_name || 'N/A'}</td>
                      <td>{apt.doctor_specialization || 'N/A'}</td>
                      <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                      <td>{apt.reason || '—'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {showComplete && (
                            <button
                              type="button"
                              onClick={() => handleComplete(apt.id)}
                              className="btn btn-success"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              ✓ Complete
                            </button>
                          )}
                          {showCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancel(apt.id)}
                              className="btn btn-danger"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              ✗ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e3a8a',
    margin: 0,
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  statChip: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '2px solid transparent',
    minWidth: '80px',
  },
  activeChip: { border: '2px solid #1e3a8a', backgroundColor: '#eff6ff' },
  chipCount: { fontSize: '22px', fontWeight: '700', color: '#1e3a8a' },
  chipLabel: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
};

export default AllAppointments;
