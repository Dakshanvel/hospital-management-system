
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/patients";

const emptyForm = {
  patientId: "",
  name: "",
  age: "",
  gender: "Male",
  contactNumber: "",
  disease: "",
  diagnosis: "",
  treatment: ""
};

function App() {
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Fetch all patients
  async function fetchPatients() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to load patients.");

      setPatients(await response.json());
    } catch (err) {
      setError("Could not load patients. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  const fetchAllPatients = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load dashboard statistics");
    }

    const data = await response.json();
    setAllPatients(data);
  } catch (error) {
    console.error("Dashboard statistics error:", error);
  }
};

  useEffect(() => {
  fetchPatients();
  fetchAllPatients();
}, []);

  // Update a form field
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Reset form and exit edit mode
  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  // Add a patient or save edited details
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const isEditing = Boolean(editingId);
    const url = isEditing
      ? `${API_URL}/${editingId}`
      : API_URL;

    const payload = {
      ...form,
      age: Number(form.age)
    };

    // Patient ID cannot be changed when editing
    if (isEditing) {
      delete payload.patientId;
    }

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed.");
      }

      setMessage(
        isEditing
          ? "Patient updated successfully!"
          : "Patient registered successfully!"
      );

      resetForm();
      setSearch("");
      await fetchPatients();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  // Search by patient ID or name
  async function handleSearch(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!search.trim()) {
      await fetchPatients();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(search.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed.");
      }

      setPatients(data);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  // Load selected patient into the form
  function handleEdit(patient) {
    setEditingId(patient._id);

    setForm({
      patientId: patient.patientId,
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      disease: patient.disease,
      diagnosis: patient.diagnosis || "",
      treatment: patient.treatment || ""
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete a patient
  async function handleDelete(patient) {
    const confirmed = window.confirm(
      `Delete patient ${patient.name} (${patient.patientId})? This cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${patient._id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      if (editingId === patient._id) resetForm();

      setMessage("Patient deleted successfully!");
      await refreshCurrentList();
    } catch (err) {
      setError(err.message || "Could not delete patient.");
    }
  }

  // Discharge a patient
  async function handleDischarge(patient) {
    const confirmed = window.confirm(
      `Discharge patient ${patient.name} (${patient.patientId})?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${patient._id}/discharge`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Discharge failed.");
      }

      setMessage("Patient discharged successfully!");
      await refreshCurrentList();
    } catch (err) {
      setError(err.message || "Could not discharge patient.");
    }
  }

  // Refresh either the full list or the current search
  async function refreshCurrentList() {
    fetchAllPatients();
    if (search.trim()) {
      await handleSearch({ preventDefault: () => {} });
    } else {
      await fetchPatients();
    }
  }

  const totalPatients = allPatients.length;

const admittedPatients = allPatients.filter(
  (patient) => patient.status === "Admitted"
).length;

const dischargedPatients = allPatients.filter(
  (patient) => patient.status === "Discharged"
).length;

{totalPatients}
{admittedPatients}
{dischargedPatients}

  return (
    <div className="app-background min-vh-100">
      <nav className="navbar navbar-dark hospital-navbar">
        <div className="container">
          <span className="navbar-brand fw-bold">
            CarePoint Hospital
          </span>
          <span className="text-white-50">
            Patient Management System
          </span>
        </div>
      </nav>

      <main className="container py-4 py-md-5">
        <div className="mb-4">
          <h1 className="h2 fw-bold">Hospital Dashboard</h1>
          <p className="text-secondary">
            Register, search and manage patient records.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <p className="text-secondary mb-1">Total Patients</p>
                <h2 className="fw-bold mb-0">{patients.length}</h2>
                <small className="text-secondary">
                  Count of currently displayed records
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <p className="text-secondary mb-1">Currently Admitted</p>
                <h2 className="fw-bold mb-0">
                  {patients.filter(
                    (patient) => patient.status === "Admitted"
                  ).length}
                </h2>
                <small className="text-secondary">
                  Count of displayed admitted records
                </small>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h2 className="h5 mb-0">
              {editingId ? "Update Patient Details" : "Register New Patient"}
            </h2>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="patientId">
                    Patient ID
                  </label>
                  <input
                    id="patientId"
                    name="patientId"
                    className="form-control"
                    value={form.patientId}
                    onChange={handleChange}
                    disabled={Boolean(editingId)}
                    required
                  />
                  {editingId && (
                    <small className="text-secondary">
                      Patient ID cannot be changed.
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-select"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="contactNumber">
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Enter a 10-digit contact number"
                    className="form-control"
                    value={form.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="disease">
                    Disease
                  </label>
                  <input
                    id="disease"
                    name="disease"
                    className="form-control"
                    value={form.disease}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="diagnosis">
                    Diagnosis
                  </label>
                  <input
                    id="diagnosis"
                    name="diagnosis"
                    className="form-control"
                    value={form.diagnosis}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="treatment">
                    Treatment Details
                  </label>
                  <textarea
                    id="treatment"
                    name="treatment"
                    className="form-control"
                    rows="2"
                    value={form.treatment}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {editingId ? "Save Changes" : "Register Patient"}
                  </button>

                  {editingId && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h2 className="h5 mb-3">Patient Records</h2>

            <form onSubmit={handleSearch} className="d-flex gap-2">
              <input
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by patient ID or name"
                aria-label="Search patients"
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setSearch("");
                  setMessage("");
                  fetchPatients();
                }}
              >
                Reset
              </button>
            </form>
          </div>

          <div className="card-body">
            {loading ? (
              <p>Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="text-secondary mb-0">
                No matching patients found.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Disease</th>
                      <th>Diagnosis</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.patientId}</td>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>{patient.disease}</td>
                        <td>{patient.diagnosis || "—"}</td>
                        <td>
                          <span
                            className={`badge ${
                              patient.status === "Admitted"
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(patient)}
                              type="button"
                            >
                              Edit
                            </button>

                            {patient.status === "Admitted" && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleDischarge(patient)}
                                type="button"
                              >
                                Discharge
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(patient)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
