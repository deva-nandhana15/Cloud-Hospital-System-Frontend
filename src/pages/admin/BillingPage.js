import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { billingService } from '../../services/billingService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BillingPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    appointment_id: '',
    consultation_fee: '',
    medicine_cost: '',
    test_cost: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [billsData, appointmentsData] = await Promise.all([
        billingService.getAllBills(),
        appointmentService.getAllAppointments(),
      ]);
      setBills(billsData);
      // Only show completed appointments that don't have a bill yet
      const billedAppointmentIds = billsData.map(b => b.appointment_id);
      const unbilledAppointments = appointmentsData.filter(
        a => a.status === 'completed' && !billedAppointmentIds.includes(a.id)
      );
      setAppointments(unbilledAppointments);
    } catch (error) {
      toast.error('Failed to load billing data');
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
      await billingService.createBill({
        appointment_id: parseInt(formData.appointment_id),
        consultation_fee: parseFloat(formData.consultation_fee) || 0,
        medicine_cost: parseFloat(formData.medicine_cost) || 0,
        test_cost: parseFloat(formData.test_cost) || 0,
      });
      toast.success('Bill created successfully!');
      setShowForm(false);
      setFormData({
        appointment_id: '',
        consultation_fee: '',
        medicine_cost: '',
        test_cost: '',
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create bill');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await billingService.markAsPaid(id);
      toast.success('Bill marked as paid!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update bill');
    }
  };

  const handleMarkOverdue = async (id) => {
    try {
      await billingService.markAsOverdue(id);
      toast.success('Bill marked as overdue');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update bill');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  const filtered = filter === 'all'
    ? bills
    : bills.filter(b => b.payment_status === filter);

  const totalRevenue = bills
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const totalPending = bills
    .filter(b => b.payment_status === 'pending')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const handleAppointmentSelect = (e) => {
    setFormData({ ...formData, appointment_id: e.target.value });
  };

  return (
    <Layout>
      <div>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>💳 Billing Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Create New Bill'}
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, backgroundColor: '#16a34a' }}>
              💰
            </div>
            <div>
              <p style={styles.summaryLabel}>Total Revenue</p>
              <h2 style={styles.summaryValue}>₹{totalRevenue.toFixed(2)}</h2>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, backgroundColor: '#d97706' }}>
              ⏳
            </div>
            <div>
              <p style={styles.summaryLabel}>Pending Amount</p>
              <h2 style={styles.summaryValue}>₹{totalPending.toFixed(2)}</h2>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, backgroundColor: '#2563eb' }}>
              📋
            </div>
            <div>
              <p style={styles.summaryLabel}>Total Bills</p>
              <h2 style={styles.summaryValue}>{bills.length}</h2>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, backgroundColor: '#7c3aed' }}>
              ✅
            </div>
            <div>
              <p style={styles.summaryLabel}>Paid Bills</p>
              <h2 style={styles.summaryValue}>
                {bills.filter(b => b.payment_status === 'paid').length}
              </h2>
            </div>
          </div>
        </div>

        {/* Create Bill Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Create New Bill</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Select Completed Appointment</label>
                  <select
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={handleAppointmentSelect}
                    required
                  >
                    <option value="">-- Select Appointment --</option>
                    {appointments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        #{apt.id} — {apt.patient_name} with {apt.doctor_name} on{' '}
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  {appointments.length === 0 && (
                    <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                      No completed appointments without bills found
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    placeholder="0.00"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Medicine Cost (₹)</label>
                  <input
                    type="number"
                    name="medicine_cost"
                    placeholder="0.00"
                    value={formData.medicine_cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Test Cost (₹)</label>
                  <input
                    type="number"
                    name="test_cost"
                    placeholder="0.00"
                    value={formData.test_cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div style={styles.totalPreview}>
                <span>Total Amount:</span>
                <strong style={{ color: '#16a34a', fontSize: '18px' }}>
                  ₹{(
                    (parseFloat(formData.consultation_fee) || 0) +
                    (parseFloat(formData.medicine_cost) || 0) +
                    (parseFloat(formData.test_cost) || 0)
                  ).toFixed(2)}
                </strong>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Bill
              </button>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {['all', 'pending', 'paid', 'overdue'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                ...styles.filterTab,
                ...(filter === tab ? styles.activeTab : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && ` (${bills.length})`}
            </button>
          ))}
        </div>

        {/* Bills Table */}
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No bills found
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Appointment Date</th>
                  <th>Consultation</th>
                  <th>Medicine</th>
                  <th>Tests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>{bill.patient_name}</td>
                    <td>{bill.doctor_name}</td>
                    <td>
                      {bill.appointment_date
                        ? new Date(bill.appointment_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>₹{bill.consultation_fee}</td>
                    <td>₹{bill.medicine_cost}</td>
                    <td>₹{bill.test_cost}</td>
                    <td>
                      <strong style={{ color: '#16a34a' }}>
                        ₹{bill.total_amount}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(bill.payment_status)}`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td>
                      {bill.payment_status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-success"
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                            onClick={() => handleMarkPaid(bill.id)}
                          >
                            Mark Paid
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                              onClick={() => handleMarkOverdue(bill.id)}
                            >
                              Mark Overdue
                            </button>
                          )}
                        </div>
                      )}
                      {bill.payment_status === 'paid' && (
                        <span style={{ color: '#16a34a', fontSize: '13px' }}>
                          ✅ Paid on {bill.payment_date
                            ? new Date(bill.payment_date).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      )}
                      {bill.payment_status === 'overdue' && (
                        <span style={{ color: '#dc2626', fontSize: '13px' }}>
                          Overdue
                        </span>
                      )}
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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '26px', fontWeight: '700', color: '#1e3a8a',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  summaryLabel: {
    fontSize: '13px', color: '#6b7280', marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '22px', fontWeight: '700', color: '#1e3a8a',
  },
  cardTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1e3a8a', marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  totalPreview: {
    backgroundColor: '#f0f4f8',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '15px',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  filterTab: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
  },
  activeTab: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: '1px solid #1e3a8a',
  },
};

export default BillingPage;