import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

export default function LeaveApplication() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalApplications: 0,
    approvedCount: 0,
    pendingCount: 0,
  });

  const [balances, setBalances] = useState({
    annual_leave: 60,
    sick_leave: 20,
    maternity_leave: 60,
    casual_leave: 30,
  });

  const [loading, setLoading] = useState(true);

  const leaves = [
    {
      title: "Annual Leave",
      path: "/apply-leave/Annual",
      icon: "🌴",
      color: "annual",
      days: balances.annual_leave || 0,
    },
    {
      title: "Sick Leave",
      path: "/apply-leave/Sick",
      icon: "💊",
      color: "sick",
      days: balances.sick_leave || 0,
    },
    {
      title: "Maternity Leave",
      path: "/apply-leave/Maternity",
      icon: "👶",
      color: "maternity",
      days: balances.maternity_leave || 0,
    },
    {
      title: "Casual Leave",
      path: "/apply-leave/Casual",
      icon: "☕",
      color: "casual",
      days: balances.casual_leave || 0,
    },
  ];

  useEffect(() => {
    fetchLeaveSummary();
  }, []);

  const fetchLeaveSummary = async () => {
    try {
      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("adminToken");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:10000/api/leaves/my-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
        setLoading(false);
        return;
      }

      setLeaveHistory(data.leaveHistory || []);
      setSummary({
        totalApplications: data.totalApplications || 0,
        approvedCount: data.approvedCount || 0,
        pendingCount: data.pendingCount || 0,
      });
      setBalances(data.balances || {});
      setLoading(false);
    } catch (error) {
      console.log("FETCH LEAVE SUMMARY ERROR:", error);
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return leaveHistory.filter((item) => {
      const value = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(value) ||
        item.type?.toLowerCase().includes(value) ||
        item.reason?.toLowerCase().includes(value) ||
        item.status?.toLowerCase().includes(value)
      );
    });
  }, [leaveHistory, search]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  const exportToCSV = () => {
    if (filteredHistory.length === 0) {
      alert("No leave history to export");
      return;
    }

    const headers = [
      "Name",
      "Duration",
      "Start Date",
      "End Date",
      "Type",
      "Reason",
      "Status",
    ];

    const rows = filteredHistory.map((item) => [
      item.name,
      item.duration,
      formatDate(item.start_date),
      formatDate(item.end_date),
      item.type,
      item.reason,
      item.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        body { background: linear-gradient(135deg, #eef4fb, #f8fbff); }
        .leave-page { padding: 24px 0 40px; }
        .leave-wrapper {
          background: rgba(255,255,255,0.9);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .breadcrumb-text { font-size: 14px; color: #64748b; margin-bottom: 12px; }
        .breadcrumb-link { cursor: pointer; color: #2563eb; font-weight: 600; }
        .page-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }
        .page-title h4 { margin: 0; font-weight: 700; color: #0f172a; }
        .page-title p { margin: 6px 0 0; color: #64748b; font-size: 14px; }

        .summary-card {
          background: linear-gradient(135deg, #ffffff, #f8fbff);
          border-radius: 18px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          height: 100%;
        }
        .summary-label { font-size: 13px; color: #64748b; margin-bottom: 8px; }
        .summary-value { font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1; }

        .leave-card {
          color: white;
          border-radius: 20px;
          padding: 20px;
          min-height: 170px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        }
        .leave-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(15, 23, 42, 0.18);
        }
        .leave-card.annual { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
        .leave-card.sick { background: linear-gradient(135deg, #0f766e, #14b8a6); }
        .leave-card.maternity { background: linear-gradient(135deg, #9333ea, #c084fc); }
        .leave-card.casual { background: linear-gradient(135deg, #ea580c, #fb923c); }

        .leave-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .leave-icon { font-size: 28px; opacity: 0.95; }
        .leave-circle {
          background: rgba(255,255,255,0.18);
          color: white;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        .leave-card-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .leave-card-sub { font-size: 13px; opacity: 0.9; }

        .apply-btn {
          background: white;
          color: #0f172a;
          border: none;
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          align-self: flex-start;
        }

        .history-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          margin-top: 26px;
          border: 1px solid #edf2f7;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
        }

        .history-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .history-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          width: 100%;
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .search-box input {
          border-radius: 12px;
          min-height: 44px;
          border: 1px solid #dbe4ee;
        }

        .export-btn {
          background: linear-gradient(135deg, #15803d, #22c55e);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 700;
        }

        .leave-table thead th {
          background: #eff6ff;
          color: #334155;
          border: none;
          font-size: 14px;
          font-weight: 700;
          padding: 14px;
        }

        .leave-table tbody td {
          padding: 14px;
          vertical-align: middle;
          color: #334155;
          border-color: #eef2f7;
          font-size: 14px;
        }

        .type-badge, .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .type-badge { background: #e0f2fe; color: #0369a1; }
        .status-approved { background: #dcfce7; color: #15803d; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-rejected { background: #fee2e2; color: #b91c1c; }

        .action-btn {
          background: #1e3a8a;
          color: white;
          border-radius: 10px;
          padding: 7px 14px;
          border: none;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>

      <Header />

      <div className="container leave-page">
        <div className="leave-wrapper">
          <div className="breadcrumb-text">
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/employeedashboard")}
            >
              Dashboard
            </span>{" "}
            &gt; <span>Apply for Leave</span>
          </div>

          <div className="page-top">
            <div className="page-title">
              <h4>Leave Application</h4>
              <p>Apply for leave, track requests, and review your leave history.</p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="summary-card">
                <div className="summary-label">Total Applications</div>
                <div className="summary-value">{summary.totalApplications}</div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="summary-card">
                <div className="summary-label">Approved Leaves</div>
                <div className="summary-value">{summary.approvedCount}</div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-xl-4">
              <div className="summary-card">
                <div className="summary-label">Pending Requests</div>
                <div className="summary-value">{summary.pendingCount}</div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            {leaves.map((item, index) => (
              <div className="col-12 col-sm-6 col-xl-3" key={index}>
                <div
                  className={`leave-card ${item.color}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="leave-card-top">
                    <div>
                      <div className="leave-icon">{item.icon}</div>
                      <div className="leave-card-title mt-2">{item.title}</div>
                      <div className="leave-card-sub">
                        Available up to {item.days} days
                      </div>
                    </div>
                    <div className="leave-circle">{item.days}</div>
                  </div>

                  <button
                    className="apply-btn mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="history-card">
            <div className="history-top">
              <h5>Leave History</h5>

              <div className="history-controls">
                <div className="search-box">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by type, reason, status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button className="export-btn" onClick={exportToCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table leave-table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Duration</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No leave history found
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.duration} day(s)</td>
                        <td>{formatDate(item.start_date)}</td>
                        <td>{formatDate(item.end_date)}</td>
                        <td>
                          <span className="type-badge">{item.type}</span>
                        </td>
                        <td>{item.reason}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              item.status === "Approved"
                                ? "status-approved"
                                : item.status === "Pending"
                                ? "status-pending"
                                : "status-rejected"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/leave-view/${item.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}