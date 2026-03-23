import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";

function AdminAttendance() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(
          "http://localhost:10000/api/attendance/admin",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/login";
          return;
        }

        if (res.status === 403) {
          console.log("Forbidden: only admin can access");
          return;
        }

        if (res.ok) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        console.log("FETCH ERROR:", error);
      }
    };

    fetchData();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase());

      const matchesDate = selectedDate ? item.date === selectedDate : true;

      return matchesSearch && matchesDate;
    });
  }, [data, search, selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "Attendance.xlsx");
  };

  return (
    <div className="container-fluid mt-4">
      <style>{`
        .attendance-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .present { background: #16a34a; }
        .absent { background: #dc2626; }

        .pagination button {
          margin: 0 5px;
          padding: 5px 10px;
          border: none;
          border-radius: 6px;
          background: #e5e7eb;
        }

        .pagination .active-page {
          background: #1e40af;
          color: white;
        }

        .mobile-card { display: none; }

        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-card { display: block; }

          .mobile-attendance-item {
            background: #ffffff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          }
        }
      `}</style>

      <div className="attendance-card">
        <h4 className="mb-3">Employee Attendance</h4>

        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3 mb-2">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="col-md-3 mb-2">
            <button
              className="btn btn-success w-100"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div className="table-responsive desktop-table">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Records Found
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.date}</td>
                    <td>
                      {item.login_time
                        ? new Date(item.login_time).toLocaleTimeString()
                        : "Not Logged In"}
                    </td>
                    <td>
                      {item.logout_time
                        ? new Date(item.logout_time).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td>{item.duration || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "Present" ? "present" : "absent"
                        }`}
                      >
                        {item.status || "Absent"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-card">
          {currentData.map((item, index) => (
            <div key={index} className="mobile-attendance-item">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Email:</strong> {item.email}</p>
              <p><strong>Date:</strong> {item.date}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    item.status === "Present" ? "present" : "absent"
                  }`}
                >
                  {item.status || "Absent"}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="pagination mt-3 text-center">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active-page" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAttendance;