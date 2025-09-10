import axios from 'axios';

const API_BASE_URL = 'https://localhost/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const patientsAPI = {
  // Get all patients
  getAllPatients: () => api.get('/patients'),

  // Get patient by ID
  getPatientById: (id) => api.get(`/patients/${id}`),

  // Add new patient
  addPatient: (patientData) => {
    const formData = new FormData();
    formData.append('name', patientData.name);
    formData.append('age', patientData.age);
    formData.append('diagnosis', patientData.diagnosis);
    formData.append('operation', patientData.operation);
    formData.append('details', patientData.details);
    formData.append('relatives', JSON.stringify(patientData.relatives));

    if (patientData.picture) {
      formData.append('picture', patientData.picture);
    }

    return api.post('/patients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update patient
  updatePatient: (id, patientData) => {
    const formData = new FormData();
    formData.append('name', patientData.name);
    formData.append('age', patientData.age);
    formData.append('diagnosis', patientData.diagnosis);
    formData.append('operation', patientData.operation);
    formData.append('details', patientData.details);
    formData.append('relatives', JSON.stringify(patientData.relatives));

    if (patientData.picture) {
      formData.append('picture', patientData.picture);
    }

    return api.put(`/patients/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete patient
  deletePatient: (id) => api.delete(`/patients/${id}`)
};