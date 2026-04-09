import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { billingService } from '../../services/billingService';
import { labReportService } from '../../services/labReportService';

const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin': return <AdminDashboard user={user} />;
    case 'doctor': return <DoctorDashboard user={user} />;
    case 'receptionist': return <ReceptionistDashboard user={user} />;
    case 'nurse': return <NurseDashboard user={user} />;
    default: return <div>Unknown role</div>;
  }
};

// ─── Admin Dashboard ──────────────────────────────────────
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    patients: 0, doctors: 0,
    appointments: 0, revenue: 0,
    pendingBills: 0, todayAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, doctors, appointments, bills] = await Promise.all([
          patientService.getAllPatients(),
          doctorService.getAllDoctors(),
          appointmentService.getAllAppointments(),
          billingService.getAllBills(),
        ]);
        const today = new Date().toDateString();
        const todayApts = appointments.filter(
          a => new Date(a.appointment_date).toDateString() === today
        );
        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          revenue: bills
            .filter(b => b.payment_status === 'paid')
            .reduce((s, b) => s + b.total_amount, 0),
          pendingBills: bills
            .filter(b => b.payment_status === 'pending').length,
          todayAppointments: todayApts.length,
        });
        setRecentAppointments(appointments.slice(-5).reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={styles.loading}>Loading...</div></Layout>;

  return (
    <Layout>
      <div>
        <div style={styles.welcomeBar}>
          <div>
            <h1 style={styles.welcomeTitle}>
              👑 Admin Dashboard
            </h1>
            <p style={styles.welcomeSub}>
              Welcome back, {user.full_name}! Here's your hospital overview.
            </p>
          </div>
          <div style={styles.dateBox}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Patients', value: stats.patients, icon: '👥', color: '#2563eb' },
            { label: 'Total Doctors', value: stats.doctors, icon: '👨‍⚕️', color: '#16a34a' },
            { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: '#d97706' },
            { label: 'Total Revenue', value: `₹${stats.revenue.toFixed(0)}`, icon: '💰', color: '#7c3aed' },
            { label: 'Pending Bills', value: stats.pendingBills, icon: '⏳', color: '#dc2626' },
            { label: 'Total Appointments', value: stats.appointments, icon: '📋', color: '#0891b2' },
          ].map((card, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.statLabel}>{card.label}</p>
                <h2 style={styles.statValue}>{card.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <h2 style={styles.sectionTitle}>📋 Recent Appointments</h2>
          {recentAppointments.length === 0 ? (
            <p style={styles.emptyText}>No appointments yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.patient_name}</td>
                    <td>{apt.doctor_name}</td>
                    <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                    <td>{apt.reason || 'General checkup'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

// ─── Doctor Dashboard ─────────────────────────────────────
const DoctorDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalAppointments: 0,
    pendingLabReports: 0,
    completedToday: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appointments, reports] = await Promise.all([
          appointmentService.getAllAppointments(),
          labReportService.getAllReports(),
        ]);
        const today = new Date().toDateString();
        const todayApts = appointments.filter(
          a => new Date(a.appointment_date).toDateString() === today
        );
        const pendingRpts = reports.filter(r => r.status === 'pending');
        setStats({
          todayAppointments: todayApts.length,
          totalAppointments: appointments.length,
          pendingLabReports: pendingRpts.length,
          completedToday: todayApts.filter(
            a => a.status === 'completed'
          ).length,
        });
        setTodayAppointments(todayApts);
        setPendingReports(pendingRpts.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={styles.loading}>Loading...</div></Layout>;

  return (
    <Layout>
      <div>
        <div style={styles.welcomeBar}>
          <div>
            <h1 style={styles.welcomeTitle}>
              👨‍⚕️ Doctor Dashboard
            </h1>
            <p style={styles.welcomeSub}>
              Good day, Dr. {user.full_name}!
            </p>
          </div>
          <div style={styles.dateBox}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: '#2563eb' },
            { label: 'Completed Today', value: stats.completedToday, icon: '✅', color: '#16a34a' },
            { label: 'Pending Lab Reports', value: stats.pendingLabReports, icon: '🧪', color: '#dc2626' },
            { label: 'Total Appointments', value: stats.totalAppointments, icon: '📋', color: '#7c3aed' },
          ].map((card, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.statLabel}>{card.label}</p>
                <h2 style={styles.statValue}>{card.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Today's Appointments */}
          <div className="card">
            <h2 style={styles.sectionTitle}>📅 Today's Appointments</h2>
            {todayAppointments.length === 0 ? (
              <p style={styles.emptyText}>No appointments today</p>
            ) : (
              todayAppointments.map(apt => (
                <div key={apt.id} style={styles.aptItem}>
                  <div style={styles.aptTime}>
                    {new Date(apt.appointment_date).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{apt.patient_name}</p>
                    <p style={styles.aptReason}>
                      {apt.reason || 'General checkup'}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pending Lab Reports */}
          <div className="card">
            <h2 style={styles.sectionTitle}>🧪 Pending Lab Reports</h2>
            {pendingReports.length === 0 ? (
              <p style={styles.emptyText}>No pending lab reports</p>
            ) : (
              pendingReports.map(report => (
                <div key={report.id} style={styles.aptItem}>
                  <div style={{ fontSize: '28px' }}>📄</div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{report.patient_name}</p>
                    <p style={styles.aptReason}>{report.file_name}</p>
                  </div>
                  <span className="badge badge-warning">
                    {report.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ─── Receptionist Dashboard ───────────────────────────────
const ReceptionistDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingBills: 0,
    scheduledToday: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appointments, patients, bills] = await Promise.all([
          appointmentService.getAllAppointments(),
          patientService.getAllPatients(),
          billingService.getAllBills(),
        ]);
        const today = new Date().toDateString();
        const todayApts = appointments.filter(
          a => new Date(a.appointment_date).toDateString() === today
        );
        const pendingB = bills.filter(b => b.payment_status === 'pending');
        setStats({
          todayAppointments: todayApts.length,
          totalPatients: patients.length,
          pendingBills: pendingB.length,
          scheduledToday: todayApts.filter(
            a => a.status === 'scheduled'
          ).length,
        });
        setTodayAppointments(todayApts);
        setPendingBills(pendingB.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={styles.loading}>Loading...</div></Layout>;

  return (
    <Layout>
      <div>
        <div style={styles.welcomeBar}>
          <div>
            <h1 style={styles.welcomeTitle}>
              💼 Receptionist Dashboard
            </h1>
            <p style={styles.welcomeSub}>
              Welcome, {user.full_name}! Here's today's overview.
            </p>
          </div>
          <div style={styles.dateBox}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: '#2563eb' },
            { label: 'Scheduled Today', value: stats.scheduledToday, icon: '⏰', color: '#16a34a' },
            { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: '#d97706' },
            { label: 'Pending Bills', value: stats.pendingBills, icon: '💳', color: '#dc2626' },
          ].map((card, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.statLabel}>{card.label}</p>
                <h2 style={styles.statValue}>{card.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Today's Schedule */}
          <div className="card">
            <h2 style={styles.sectionTitle}>📅 Today's Schedule</h2>
            {todayAppointments.length === 0 ? (
              <p style={styles.emptyText}>No appointments today</p>
            ) : (
              todayAppointments.map(apt => (
                <div key={apt.id} style={styles.aptItem}>
                  <div style={styles.aptTime}>
                    {new Date(apt.appointment_date).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{apt.patient_name}</p>
                    <p style={styles.aptReason}>Dr. {apt.doctor_name}</p>
                  </div>
                  <span className={`badge ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pending Bills */}
          <div className="card">
            <h2 style={styles.sectionTitle}>💳 Pending Bills</h2>
            {pendingBills.length === 0 ? (
              <p style={styles.emptyText}>No pending bills</p>
            ) : (
              pendingBills.map(bill => (
                <div key={bill.id} style={styles.aptItem}>
                  <div style={{ fontSize: '28px' }}>🧾</div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{bill.patient_name}</p>
                    <p style={styles.aptReason}>
                      ₹{bill.total_amount}
                    </p>
                  </div>
                  <span className="badge badge-warning">pending</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ─── Nurse Dashboard ──────────────────────────────────────
const NurseDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pendingReports: 0,
    processedReports: 0,
    todayAppointments: 0,
    flaggedReports: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reports, appointments] = await Promise.all([
          labReportService.getAllReports(),
          appointmentService.getAllAppointments(),
        ]);
        const today = new Date().toDateString();
        const todayApts = appointments.filter(
          a => new Date(a.appointment_date).toDateString() === today
        );
        setStats({
          pendingReports: reports.filter(r => r.status === 'pending').length,
          processedReports: reports.filter(r => r.status === 'processed').length,
          todayAppointments: todayApts.length,
          flaggedReports: reports.filter(r => r.flagged_values).length,
        });
        setRecentReports(reports.slice(-5).reverse());
        setTodayAppointments(todayApts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={styles.loading}>Loading...</div></Layout>;

  return (
    <Layout>
      <div>
        <div style={styles.welcomeBar}>
          <div>
            <h1 style={styles.welcomeTitle}>
              👩‍⚕️ Nurse Dashboard
            </h1>
            <p style={styles.welcomeSub}>
              Welcome, {user.full_name}! Here's your clinical overview.
            </p>
          </div>
          <div style={styles.dateBox}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Pending Reports', value: stats.pendingReports, icon: '⏳', color: '#dc2626' },
            { label: 'Processed Reports', value: stats.processedReports, icon: '✅', color: '#16a34a' },
            { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: '#2563eb' },
            { label: 'Flagged Reports', value: stats.flaggedReports, icon: '🚨', color: '#d97706' },
          ].map((card, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.statLabel}>{card.label}</p>
                <h2 style={styles.statValue}>{card.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Recent Lab Reports */}
          <div className="card">
            <h2 style={styles.sectionTitle}>🧪 Recent Lab Reports</h2>
            {recentReports.length === 0 ? (
              <p style={styles.emptyText}>No reports uploaded yet</p>
            ) : (
              recentReports.map(report => (
                <div key={report.id} style={styles.aptItem}>
                  <div style={{ fontSize: '28px' }}>📄</div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{report.patient_name}</p>
                    <p style={styles.aptReason}>{report.file_name}</p>
                  </div>
                  <span className={`badge ${
                    report.status === 'processed'
                      ? 'badge-success'
                      : report.status === 'pending'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Today's Appointments */}
          <div className="card">
            <h2 style={styles.sectionTitle}>📅 Today's Appointments</h2>
            {todayAppointments.length === 0 ? (
              <p style={styles.emptyText}>No appointments today</p>
            ) : (
              todayAppointments.map(apt => (
                <div key={apt.id} style={styles.aptItem}>
                  <div style={styles.aptTime}>
                    {new Date(apt.appointment_date).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div style={styles.aptInfo}>
                    <p style={styles.aptPatient}>{apt.patient_name}</p>
                    <p style={styles.aptReason}>
                      Dr. {apt.doctor_name}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ─── Helper ───────────────────────────────────────────────
const getStatusBadge = (status) => {
  const map = {
    scheduled: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    no_show: 'badge-warning',
  };
  return map[status] || 'badge-info';
};

// ─── Shared Styles ────────────────────────────────────────
const styles = {
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#6b7280',
  },
  welcomeBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '20px 24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '4px',
  },
  welcomeSub: {
    color: '#6b7280',
    fontSize: '14px',
  },
  dateBox: {
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  statIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e3a8a',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '16px',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: '20px',
    fontSize: '14px',
  },
  aptItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  aptTime: {
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '60px',
    textAlign: 'center',
  },
  aptInfo: {
    flex: 1,
  },
  aptPatient: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e3a8a',
  },
  aptReason: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
};

export default Dashboard;