import React, { useEffect, useState } from "react";
import Header from "../SmallComponents/Header";

function EmployeeAttendance() {
  const [employeeName, setEmployeeName] = useState("");
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState(null);

  /* ================= CHECK AUTH ON LOAD ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    const token = localStorage.getItem("employeeToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeName(user.name);
    }

    fetchTodayAttendance();
  }, []);

  /* ================= COMMON FETCH FUNCTION ================= */
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("employeeToken");

    if (!token) {
      window.location.href = "/login";
      return null;
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("employeeToken");
      localStorage.removeItem("employeeUser");
      window.location.href = "/login";
      return null;
    }

    if (res.status === 403) {
      setMessage("Access forbidden ❌");
      return null;
    }

    return res;
  };

  /* ================= FETCH TODAY ================= */
  const fetchTodayAttendance = async () => {
    try {
      const res = await authFetch(
        "http://localhost:10000/api/attendance/today"
      );

      if (!res) return;

      const data = await res.json();

      if (res.ok) {
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.log(error);
      setMessage("Server Error ❌");
    }
  };

  /* ================= CLOCK IN ================= */
  const handleLogin = async () => {
    try {
      const res = await authFetch(
        "http://localhost:10000/api/attendance/clock-in",
        { method: "POST" }
      );

      if (!res) return;

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        fetchTodayAttendance();
      }
    } catch (error) {
      console.log(error);
      setMessage("Server Error ❌");
    }
  };

  /* ================= CLOCK OUT ================= */
  const handleLogout = async () => {
    try {
      const res = await authFetch(
        "http://localhost:10000/api/attendance/clock-out",
        { method: "POST" }
      );

      if (!res) return;

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        fetchTodayAttendance();
      }
    } catch (error) {
      console.log(error);
      setMessage("Server Error ❌");
    }
  };

  return (
    <>
      <Header />
      <div className="container-fluid attendance-container p-4">
        <div className="text-center mb-4">
          <h4>Path Axiom</h4>
          <i className="fa-solid fa-user user-icon"></i>
          <p><b>Name : {employeeName}</b></p>
        </div>

        <div className="text-center mb-4">
          <button className="btn-custom" onClick={handleLogin}>
            Login
          </button>

          <button className="btn-custom" onClick={handleLogout}>
            LogOut
          </button>
        </div>

        {message && (
          <div className="message-box text-center mb-4">
            {message}
          </div>
        )}

        {attendance && (
          <div className="table-responsive">
            <h5 className="mb-3">Today's Attendance</h5>

            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{employeeName}</td>
                  <td>{attendance.date}</td>
                  <td>
                    {attendance.login
                      ? new Date(attendance.login).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>
                    {attendance.logout
                      ? new Date(attendance.logout).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>{attendance.duration || "-"}</td>
                  <td>{attendance.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <style>{`
          body { background-color: #f5f6fa; }

          .user-icon {
            font-size: 24px;
            margin-bottom: 5px;
          }

          .btn-custom {
            padding: 10px 20px;
            margin: 5px;
            border: none;
            background-color: #007bff;
            color: white;
            border-radius: 5px;
            transition: 0.3s;
            font-weight: 500;
          }

          .btn-custom:hover {
            background-color: #0056b3;
          }

          .message-box {
            background-color: #e9ecef;
            padding: 8px;
            border-radius: 5px;
            font-size: 14px;
          }

          .custom-table thead th {
            font-weight: 600;
            border-bottom: 1px solid #ccc;
          }

          .custom-table td, .custom-table th {
            padding: 12px;
          }
        `}</style>
      </div>
    </>
  );
}

export default EmployeeAttendance;