import React, { useEffect, useState } from "react";

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setErrorMsg("Admin token not found. Please login again.");
        setLeaves([]);
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:10000/api/leaves/admin/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        setErrorMsg("Server did not return valid JSON.");
        setLeaves([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to fetch leave requests.");
        setLeaves([]);
        setLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        setLeaves(data);
      } else {
        setLeaves([]);
        setErrorMsg("API response is not an array.");
      }

      setLoading(false);
    } catch (error) {
      console.log("FETCH ADMIN LEAVES ERROR:", error);
      setErrorMsg("Something went wrong while fetching leave requests.");
      setLeaves([]);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Admin token not found. Please login again.");
        return;
      }

      const res = await fetch(
        `http://localhost:10000/api/leaves/admin/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            admin_remark: `${status} by admin`,
          }),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        alert("Server did not return valid JSON");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to update");
        return;
      }

      alert(data.message || `Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (error) {
      console.log("UPDATE STATUS ERROR:", error);
      alert("Something went wrong while updating status");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
  };

  return (
    <>
      <style>{`
        body {
          background: #eef4fb;
        }

        .admin-leave-page {
          padding: 24px;
        }

        .admin-leave-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }

        .admin-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .status-box {
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .status-loading {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .empty-box {
          text-align: center;
          padding: 30px;
          color: #64748b;
          font-size: 15px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .leave-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        .leave-table th {
          background: #eff6ff;
          color: #334155;
          text-align: left;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          border-bottom: 1px solid #dbeafe;
        }

        .leave-table td {
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }

        .leave-table tr:hover {
          background: #f8fbff;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .pending {
          background: #fef3c7;
          color: #b45309;
        }

        .approved {
          background: #dcfce7;
          color: #15803d;
        }

        .rejected {
          background: #fee2e2;
          color: #b91c1c;
        }

        .btn-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-approve {
          background: #16a34a;
          color: white;
        }

        .btn-reject {
          background: #dc2626;
          color: white;
        }

        .done-text {
          color: #64748b;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .admin-leave-page {
            padding: 14px;
          }

          .admin-leave-card {
            padding: 16px;
            border-radius: 14px;
          }

          .admin-title {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="admin-leave-page">
        <div className="admin-leave-card">
          <div className="admin-title">Admin Leave Management</div>

          {loading && (
            <div className="status-box status-loading">Loading leave requests...</div>
          )}

          {!loading && errorMsg && (
            <div className="status-box status-error">{errorMsg}</div>
          )}

          {!loading && !errorMsg && leaves.length === 0 && (
            <div className="empty-box">No leave requests found</div>
          )}

          {!loading && !errorMsg && leaves.length > 0 && (
            <div className="table-wrap">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Duration</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>{item.leave_type || "-"}</td>
                      <td>{item.reason || "-"}</td>
                      <td>{item.duration ?? "-"}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.end_date)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            item.status === "Approved"
                              ? "approved"
                              : item.status === "Rejected"
                              ? "rejected"
                              : "pending"
                          }`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        {item.status === "Pending" ? (
                          <div className="btn-group">
                            <button
                              className="btn btn-approve"
                              onClick={() => updateStatus(item.id, "Approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-reject"
                              onClick={() => updateStatus(item.id, "Rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="done-text">Done</span>
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
    </>
  );
}