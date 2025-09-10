import { useState, useEffect } from "react";
import { patientsAPI } from "../services/api";
import "./PatientList.css";
const PatientsList = ({ onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("");
  const [operationFilter, setoperationFilter] = useState("");
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterAndSortPatients();
  }, [
    patients,
    searchTerm,
    diagnosisFilter,
    operationFilter,
    ageRange,
    sortBy,
    sortOrder,
  ]);

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAllPatients();
      setPatients(response.data.data);
    } catch (err) {
      setError("Error loading patients");
      console.error("Patients list error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.relatives.some((rel) => rel.includes(searchTerm))
      );
    }
    // Diagnosis filter
    if (diagnosisFilter) {
      filtered = filtered.filter((patient) =>
        patient.diagnosis.toLowerCase().includes(diagnosisFilter.toLowerCase())
      );
    }
    // Operation filter
    if (operationFilter) {
      filtered = filtered.filter((patient) =>
        patient.operation.toLowerCase().includes(operationFilter.toLowerCase())
      );
    }
    // Age range filter
    if (ageRange.min) {
      filtered = filtered.filter(
        (patient) => patient.age >= parseInt(ageRange.min)
      );
    }
    if (ageRange.max) {
      filtered = filtered.filter(
        (patient) => patient.age <= parseInt(ageRange.max)
      );
    }
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "age":
          aValue = a.age;
          bValue = b.age;
          break;
        case "diagnosis":
          aValue = a.diagnosis.toLowerCase();
          bValue = b.diagnosis.toLowerCase();
          break;
        case "operation":
          aValue = a.operation.toLowerCase();
          bValue = b.operation.toLowerCase();
          break;
        default: // name
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete ${patientName}?`)) {
      try {
        await patientsAPI.deletePatient(patientId);
        setPatients(patients.filter((p) => p._id !== patientId));
      } catch (err) {
        alert("Error deleting patient");
        console.error("Delete error:", err);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDiagnosisFilter("");
    setoperationFilter("");
    setAgeRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
  };

  if (loading) {
    return (
      <div className="page active">
        <div className="container">
          <div className="loading">Loading patients...</div>
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
        <div className="page-header">
          <h1>Patients List</h1>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("add-patient")}
          >
            Add New Patient
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Search by name or phone:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter name or phone number..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Filter by diagnosis:</label>
              <input
                type="text"
                value={diagnosisFilter}
                onChange={(e) => setDiagnosisFilter(e.target.value)}
                placeholder="Enter diagnosis keyword..."
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Filter by operation:</label>
              <input
                type="text"
                value={operationFilter}
                onChange={(e) => setoperationFilter(e.target.value)}
                placeholder="Enter operation keyword..."
                className="filter-input"
              />
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Age range:</label>
              <div className="age-range">
                <input
                  type="number"
                  value={ageRange.min}
                  onChange={(e) =>
                    setAgeRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  placeholder="Min"
                  className="age-input"
                />
                <span>to</span>
                <input
                  type="number"
                  value={ageRange.max}
                  onChange={(e) =>
                    setAgeRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  placeholder="Max"
                  className="age-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name</option>
                <option value="age">Age</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="operation">Operation</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="results-info">
          <p>
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <p>No patients found matching your criteria.</p>
            {patients.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("add-patient")}
              >
                Add Your First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map((patient) => (
              <div key={patient._id} className="patient-card">
                {patient.picture && (
                  <div className="patient-image">
                    <img
                      src={`https://localhost/${patient.picture}`}
                      alt={patient.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p className="patient-age">Age: {patient.age}</p>
                  <p className="patient-diagnosis"> Diag: 
                    {patient.diagnosis.length > 120
                      ? patient.diagnosis.substring(0, 120) + "..."
                      : patient.diagnosis}
                  </p>
                  <p className="patient-diagnosis"> OP: 
                    {patient.operation.length > 120
                      ? patient.operation.substring(0, 120) + "..."
                      : patient.operation}
                  </p>
                  <p className="relatives-info">
                    {patient.relatives?.length || 0} relative(s) on file
                  </p>
                </div>

                <div className="patient-actions">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => onNavigate("patient-details", patient._id)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => onNavigate("edit-patient", patient._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(patient._id, patient.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;
