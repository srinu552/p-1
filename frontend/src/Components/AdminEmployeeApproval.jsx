import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminEmployeeApproval() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/pending-employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = res.data;
      const employeeList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      setEmployees(employeeList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionId(id);

      const token = localStorage.getItem("adminToken");

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/approve-employee/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Employee approved successfully");

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, approval_status: "approved" } : emp
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);

      const token = localStorage.getItem("adminToken");

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/reject-employee/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Employee rejected successfully");

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, approval_status: "rejected" } : emp
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="container py-4">
      <style>{`
        .approval-card {
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
          border: none;
        }
        .page-title {
          color: #233a8b;
          font-weight: 700;
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          text-transform: capitalize;
        }
        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        .table thead th {
          background: #233a8b;
          color: #fff;
          vertical-align: middle;
          font-size: 14px;
        }
        .table td {
          vertical-align: middle;
          font-size: 14px;
        }
        .btn-approve {
          background: #233a8b;
          color: #fff;
          border: none;
        }
        .btn-approve:hover {
          background: #1a2f73;
          color: #fff;
        }
        .btn-reject {
          background: #dc2626;
          color: #fff;
          border: none;
        }
        .btn-reject:hover {
          background: #b91c1c;
          color: #fff;
        }
      `}</style>

      <div className="card approval-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h3 className="page-title m-0">Employee Approval Management</h3>
          <button className="btn btn-outline-primary" onClick={fetchEmployees}>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-4">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="alert alert-info mb-0">No employees found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp.id}>
                    <td>{index + 1}</td>
                    <td>{emp.employee_id || "N/A"}</td>
                    <td>{emp.name || "N/A"}</td>
                    <td>{emp.email || "N/A"}</td>
                    <td>{emp.dept || "N/A"}</td>
                    <td>{emp.job_title || "N/A"}</td>
                    <td>{emp.phone || "N/A"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          emp.approval_status === "approved"
                            ? "status-approved"
                            : emp.approval_status === "rejected"
                            ? "status-rejected"
                            : "status-pending"
                        }`}
                      >
                        {emp.approval_status || "pending"}
                      </span>
                    </td>
                    <td>
                      {emp.approval_status === "approved" ? (
                        <button className="btn btn-success btn-sm" disabled>
                          Approved
                        </button>
                      ) : emp.approval_status === "rejected" ? (
                        <button className="btn btn-danger btn-sm" disabled>
                          Rejected
                        </button>
                      ) : (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-approve btn-sm"
                            onClick={() => handleApprove(emp.id)}
                            disabled={actionId === emp.id}
                          >
                            {actionId === emp.id ? "Processing..." : "Approve"}
                          </button>

                          <button
                            className="btn btn-reject btn-sm"
                            onClick={() => handleReject(emp.id)}
                            disabled={actionId === emp.id}
                          >
                            {actionId === emp.id ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );  
}

export default AdminEmployeeApproval;