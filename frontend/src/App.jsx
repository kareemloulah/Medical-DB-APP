import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AddPatient from './components/AddPatient';
import PatientsList from './components/PatientsList';
import PatientDetails from './components/PatientDetails';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handleNavigate = (page, patientId = null) => {
    setCurrentPage(page);
    setSelectedPatientId(patientId);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'add-patient':
        return <AddPatient onNavigate={handleNavigate} />;
      case 'edit-patient':
        return <AddPatient 
          onNavigate={handleNavigate} 
          patientId={selectedPatientId} 
          isEditing={true}
        />;
      case 'patients-list':
        return <PatientsList onNavigate={handleNavigate} />;
      case 'patient-details':
        return <PatientDetails 
          patientId={selectedPatientId}
          onNavigate={handleNavigate}
        />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;