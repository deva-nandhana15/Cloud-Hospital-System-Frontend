import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { doctorService } from '../../services/doctorService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const emptyDoctorForm = () => ({
  full_name: '',
  email: '',
  password: '',
  specialization: '',
  phone: '',
  qualification: '',
  experience_years: '',
  consultation_fee: '',
  available_days: '',
});

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(() => emptyDoctorForm());

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
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
      // Step 1: Register user
      const userResponse = await authService.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: 'doctor',
      });
      // Step 2: Create doctor profile
      await doctorService.createDoctor({
        user_id: userResponse.id,
        specialization: formData.specialization,
        phone: formData.phone,
        qualification: formData.qualification,
        experience_years: parseInt(formData.experience_years),
        consultation_fee: parseFloat(formData.consultation_fee),
        available_days: formData.available_days,
      });
      toast.success('Doctor added successfully!');
      setShowForm(false);
      setFormData(emptyDoctorForm());
      loadDoctors();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add doctor');
    }
  };

  return (
    <Layout>
      <div>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>👨‍⚕️ Manage Doctors</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Doctor'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Add New Doctor</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name"
                    value={formData.full_name}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email"
                    value={formData.email}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password"
                    value={formData.password}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" name="specialization"
                    value={formData.specialization}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone"
                    value={formData.phone}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Qualification</label>
                  <input type="text" name="qualification"
                    value={formData.qualification}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input type="number" name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Available Days</label>
                  <input type="text" name="available_days"
                    placeholder="e.g. Monday, Wednesday, Friday"
                    value={formData.available_days}
                    onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Add Doctor
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h2 style={styles.cardTitle}>All Doctors ({doctors.length})</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No doctors added yet
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Available Days</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.full_name}</td>
                    <td>{d.specialization || 'N/A'}</td>
                    <td>{d.qualification || 'N/A'}</td>
                    <td>{d.experience_years || 0} yrs</td>
                    <td>₹{d.consultation_fee || 0}</td>
                    <td>{d.available_days || 'N/A'}</td>
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
  cardTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1e3a8a', marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
};

export default ManageDoctors;