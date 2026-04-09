import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { patientService } from '../../services/patientService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const UploadLabReport = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
  });

  useEffect(() => {
    loadPatients();
    loadReports();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      toast.error('Failed to load patients');
    }
  };

  const loadReports = async () => {
    try {
      const response = await api.get('/api/lab-reports/');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('patient_id', formData.patient_id);
      if (formData.appointment_id) {
        data.append('appointment_id', formData.appointment_id);
      }
      data.append('file', file);

      await api.post('/api/lab-reports/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Lab report uploaded successfully!');
      setFile(null);
      setFormData({ patient_id: '', appointment_id: '' });
      loadReports();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      reviewed: 'badge-success',
      under_review: 'badge-info',
    };
    return map[status] || 'badge-warning';
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: '⏳ Pending Review',
      reviewed: '✅ Reviewed',
      under_review: '🔍 Under Review',
    };
    return map[status] || '⏳ Pending Review';
  };
  // eslint-disable-next-line no-unused-vars
  const isNurse = user?.role === 'nurse' ||
                  user?.role === 'receptionist' ||
                  user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  return (
    <Layout>
      <div>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>🧪 Lab Reports</h1>
            <p style={styles.subtitle}>
              {isDoctor
                ? 'View and review lab reports for your patients'
                : 'Upload and manage patient lab reports'}
            </p>
          </div>
        </div>

        <div style={isDoctor ? styles.fullWidth : styles.grid}>
          {/* Upload Form — hidden for doctors */}
          {!isDoctor && (
            <div className="card">
              <h2 style={styles.cardTitle}>📤 Upload Lab Report</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Patient</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Appointment ID (Optional)</label>
                  <input
                    type="number"
                    name="appointment_id"
                    placeholder="Enter appointment ID if applicable"
                    value={formData.appointment_id}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Upload Report File</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    required
                  />
                  <p style={styles.fileHint}>
                    Accepted formats: PDF, PNG, JPG
                  </p>
                </div>

                {file && (
                  <div style={styles.filePreview}>
                    <span>📄</span>
                    <div>
                      <p style={styles.fileName}>{file.name}</p>
                      <p style={styles.fileSize}>
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : '⬆️ Upload Report'}
                </button>
              </form>

              {/* Info Box */}
              <div style={styles.infoBox}>
                <h4 style={styles.infoTitle}>
                  📋 After Upload
                </h4>
                <ul style={styles.infoList}>
                  <li>Report is saved to patient record</li>
                  <li>Doctor will be notified to review</li>
                  <li>Doctor adds review notes manually</li>
                  <li>Status updates after doctor reviews</li>
                </ul>
              </div>
            </div>
          )}

          {/* Reports List */}
          <div className="card">
            <h2 style={styles.cardTitle}>
              📋 {isDoctor ? 'Lab Reports to Review' : 'Uploaded Reports'}
              <span style={styles.countBadge}>{reports.length}</span>
            </h2>

            {reports.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🧪</div>
                <h3 style={styles.emptyTitle}>No reports yet</h3>
                <p style={styles.emptyText}>
                  {isDoctor
                    ? 'No lab reports have been uploaded for your patients'
                    : 'Upload your first lab report using the form'}
                </p>
              </div>
            ) : (
              <div>
                {reports.map((report) => (
                  <div key={report.id} style={styles.reportItem}>
                    <div style={styles.reportIcon}>
                      {report.file_name?.endsWith('.pdf')
                        ? '📄' : '🖼️'}
                    </div>
                    <div style={styles.reportInfo}>
                      <p style={styles.reportPatient}>
                        {report.patient_name}
                      </p>
                      <p style={styles.reportName}>
                        {report.file_name}
                      </p>
                      <p style={styles.reportDate}>
                        📅 {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={styles.reportStatus}>
                      <span className={`badge ${getStatusBadge(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  fullWidth: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  countBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  fileHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  filePreview: {
    backgroundColor: '#f0f4f8',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '20px',
  },
  fileName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
  },
  fileSize: {
    fontSize: '12px',
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
  },
  infoTitle: {
    color: '#1e3a8a',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '700',
  },
  infoList: {
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '2',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#6b7280',
  },
  reportItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  reportIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  reportInfo: {
    flex: 1,
  },
  reportPatient: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#1e3a8a',
    marginBottom: '2px',
  },
  reportName: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '2px',
  },
  reportDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  reportStatus: {
    flexShrink: 0,
  },
};

export default UploadLabReport;