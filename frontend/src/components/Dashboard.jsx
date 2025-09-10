import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    averageAge: 0,
    totalRelatives: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await patientsAPI.getAllPatients();
      const patients = response.data.data;
      // Calculate statistics
      const totalPatients = patients.length;
      const averageAge = totalPatients > 0 
        ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / totalPatients)
        : 0;
      const totalRelatives = patients.reduce((sum, p) => sum + (p.relatives?.length || 0), 0);

      setStats({
        totalPatients,
        averageAge,
        totalRelatives
      });

      // Get 5 most recent patients
      setRecentPatients(patients.slice(0, 5));

    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page active">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="container">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalPatients}</h3>
              <p className="stat-label">Total Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.averageAge}</h3>
              <p className="stat-label">Average Age</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalRelatives}</h3>
              <p className="stat-label">Total Relatives</p>
            </div>
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Patients</h2>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('patients-list')}
            >
              View All
            </button>
          </div>

          {recentPatients.length === 0 ? (
            <div className="empty-state">
              <p>No patients found. Add your first patient to get started!</p>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('add-patient')}
              >
                Add First Patient
              </button>
            </div>
          ) : (
            <div className="recent-patients">
              {recentPatients.map(patient => (
                <div key={patient._id} className="patient-card">
                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p className="patient-age">Age: {patient.age}</p>
                    <p className="patient-diagnosis">
                      {patient.diagnosis.length > 100 
                        ? patient.diagnosis.substring(0, 100) + '...'
                        : patient.diagnosis
                      }
                    </p>
                  </div>
                  <div className="patient-meta">
                    <span className="relatives-count">
                      {patient.relatives?.length || 0} relatives
                    </span>
                    <button 
                      className="btn btn-small"
                      onClick={() => onNavigate('patient-details', patient._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => onNavigate('add-patient')}
            >
              <span className="action-icon">➕</span>
              <span>Add New Patient</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => onNavigate('patients-list')}
            >
              <span className="action-icon">📋</span>
              <span>View All Patients</span>
            </button>
            <button 
              className="action-btn"
              onClick={fetchDashboardData}
            >
              <span className="action-icon">🔄</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;