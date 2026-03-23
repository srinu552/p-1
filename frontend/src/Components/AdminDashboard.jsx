import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PayrollSystem from "./PayrollSystem";
import AdminEmployeeList from "./AdminEmployeeList";
import AdminAttendance from "./AdminAttendance";
import AdminLeaveManagement from "./AdminLeaveManagement";
import AdminEmployeeApproval from "./AdminEmployeeApproval";
import "./AdminDashboard.css";
import AdminRoleManager from "./AdminRoleManager";
import AdminManagerReview from "./AdminManagerReview";
import AdminPerformanceReviews from "./AdminPerformanceReviews";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [taskForm, setTaskForm] = useState({
    employeeId: "",
    title: "",
    dueDate: "",
    priority: "Medium",
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activePage, setActivePage] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [search, setSearch] = useState("");
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [selectedPayrollEmployee, setSelectedPayrollEmployee] = useState(null);

  const menuSections = [
  {
    title: "MAIN",
    items: ["Dashboard", "Attendance"],
  },
  {
    title: "ORGANIZATION",
    items: [
      "Admin Approval",
      "Employees",
      "Roles",
      "Leave Management",
      "Payroll",
      "Review Managers",
      "Performance Reviews",
    ],
  },
];
  const getToken = () => localStorage.getItem("adminToken");

  const handleApiError = (label, error) => {
    console.error(`${label}:`, error);
  };

  const normalizeEmployee = (emp) => ({
    ...emp,
    name: emp.name || emp.full_name || "",
    email: emp.email || "",
    dept: emp.dept || emp.department || "",
    job_title: emp.job_title || emp.designation || "",
    employee_id: emp.employee_id || "",
  });

  const stats = [
    { title: "Attendance", count: recentTasks.length },
    { title: "Employees", count: employees.length },
  ];

  const filteredEmployees = employees.filter((emp) => {
    const searchValue = search.toLowerCase().trim();

    return (
      emp.name?.toLowerCase().includes(searchValue) ||
      emp.email?.toLowerCase().includes(searchValue) ||
      emp.dept?.toLowerCase().includes(searchValue) ||
      emp.job_title?.toLowerCase().includes(searchValue) ||
      emp.employee_id?.toLowerCase().includes(searchValue)
    );
  });

  const selectedEmployee = employees.find(
    (emp) => String(emp.id) === String(taskForm.employeeId)
  );

  const getPriorityClass = (priority) => {
    const value = String(priority || "Medium").toLowerCase();

    if (value === "high") return "priority-high";
    if (value === "low") return "priority-low";
    return "priority-medium";
  };

  // TASK -> numeric database id
  const handleEmployeeSelect = (emp) => {
    setTaskForm((prev) => ({
      ...prev,
      employeeId: emp.id,
    }));
    setSearch(emp.name || emp.employee_id || "");
  };

  // PAYROLL -> keep full employee object with employee_id like PA-EMP-7298
  const handlePayrollEmployeeSelect = (emp) => {
    setSelectedPayrollEmployee(emp);
    setSearch(emp.name || emp.employee_id || "");
  };

  const handleMenuClick = (item) => {
    setActivePage(item);
    if (isMobile) {
      setSidebarOpen(false);
    }
    setShowProfile(false);
    setShowNotification(false);
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("employeeToken");
  localStorage.removeItem("employeeUser");
  localStorage.removeItem("managerToken");
  localStorage.removeItem("managerUser");
  navigate("/adminlogin");
};

  const fetchEmployees = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setEmployees([]);
        return;
      }

      const data = await res.json();

      const employeeList = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      const normalizedData = employeeList.map(normalizeEmployee);

      setEmployees(normalizedData);
    } catch (err) {
      handleApiError("Fetch Employees Error", err);
      setEmployees([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setAnnouncements([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else if (Array.isArray(data.data)) {
        setAnnouncements(data.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      handleApiError("Fetch Announcement Error", error);
      setAnnouncements([]);
    }
  };

  const addAnnouncement = async () => {
    if (!announcementInput.trim()) {
      alert("Please enter announcement");
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: announcementInput.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to add announcement");
        return;
      }

      setAnnouncementInput("");
      fetchAnnouncements();
    } catch (error) {
      handleApiError("Add Announcement Error", error);
      alert("Something went wrong while adding announcement");
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        alert("Failed to delete announcement");
        return;
      }

      setAnnouncements((prev) =>
        prev.filter((item) => (item.id || item.announcement_id) !== id)
      );
    } catch (error) {
      handleApiError("Delete Announcement Error", error);
      alert("Something went wrong while deleting announcement");
    }
  };

  const fetchTasks = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setRecentTasks([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setRecentTasks(data);
      } else if (Array.isArray(data.tasks)) {
        setRecentTasks(data.tasks);
      } else {
        setRecentTasks([]);
      }
    } catch (error) {
      handleApiError("Fetch Tasks Error", error);
      setRecentTasks([]);
    }
  };

  const assignTask = async () => {
    if (!taskForm.employeeId || !taskForm.title.trim()) {
      alert("Fill required fields");
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const currentEmployee = employees.find(
        (emp) => String(emp.id) === String(taskForm.employeeId)
      );

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: taskForm.employeeId,
          title: taskForm.title.trim(),
          due_date: taskForm.dueDate || null,
          priority: taskForm.priority,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Task creation failed");
        return;
      }

      const newTask = {
        ...data,
        name: data.name || currentEmployee?.name || "N/A",
        employee_name: data.employee_name || currentEmployee?.name || "N/A",
        priority: data.priority || taskForm.priority,
        due_date: data.due_date || taskForm.dueDate || null,
      };

      setRecentTasks((prev) => [newTask, ...prev]);

      setTaskForm({
        employeeId: "",
        title: "",
        dueDate: "",
        priority: "Medium",
      });
      setSearch("");
    } catch (error) {
      handleApiError("Assign Task Error", error);
      alert("Something went wrong while assigning task");
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete task");
        return;
      }

      setRecentTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      handleApiError("Delete Task Error", error);
      alert("Something went wrong while deleting task");
    }
  };

  const updateTask = async (task) => {
    try {
      const token = getToken();
      if (!token) return;

      const newTitle = prompt("Edit Task Title:", task.title);

      if (!newTitle || !newTitle.trim()) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          due_date: task.due_date || null,
          priority: task.priority || "Medium",
        }),
      });

      const updatedData = await res.json().catch(() => null);

      if (!res.ok) {
        alert("Update failed");
        return;
      }

      if (updatedData) {
        setRecentTasks((prev) =>
          prev.map((item) =>
            item.id === task.id ? { ...item, ...updatedData } : item
          )
        );
      } else {
        fetchTasks();
      }
    } catch (error) {
      handleApiError("Update Task Error", error);
      alert("Something went wrong while updating task");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchEmployees();
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);

      if (!mobileView) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const AnimatedNumber = ({ value }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 600;
      const stepTime = 16;
      const increment = value / (duration / stepTime);

      const counter = setInterval(() => {
        start += increment;

        if (start >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(counter);
    }, [value]);

    return <h4>{count}</h4>;
  };

  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : ""}`}>
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-title">{sidebarOpen ? "Path Axiom" : "X"}</div>

        {menuSections.map((section, index) => (
          <div key={index}>
            {sidebarOpen && <div className="section-heading">{section.title}</div>}

            {section.items.map((item, i) => (
              <div
                key={i}
                className={`menu-item ${activePage === item ? "active" : ""}`}
                onClick={() => handleMenuClick(item)}
              >
                {sidebarOpen ? item : item.charAt(0)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {sidebarOpen && isMobile && (
        <div
          className="overlay"
          onClick={() => {
            setSidebarOpen(false);
            setShowProfile(false);
            setShowNotification(false);
          }}
        ></div>
      )}

      <div
        className={`content ${
          sidebarOpen && !isMobile
            ? "content-expanded"
            : !isMobile
            ? "content-collapsed"
            : "content-mobile"
        }`}
      >
        <div className="header">
          <div className="top-bar">
            <span
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </span>

            <div className="btn btn-primary rounded-pill">All Candidates ▼</div>

            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search employee by name, email, department, designation, employee id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center header-actions">
            <div
              className="icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
            >
              {darkMode ? "🌙" : "☀️"}
            </div>

            <div
              className="icon-btn dropdown-parent"
              onClick={() => {
                setShowNotification(!showNotification);
                setShowProfile(false);
              }}
            >
              🔔
              {showNotification && (
                <div className="dropdown-box">
                  <div>New candidate applied</div>
                </div>
              )}
            </div>

            <div
              className="icon-btn dropdown-parent"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotification(false);
              }}
            >
              👤
              {showProfile && (
                <div className="dropdown-box">
                  <div
                    onClick={() => navigate("/admin-profile")}
                    style={{ cursor: "pointer" }}
                  >
                    Profile
                  </div>
                  <div onClick={handleLogout} className="logout-text">
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {activePage === "Dashboard" && (
          <>
            <div className="row">
              {stats.map((item, index) => (
                <div className="col-md-3 mb-4" key={index}>
                  <div className="stat-card">
                    <AnimatedNumber value={item.count} />
                    <p>{item.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-4">
              {search && (
                <div className="col-12">
                  <div className="card custom-card p-3 mb-4">
                    <h5>Search Results</h5>

                    {filteredEmployees.length === 0 ? (
                      <p>No employees found</p>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className={`search-result-item p-3 mb-2 ${
                            String(taskForm.employeeId) === String(emp.id)
                              ? "selected-search-result"
                              : ""
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                              <strong>{emp.name || "No Name"}</strong>
                              <div>Employee ID: {emp.employee_id || "N/A"}</div>
                              <div>Email: {emp.email || "N/A"}</div>
                              <div>Department: {emp.dept || "N/A"}</div>
                              <div>Designation: {emp.job_title || "N/A"}</div>
                            </div>

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEmployeeSelect(emp)}
                            >
                              Assign Task
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <div className="card custom-card p-3 mb-4">
                  <h5>Assign Task</h5>

                  {selectedEmployee && (
                    <div className="selected-employee-box mb-3">
                      <div>
                        <strong>Selected Employee:</strong>{" "}
                        {selectedEmployee.name || "No Name"}
                      </div>
                      <div>Employee ID: {selectedEmployee.employee_id || "N/A"}</div>
                      <div>Email: {selectedEmployee.email || "N/A"}</div>
                      <div>Department: {selectedEmployee.dept || "N/A"}</div>
                      <button
                        className="btn btn-sm btn-outline-danger mt-2"
                        onClick={() =>
                          setTaskForm((prev) => ({ ...prev, employeeId: "" }))
                        }
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}

                  <select
                    className="form-select mb-2"
                    value={taskForm.employeeId}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, employeeId: e.target.value })
                    }
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {(emp.name || "No Name")} ({emp.dept || "No Dept"}) -{" "}
                        {emp.employee_id || "No ID"}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control mb-2"
                        value={taskForm.dueDate}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, dueDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <select
                        className="form-select mb-2"
                        value={taskForm.priority}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, priority: e.target.value })
                        }
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={assignTask}>
                    Assign
                  </button>

                  <div className="mt-3">
                    {recentTasks.length === 0 ? (
                      <p>No tasks available</p>
                    ) : (
                      recentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="task-item p-3 mb-2 d-flex justify-content-between align-items-center flex-wrap gap-3"
                        >
                          <div>
                            <strong>{task.title}</strong>
                            <div>
                              Employee: {task.employee_name || task.name || "N/A"}
                            </div>

                            <div className="mt-1">
                              Priority:
                              <span
                                className={`priority-badge ${getPriorityClass(
                                  task.priority
                                )}`}
                              >
                                {task.priority || "Medium"}
                              </span>
                            </div>

                            <div>
                              Due:{" "}
                              {task.due_date
                                ? String(task.due_date).split("T")[0]
                                : "No date"}
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => updateTask(task)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card custom-card p-3 mb-4">
                  <h5>Add Announcement</h5>

                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      value={announcementInput}
                      onChange={(e) => setAnnouncementInput(e.target.value)}
                      placeholder="Enter Announcement..."
                    />
                    <button className="btn btn-success" onClick={addAnnouncement}>
                      Add
                    </button>
                  </div>

                  <div className="mt-3">
                    {announcements.length === 0 ? (
                      <p>No announcements available</p>
                    ) : (
                      announcements.map((item) => {
                        const announcementId = item.id || item.announcement_id;

                        return (
                          <div
                            key={announcementId}
                            className="announcement-item p-2 mb-2 d-flex justify-content-between align-items-center"
                          >
                            <span>{item.text}</span>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteAnnouncement(announcementId)}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activePage === "Attendance" && (
          <div className="card custom-card p-4">
            <AdminAttendance />
          </div>
        )}

        {activePage === "Employees" && (
          <div className="card custom-card p-4">
            <AdminEmployeeList />
          </div>
        )}

        {activePage === "Roles" && (
          <div className="card custom-card p-4">
            <AdminRoleManager />
          </div>
        )}

        {activePage === "Leave Management" && (
          <div className="card custom-card p-4">
            <AdminLeaveManagement />
          </div>
        )}

        {activePage === "Admin Approval" && (
        <div className="card custom-card p-4">
          <AdminEmployeeApproval />
        </div>
        )}
        
        {activePage === "Payroll" && (
          <div className="card custom-card p-4">
            {search && (
              <div className="mb-4">
                <h5>Search Results</h5>

                {filteredEmployees.length === 0 ? (
                  <p>No employees found</p>
                ) : (
                  filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className={`search-result-item p-3 mb-2 ${
                        String(selectedPayrollEmployee?.employee_id) ===
                        String(emp.employee_id)
                          ? "selected-search-result"
                          : ""
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <strong>{emp.name || "No Name"}</strong>
                          <div>Employee ID: {emp.employee_id || "N/A"}</div>
                          <div>Email: {emp.email || "N/A"}</div>
                          <div>Department: {emp.dept || "N/A"}</div>
                          <div>Designation: {emp.job_title || "N/A"}</div>
                        </div>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handlePayrollEmployeeSelect(emp)}
                        >
                          Use In Payroll
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedPayrollEmployee && (
              <div className="selected-employee-box mb-4 p-3">
                <h6>Selected Employee For Payroll</h6>
                <div><strong>Name:</strong> {selectedPayrollEmployee.name || "No Name"}</div>
                <div><strong>Employee ID:</strong> {selectedPayrollEmployee.employee_id || "N/A"}</div>
                <div><strong>Email:</strong> {selectedPayrollEmployee.email || "N/A"}</div>
                <div><strong>Department:</strong> {selectedPayrollEmployee.dept || "N/A"}</div>
                <div><strong>Designation:</strong> {selectedPayrollEmployee.job_title || "N/A"}</div>

                <button
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => setSelectedPayrollEmployee(null)}
                >
                  Clear Selection
                </button>
              </div>
            )}

            <PayrollSystem selectedEmployee={selectedPayrollEmployee} />
          </div>
        )}
        
        {activePage === "Review Managers" && (
        <div className="card custom-card p-4">
          <AdminManagerReview />
        </div>
      )}

      {activePage === "Performance Reviews" && (
        <div className="card custom-card p-4">
          <AdminPerformanceReviews />
        </div>
      )}
      </div>
    </div>
  );
}