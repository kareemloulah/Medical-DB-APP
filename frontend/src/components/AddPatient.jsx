import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';
import './AddPatient.css';

const AddPatient = ({ onNavigate, patientId, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    diagnosis: '',
    operation:'',
    details:'',
    picture: null,
    relatives: ['']
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Load patient data if editing
  useEffect(() => {
    if (isEditing && patientId) {
      loadPatientData();
    }
  }, [isEditing, patientId]);

  const loadPatientData = async () => {
    try {
      const response = await patientsAPI.getPatientById(patientId);
      const patient = response.data;

      setFormData({
        name: patient.name || '',
        age: patient.age || '',
        diagnosis: patient.diagnosis || '',
        operation: patient.operation || '',
        details: patient.details || '',
        picture: null, // Don't load existing picture for editing
        relatives: patient.relatives?.length ? patient.relatives : ['']
      });
    } catch (error) {
      setMessage('Error loading patient data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      picture: e.target.files[0]
    }));
  };

  const handleRelativeChange = (index, value) => {
    const newRelatives = [...formData.relatives];
    newRelatives[index] = value;
    setFormData(prev => ({
      ...prev,
      relatives: newRelatives
    }));
  };

  const addRelativeField = () => {
    setFormData(prev => ({
      ...prev,
      relatives: [...prev.relatives, '']
    }));
  };

  const removeRelativeField = (index) => {
    const newRelatives = formData.relatives.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      relatives: newRelatives
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty relatives
      const validRelatives = formData.relatives.filter(rel => rel.trim());

      if (isEditing) {
        await patientsAPI.updatePatient(patientId, {
          ...formData,
          relatives: validRelatives
        });
        setMessage('Patient updated successfully!');
        setTimeout(() => onNavigate('patient-details', patientId), 2000);
      } else {
        await patientsAPI.addPatient({
          ...formData,
          relatives: validRelatives
        });
        setMessage('Patient added successfully!');
        setFormData({
          name: '',
          age: '',
          diagnosis: '',
          operation:'',
          details:'',
          picture: null,
          relatives: ['']
        });

        // Clear file input
        const fileInput = document.getElementById('picture');
        if (fileInput) fileInput.value = '';
      }

    } catch (error) {
      setMessage('Error saving patient: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="page active">
        <div className="container">
          <div className="loading">Loading patient data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="container">
        <div className="page-header">
          <h2>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
          {isEditing && (
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('patient-details', patientId)}
            >
              Cancel
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-group">
            <label htmlFor="name">Patient Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              min="0"
              max="120"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="diagnosis">Diagnosis *</label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="operation">Operation *</label>
            <textarea
              id="operation"
              name="operation"
              value={formData.operation}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="details">Details *</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="picture">Patient Picture</label>
            <input
              type="file"
              id="picture"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label>Relatives' Phone Numbers</label>
            {formData.relatives.map((relative, index) => (
              <div key={index} className="relative-input">
                <input
                  type="tel"
                  value={relative}
                  onChange={(e) => handleRelativeChange(index, e.target.value)}
                  placeholder="+1-555-123-4567"
                />
                {formData.relatives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRelativeField(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addRelativeField} className="add-relative-btn">
              Add Another Relative
            </button>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (isEditing ? 'Updating...' : 'Adding Patient...') : (isEditing ? 'Update Patient' : 'Add Patient')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;