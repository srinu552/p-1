import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [salaryData, setSalaryData] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [salaryMessage, setSalaryMessage] = useState("");

  const [loggedUser, setLoggedUser] = useState(null);

  const getPriorityClass = (priority) => {
    const value = String(priority || "Medium").toLowerCase();

    if (value === "high") return "priority-high";
    if (value === "low") return "priority-low";
    return "priority-medium";
  };

  // ================= LOAD LOGGED IN USER =================
  const loadLoggedInUser = () => {
    try {
      const storedEmployee = localStorage.getItem("employeeUser");
      const storedManager = localStorage.getItem("managerUser");
      const storedAdmin = localStorage.getItem("adminUser");
      const storedUser = localStorage.getItem("user");

      if (storedEmployee) {
        setLoggedUser(JSON.parse(storedEmployee));
      } else if (storedManager) {
        setLoggedUser(JSON.parse(storedManager));
      } else if (storedAdmin) {
        setLoggedUser(JSON.parse(storedAdmin));
      } else if (storedUser) {
        setLoggedUser(JSON.parse(storedUser));
      } else {
        setLoggedUser(null);
      }
    } catch (error) {
      console.error("LOAD USER ERROR:", error);
      setLoggedUser(null);
    }
  };

  // ================= FETCH TASKS =================
  const fetchMyTasks = async () => {
    try {
      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("managerToken");

      if (!token) {
        console.log("No token found");
        setTasks([]);
        return;
      }

      const res = await fetch(
        "http://localhost:10000/api/employee-dashboard/my-tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.log("Unauthorized or error fetching tasks");
        setTasks([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
      setTasks([]);
    }
  };

  // ================= FETCH ANNOUNCEMENTS =================
  const fetchAnnouncements = async () => {
    try {
      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("managerToken");

      if (!token) {
        console.log("No employee token found for announcements");
        setAnnouncements([]);
        return;
      }

      const res = await fetch(
        "http://localhost:10000/api/employee-dashboard/announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.log("Error fetching announcements");
        setAnnouncements([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else if (Array.isArray(data.data)) {
        setAnnouncements(data.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Employee Fetch Announcement Error:", error);
      setAnnouncements([]);
    }
  };

  // ================= FETCH MY SALARY SLIPS =================
  const fetchMySalarySlips = async () => {
    try {
      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("managerToken");

      if (!token) {
        console.log("No employee token found");
        setSalaryMessage("Please login again");
        return;
      }

      const res = await fetch("http://localhost:10000/api/payroll/my-slips", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setSalaryMessage(data.message || "Failed to load salary slips");
        setSalaryData([]);
        setSelectedSlip(null);
        return;
      }

      const slips = Array.isArray(data) ? data : [];
      setSalaryData(slips);
      setSelectedSlip(slips.length > 0 ? slips[0] : null);
      setSalaryMessage("");
    } catch (error) {
      console.error("Fetch Salary Slips Error:", error);
      setSalaryMessage("Server error while fetching salary slips");
      setSalaryData([]);
      setSelectedSlip(null);
    }
  };

  // ================= AUTO LOAD =================
  useEffect(() => {
    loadLoggedInUser();
    fetchMyTasks();
    fetchAnnouncements();
    fetchMySalarySlips();
  }, []);

  const normalizedRole = String(loggedUser?.role || "").toLowerCase();
  const isManager = normalizedRole === "manager";

  const quickActions = useMemo(() => {
    const baseActions = [
      { label: "Apply for Leave", path: "/leaveapplication" },
      { label: "View Payslip", path: "/employeepayroll" },
      { label: "Update Profile", path: "/update" },
      { label: "Attendance", path: "/employeeattendance" },
    ];

    if (isManager) {
      baseActions.push({
        label: "Review Employees",
        path: "/manager-review",
      });
    }

    return baseActions;
  }, [isManager]);

  return (
    <>
      <style>{`
        .dashboard-wrapper {
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
          min-height: 100vh;
          padding-bottom: 40px;
          font-family: "Inter", sans-serif;
        }

        .profile-card {
          background: white;
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.3s ease;
        }

        .profile-card:hover {
          transform: translateY(-4px);
        }

        .avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 22px;
          box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
          text-transform: uppercase;
        }

        .edit-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          transition: 0.3s;
        }

        .edit-btn:hover {
          background: #4338ca;
          transform: scale(1.05);
        }

        .quick-btn {
          background: white;
          border: none;
          padding: 25px 10px;
          border-radius: 16px;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 14px;
        }

        .quick-btn:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 35px rgba(79, 70, 229, 0.15);
          background: #4f46e5;
          color: white;
        }

        .card-box {
          background: white;
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: 0.3s ease;
          height: 100%;
        }

        .card-box:hover {
          transform: translateY(-4px);
        }

        .task-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          margin-top: 12px;
          transition: 0.25s ease;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }

        .announcement-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          margin-top: 12px;
          transition: 0.25s ease;
        }

        .announcement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }

        .priority-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: white;
          margin-left: 6px;
          letter-spacing: 0.3px;
        }

        .priority-high {
          background: #dc2626;
        }

        .priority-medium {
          background: #16a34a;
        }

        .priority-low {
          background: #f97316;
        }

        .table {
          border-radius: 12px;
          overflow: hidden;
        }

        .table thead {
          background: #4f46e5;
          color: white;
        }

        .table tbody tr:hover {
          background-color: #f3f4f6;
          transition: 0.2s;
        }

        .manager-card {
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
          border: 1px solid #dbe4ff;
        }

        .manager-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: #4f46e5;
          color: white;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .manager-review-btn {
          background: #0d6efd;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          transition: 0.3s ease;
          font-weight: 600;
        }

        .manager-review-btn:hover {
          background: #0b5ed7;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .profile-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .quick-btn {
            padding: 18px 8px;
            font-size: 13px;
          }

          .card-box {
            padding: 18px;
          }
        }
      `}</style>

      <div className="dashboard-wrapper">
        <Header />

        <div className="container my-4">
          {/* Profile Card */}
          <div className="profile-card mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar">
                {loggedUser?.name ? loggedUser.name.charAt(0) : "U"}
              </div>
              <div>
                <h4 className="mb-1">{loggedUser?.name || "User Name"}</h4>
                <p className="mb-0">
                  {loggedUser?.dept || loggedUser?.department || "Developer"}
                  {loggedUser?.job_title ? ` • ${loggedUser.job_title}` : " 😎"}
                </p>
                {loggedUser?.role && (
                  <small className="text-muted text-capitalize">
                    Role: {loggedUser.role}
                  </small>
                )}
              </div>
            </div>

            <button
              className="edit-btn"
              onClick={() => navigate("/update")}
            >
              Edit Profile
            </button>
          </div>

          {/* Quick Actions */}
          <h5 className="mb-3">Quick Actions</h5>
          <div className="row g-3 mb-4">
            {quickActions.map((item, i) => (
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12" key={i}>
                <button
                  className="quick-btn w-100"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>

          {/* Cards Section */}
          <div className="row g-4">
            {/* To-dos */}
            <div className="col-md-6">
              <div className="card-box">
                <h5>To-dos</h5>

                {tasks.length === 0 ? (
                  <div className="bg-light rounded p-3 mt-2">
                    No tasks assigned
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <strong>{task.title}</strong>

                      <div className="mt-2">
                        Priority:
                        <span
                          className={`priority-badge ${getPriorityClass(task.priority)}`}
                        >
                          {task.priority || "Medium"}
                        </span>
                      </div>

                      <div className="mt-1">
                        Due:{" "}
                        {task.due_date
                          ? String(task.due_date).split("T")[0]
                          : "No date"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="col-md-6">
              <div className="card-box">
                <h5>Announcements</h5>

                {announcements.length === 0 ? (
                  <div className="bg-light rounded p-3 mt-2">
                    No announcements
                  </div>
                ) : (
                  announcements.map((item) => (
                    <div
                      key={item.id || item.announcement_id}
                      className="announcement-card"
                    >
                      {item.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payslip */}
            <div className="col-md-6">
              <div className="card-box">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <h5 className="mb-0">
                    {selectedSlip?.month
                      ? `${selectedSlip.month} Pay Slip Breakdown`
                      : "Pay Slip Breakdown"}
                  </h5>

                  {salaryData.length > 1 && (
                    <select
                      className="form-select w-auto"
                      value={selectedSlip?.id || ""}
                      onChange={(e) => {
                        const slip = salaryData.find(
                          (item) => String(item.id) === e.target.value
                        );
                        setSelectedSlip(slip || null);
                      }}
                    >
                      {salaryData.map((slip) => (
                        <option key={slip.id} value={slip.id}>
                          {slip.month}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {salaryMessage && (
                  <div className="alert alert-warning py-2">{salaryMessage}</div>
                )}

                {!selectedSlip ? (
                  <p className="text-muted mt-3">No salary slip available.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table mt-3">
                      <thead>
                        <tr>
                          <th>Earnings</th>
                          <th>Amount</th>
                          <th>Deductions</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Basic Wage</td>
                          <td>₹{Number(selectedSlip?.basic || 0).toFixed(2)}</td>
                          <td>PF</td>
                          <td>-₹{Number(selectedSlip?.pf || 0).toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>HRA</td>
                          <td>₹{Number(selectedSlip?.hra || 0).toFixed(2)}</td>
                          <td>ESI</td>
                          <td>-₹{Number(selectedSlip?.esi || 0).toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>Conveyance</td>
                          <td>₹{Number(selectedSlip?.conveyance || 0).toFixed(2)}</td>
                          <td>Professional Tax</td>
                          <td>-₹{Number(selectedSlip?.ptax || 0).toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>Bonus</td>
                          <td>₹{Number(selectedSlip?.bonus || 0).toFixed(2)}</td>
                          <td>TDS</td>
                          <td>-₹{Number(selectedSlip?.tds || 0).toFixed(2)}</td>
                        </tr>

                        <tr className="fw-bold">
                          <td>Gross Salary</td>
                          <td>₹{Number(selectedSlip?.gross_salary || 0).toFixed(2)}</td>
                          <td>Total Deductions</td>
                          <td>-₹{Number(selectedSlip?.total_deductions || 0).toFixed(2)}</td>
                        </tr>

                        <tr className="fw-bold table-success">
                          <td colSpan="3">Net Salary</td>
                          <td>₹{Number(selectedSlip?.net_salary || 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Manager Only Card */}
            {isManager && (
              <div className="col-md-6">
                <div className="card-box manager-card">
                  <div className="manager-badge">Manager Access</div>
                  <h5>Review Employees</h5>
                  <p className="text-muted mt-2 mb-3">
                    As a manager, you can review employee performance from here.
                    This section is visible only for users with manager role.
                  </p>

                  <button
                    className="manager-review-btn"
                    onClick={() => navigate("/manager-review")}
                  >
                    Open Review Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}