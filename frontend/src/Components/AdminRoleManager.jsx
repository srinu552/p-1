import { useState } from "react";
import "./AdminRoleManager.css";

export default function AdminRoleManager() {
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("employee");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchEmployee = async () => {
    if (!employeeId.trim()) {
      setError("Please enter Employee ID");
      setEmployee(null);
      return;
    }

    try {
      setSearching(true);
      setError("");
      setMessage("");
      setEmployee(null);

      const res = await fetch(
        `http://localhost:10000/api/roles/employee/${employeeId.trim()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Employee not found");
        return;
      }

      setEmployee(data);
      setRole(data.role || "employee");
    } catch (err) {
      setError("Failed to fetch employee details");
    } finally {
      setSearching(false);
    }
  };

  const updateRole = async () => {
    if (!employeeId.trim()) {
      setError("Please enter Employee ID");
      return;
    }

    if (!employee) {
      setError("Search employee first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await fetch("http://localhost:10000/api/roles/promote", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          newRole: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update role");
        return;
      }

      setMessage(data.message || "Role updated successfully!");

      setEmployee((prev) => (prev ? { ...prev, role } : prev));
    } catch (err) {
      setError("Server error while updating role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-manager-wrapper">
      <div className="role-manager-card">
        <h2 className="role-manager-title">Role Management</h2>

        <label className="role-manager-label">Employee ID</label>

        <div className="role-search-row">
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter Employee ID (ex: PA-EMP-1XXX)"
            className="role-manager-input"
          />

          <button
            onClick={fetchEmployee}
            disabled={searching}
            className="role-manager-btn search-btn"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {employee && (
          <div className="employee-details-card">
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Department:</strong> {employee.dept}</p>
            <p><strong>Job Title:</strong> {employee.job_title}</p>
            <p><strong>Current Role:</strong> {employee.role}</p>
          </div>
        )}

        <label className="role-manager-label">Select New Role</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="role-manager-select"
        >
          <option value="employee">Employee</option>
          <option value="teamlead">Team Lead</option>
          <option value="manager">Manager</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={updateRole}
          disabled={loading || !employee}
          className={`role-manager-btn update-btn ${
            loading || !employee ? "disabled-btn" : ""
          }`}
        >
          {loading ? "Updating..." : "Update Role"}
        </button>

        {error && <p className="role-message error-message">{error}</p>}
        {message && <p className="role-message success-message">{message}</p>}
      </div>
    </div>
  );
}