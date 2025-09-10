import { useState } from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, onNavigate }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">⚕</div>
            <span className="logo-text">MedTracker</span>
          </div>
          <nav className="nav">
            <button 
              className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${currentPage === 'add-patient' ? 'active' : ''}`}
              onClick={() => onNavigate('add-patient')}
            >
              Add Patient
            </button>
            <button 
              className={`nav-item ${currentPage === 'patients-list' ? 'active' : ''}`}
              onClick={() => onNavigate('patients-list')}
            >
              Patients List
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;