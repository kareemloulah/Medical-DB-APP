import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';
import './PatientDetails.css';

const PatientDetails = ({ patientId, onNavigate }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getPatientById(patientId);
      setPatient(response.data);
    } catch (err) {
      setError('Error loading patient details');
      console.error('Patient details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      try {
        await patientsAPI.deletePatient(patientId);
        onNavigate('patients-list');
      } catch (err) {
        alert('Error deleting patient');
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="container">
          <div className="loading">Loading patient details...</div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="page active">
        <div className="container">
          <div className="error-message">
            {error || 'Patient not found'}
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('patients-list')}
          >
            Back to Patients List
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page active">
      <div className="container">
        <div className="page-header">
          <div>
            <button 
              className="btn btn-secondary back-btn"
              onClick={() => onNavigate('patients-list')}
            >
              ← Back to Patients
            </button>
            <h1>Patient Details</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('edit-patient', patient._id)}
            >
              Edit Patient
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete Patient
            </button>
          </div>
        </div>

        <div className="patient-details">
          <div className="details-grid">
            {/* Basic Information */}
            <div className="detail-section">
              <h2>Basic Information</h2>
              <div className="detail-content">
                {patient.picture && (
                  <div className="patient-photo">
                    <img 
                      src={`https://localhost/${patient.picture}`} 
                      alt={patient.name}
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="basic-info">
                  <div className="info-item">
                    <label>Full Name:</label>
                    <span>{patient.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Age:</label>
                    <span>{patient.age} years old</span>
                  </div>
                  <div className="info-item">
                    <label>Patient ID:</label>
                    <span className="patient-id">{patient._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Added:</label>
                    <span>{formatDate(patient.createdAt)}</span>
                  </div>
                  {patient.updatedAt !== patient.createdAt && (
                    <div className="info-item">
                      <label>Last Updated:</label>
                      <span>{formatDate(patient.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="detail-section">
              <h2>Details</h2>
              <div className="detail-content">
                <div className="diagnosis-text">
                  {patient.details}
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h2>Operation</h2>
              <div className="detail-content">
                <div className="diagnosis-text">
                  {patient.operation}
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h2>Diagnosis</h2>
              <div className="detail-content">
                <div className="diagnosis-text">
                  {patient.diagnosis}
                </div>
              </div>
            </div>            

            {/* Relatives */}
            <div className="detail-section">
              <h2>Emergency Contacts</h2>
              <div className="detail-content">
                {patient.relatives && patient.relatives.length > 0 ? (
                  <div className="relatives-list">
                    {patient.relatives.map((relative, index) => (
                      <div key={index} className="relative-item">
                        <div className="relative-icon">📞</div>
                        <div className="relative-info">
                          <span className="relative-number">{relative}</span>
                          <div className="relative-actions">
                            <a href={`tel:${relative}`} className="btn btn-small">
                              Call
                            </a>
                            <a href={`sms:${relative}`} className="btn btn-small">
                              SMS
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-relatives">
                    <p>No emergency contacts on file</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => onNavigate('edit-patient', patient._id)}
                    >
                      Add Emergency Contacts
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('edit-patient', patient._id)}
            >
              Edit Patient Information
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('patients-list')}
            >
              Return to Patients List
            </button>
            <button 
              className="btn btn-secondary"
               onClick={() => window.print()}
            >
              Print Patient Record
           </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;