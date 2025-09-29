import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPage.css";

export default function AdminPage() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const API_URL = "http://localhost:5000";

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/registrations`);
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return alert("No registrations selected!");
    if (!window.confirm("Delete selected registrations?")) return;
    await axios.post(`${API_URL}/api/registrations/delete`, { ids: selectedIds });
    setSelectedIds([]);
    fetchRegistrations();
  };

  const deleteAll = async () => {
    if (!window.confirm("Delete all registrations?")) return;
    await axios.delete(`${API_URL}/api/registrations/deleteAll`);
    setSelectedIds([]);
    fetchRegistrations();
  };

  const downloadExcel = () => {
    window.open(`${API_URL}/api/download-excel`, "_blank");
  };

  return (
    <div className="admin-container">
      <h1>Welcome, Admin</h1>
      <div className="admin-actions">
        <button onClick={downloadExcel}>Download Excel</button>
        <button onClick={deleteSelected} disabled={selectedIds.length === 0}>Delete Selected</button>
        <button onClick={deleteAll}>Delete All</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Organization</th>
            <th>Designation</th>
            <th>Registered On</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 ? (
            <tr><td colSpan="7">No registrations found.</td></tr>
          ) : (
            registrations.map(reg => (
              <tr key={reg._id}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(reg._id)} onChange={() => toggleSelect(reg._id)} />
                </td>
                <td>{reg.name}</td>
                <td>{reg.phone}</td>
                <td>{reg.email}</td>
                <td>{reg.organization}</td>
                <td>{reg.designation}</td>
                <td>{new Date(reg.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
