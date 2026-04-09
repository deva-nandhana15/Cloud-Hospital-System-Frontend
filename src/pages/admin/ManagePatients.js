import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  blood_group: '',
  address: '',
  medical_history: '',
};

const ManagePatients = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isDoctor = user?.role === 'doctor';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    blood_pressure: '',
    temperature: '',
    heart_rate: '',
    weight: '',
    notes: '',
  });

  const canRegister = role === 'admin' || role === 'receptionist';
  const canDelete = role === 'admin';
  const canVitals = role === 'nurse' || role === 'admin';
  const showActions = canVitals || canDelete;

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (isDoctor) setShowForm(false);
  }, [isDoctor]);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientService.createPatient({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        address: formData.address || null,
        medical_history: formData.medical_history || null,
      });
      toast.success('Patient registered successfully!');
      setShowForm(false);
      setFormData(emptyForm);
      loadPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      await patientService.deletePatient(id);
      toast.success('Patient deleted');
      loadPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Delete failed');
    }
  };

  const openVitals = (p) => {
    setVitalsPatient(p);
    setVitalsForm({
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      weight: '',
      notes: '',
    });
    setVitalsOpen(true);
  };

  const submitVitals = async (e) => {
    e.preventDefault();
    try {
      await patientService.addVitals({
        patient_id: vitalsPatient.id,
        blood_pressure: vitalsForm.blood_pressure || null,
        temperature: vitalsForm.temperature
          ? parseFloat(vitalsForm.temperature)
          : null,
        heart_rate: vitalsForm.heart_rate
          ? parseInt(vitalsForm.heart_rate, 10)
          : null,
        weight: vitalsForm.weight ? parseFloat(vitalsForm.weight) : null,
        notes: vitalsForm.notes || null,
      });
      toast.success('Vitals recorded');
      setVitalsOpen(false);
      setVitalsPatient(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save vitals');
    }
  };

  const renderAvatar = (name) => {
    const letter =
      name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : '?';
    return <span style={styles.avatarCircle}>{letter}</span>;
  };

  const renderBloodBadge = (bg) => (
    <span style={styles.bloodBadge}>{bg && String(bg).trim() ? bg : '—'}</span>
  );

  const emptyMessage = isDoctor
    ? 'Patients will appear here once appointments are scheduled with you'
    : 'Add your first patient using the button above';

  return (
    <Layout>
      <div>
        <div style={styles.header}>
          <div style={styles.headerTextBlock}>
            <div style={styles.titleRow}>
              <h1 style={styles.pageTitle}>
                {isDoctor ? '👨‍⚕️ My Patients' : '👥 Manage Patients'}
              </h1>
              <span style={styles.countBadge}>{patients.length}</span>
            </div>
            <p style={styles.subtitle}>
              {isDoctor
                ? 'Patients who have appointments with you'
                : 'All registered patients in the system'}
            </p>
          </div>
          {!isDoctor && canRegister && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add New Patient'}
            </button>
          )}
        </div>

        {isDoctor && (
          <div style={styles.infoBanner}>
            <span style={styles.infoBannerText}>
              ℹ️ You can only view patients who have appointments scheduled with
              you. Contact reception to register new patients.
            </span>
          </div>
        )}

        {!isDoctor && showForm && canRegister && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Register New Patient</h2>
            <p style={styles.hint}>
              Patients are not system users. The password field is omitted;
              contact records only.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(
                      (bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Register Patient
              </button>
            </form>
          </div>
        )}

        <div className="card" style={styles.tableCard}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading...
            </div>
          ) : patients.length === 0 ? (
            <div style={styles.emptyState}>{emptyMessage}</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Gender</th>
                    <th style={styles.th}>Blood Group</th>
                    <th style={styles.th}>DOB</th>
                    {isDoctor && (
                      <th style={styles.th}>Medical History</th>
                    )}
                    {showActions && <th style={styles.th}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          {renderAvatar(p.full_name)}
                          <span>{p.full_name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{p.email || '—'}</td>
                      <td style={styles.td}>{p.phone || 'N/A'}</td>
                      <td style={styles.td}>{p.gender || 'N/A'}</td>
                      <td style={styles.td}>{renderBloodBadge(p.blood_group)}</td>
                      <td style={styles.td}>{p.date_of_birth || 'N/A'}</td>
                      {isDoctor && (
                        <td style={styles.tdMedHistory}>
                          {p.medical_history && String(p.medical_history).trim()
                            ? p.medical_history
                            : '—'}
                        </td>
                      )}
                      {showActions && (
                        <td style={styles.td}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {canVitals && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 10px',
                                }}
                                onClick={() => openVitals(p)}
                              >
                                Vitals
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                className="btn btn-danger"
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 10px',
                                }}
                                onClick={() => handleDelete(p.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {vitalsOpen && vitalsPatient && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h3 style={styles.cardTitle}>
              Record vitals — {vitalsPatient.full_name}
            </h3>
            <form onSubmit={submitVitals}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Blood pressure</label>
                  <input
                    value={vitalsForm.blood_pressure}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        blood_pressure: e.target.value,
                      })
                    }
                    placeholder="e.g. 120/80"
                  />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsForm.temperature}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        temperature: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Heart rate (bpm)</label>
                  <input
                    type="number"
                    value={vitalsForm.heart_rate}
                    onChange={(e) =>
                      setVitalsForm({
                        ...vitalsForm,
                        heart_rate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsForm.weight}
                    onChange={(e) =>
                      setVitalsForm({ ...vitalsForm, weight: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={vitalsForm.notes}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, notes: e.target.value })
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success">
                  Save vitals
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setVitalsOpen(false);
                    setVitalsPatient(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTextBlock: {
    flex: '1 1 auto',
    minWidth: '200px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e3a8a',
    margin: 0,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    padding: '0 10px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e3a8a',
    backgroundColor: '#dbeafe',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  infoBanner: {
    marginBottom: '20px',
    padding: '14px 16px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
  },
  infoBannerText: {
    fontSize: '14px',
    color: '#1e3a8a',
    lineHeight: 1.5,
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '20px',
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  tableCard: {
    padding: '20px',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e3a8a',
    borderBottom: '2px solid #bfdbfe',
    backgroundColor: '#eff6ff',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'middle',
  },
  tdMedHistory: {
    padding: '12px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top',
    maxWidth: '220px',
    wordBreak: 'break-word',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarCircle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  bloodBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: 1.6,
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '24px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
};

export default ManagePatients;
