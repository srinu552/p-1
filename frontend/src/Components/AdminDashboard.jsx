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

  const pageDescriptions = {
    Dashboard:
      "Manage employee search, task assignment, and announcements from one responsive workspace.",
    Attendance: "Track attendance data in a cleaner and more readable admin view.",
    Employees: "Manage employee records with a polished, mobile-friendly layout.",
    Roles: "Update user roles and permissions from a structured admin panel.",
    "Leave Management": "Review and manage employee leave requests with better spacing and readability.",
    "Admin Approval": "Approve or reject employee registrations from a focused admin workflow.",
    Payroll: "Search employees and manage payroll details in a professional responsive layout.",
    "Review Managers": "Review managers with a cleaner evaluation workspace.",
    "Performance Reviews": "View employee and manager performance data in a modern admin experience.",
  };

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

  const handleEmployeeSelect = (emp) => {
    setTaskForm((prev) => ({
      ...prev,
      employeeId: emp.id,
    }));
    setSearch(emp.name || emp.employee_id || "");
  };

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: announcementInput.trim() }),
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/tasks/create`,
        {
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
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/tasks/${task.id}`,
        {
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
        }
      );

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

    return <h4 className="mb-1">{count}</h4>;
  };

  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-inner">
          <div className="sidebar-brand-wrap">
            <div className="sidebar-brand-badge">PA</div>
            {sidebarOpen && (
              <div>
                <h5 className="sidebar-brand-title mb-0">Path Axiom</h5>
                <small className="sidebar-brand-subtitle">Admin Workspace</small>
              </div>
            )}
          </div>

          <div className="sidebar-menu-scroll">
            {menuSections.map((section, index) => (
              <div key={index} className="menu-section">
                {sidebarOpen && (
                  <div className="section-heading">{section.title}</div>
                )}

                <div className="menu-list">
                  {section.items.map((item, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`menu-item ${
                        activePage === item ? "active" : ""
                      }`}
                      onClick={() => handleMenuClick(item)}
                    >
                      <span className="menu-dot">
                        {sidebarOpen ? "•" : item.charAt(0)}
                      </span>
                      {sidebarOpen && <span className="menu-label">{item}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

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

      <main
        className={`content ${
          sidebarOpen && !isMobile
            ? "content-expanded"
            : !isMobile
            ? "content-collapsed"
            : "content-mobile"
        }`}
      >
        <div className="container-fluid px-3 px-md-4 py-3 py-lg-4">
          <div className="dashboard-topbar card border-0 shadow-sm mb-4">
            <div className="card-body p-3 p-lg-4">
              <div className="topbar-main d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
                <div className="topbar-left d-flex align-items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    className="icon-btn menu-toggle-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    ☰
                  </button>

                  <div>
                    <div className="eyebrow-text">Admin Panel</div>
                    <h4 className="page-title mb-0">{activePage}</h4>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-3 candidate-btn"
                  >
                    All Candidates ▼
                  </button>
                </div>

                <div className="topbar-right d-flex align-items-center gap-2 flex-wrap ms-xl-auto">
                  <div className="search-box search-box-topbar">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by name, email, department, designation, employee id..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setDarkMode(!darkMode)}
                    title="Toggle Theme"
                  >
                    {darkMode ? "🌙" : "☀️"}
                  </button>

                  <div className="dropdown-parent">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => {
                        setShowNotification(!showNotification);
                        setShowProfile(false);
                      }}
                    >
                      🔔
                    </button>

                    {showNotification && (
                      <div className="dropdown-box">
                        <div>New candidate applied</div>
                      </div>
                    )}
                  </div>

                  <div className="dropdown-parent">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => {
                        setShowProfile(!showProfile);
                        setShowNotification(false);
                      }}
                    >
                      👤
                    </button>

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
            </div>
          </div>

          <div className="page-hero card border-0 shadow-sm mb-4">
            <div className="card-body p-3 p-lg-4 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div>
                <span className="hero-chip">Workspace</span>
                <h2 className="hero-title mb-2">{activePage}</h2>
                <p className="hero-subtitle mb-0">
                  {pageDescriptions[activePage]}
                </p>
              </div>

              <div className="hero-meta d-flex flex-wrap gap-2">
                <div className="hero-meta-item">
                  Theme <strong>{darkMode ? "Dark" : "Light"}</strong>
                </div>
                <div className="hero-meta-item">
                  Employees <strong>{employees.length}</strong>
                </div>
                <div className="hero-meta-item">
                  Tasks <strong>{recentTasks.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {activePage === "Dashboard" && (
            <>
              <div className="row g-3 mb-4">
                {stats.map((item, index) => (
                  <div className="col-6 col-xl-3" key={index}>
                    <div className="stat-card h-100">
                      <div className="stat-card-body">
                        <span className="stat-label">{item.title}</span>
                        <AnimatedNumber value={item.count} />
                        <p className="stat-meta mb-0">Live overview</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {search && (
                <div className="card custom-card border-0 shadow-sm mb-4">
                  <div className="card-body p-3 p-lg-4">
                    <div className="section-title-wrap mb-3">
                      <h5 className="mb-1">Search Results</h5>
                      <p className="text-muted mb-0">
                        Matching employees for quick task and payroll actions.
                      </p>
                    </div>

                    {filteredEmployees.length === 0 ? (
                      <p className="empty-text mb-0">No employees found</p>
                    ) : (
                      <div className="row g-3">
                        {filteredEmployees.map((emp) => (
                          <div className="col-12" key={emp.id}>
                            <div
                              className={`search-result-item ${
                                String(taskForm.employeeId) === String(emp.id)
                                  ? "selected-search-result"
                                  : ""
                              }`}
                            >
                              <div className="row g-3 align-items-center">
                                <div className="col-12 col-lg-8">
                                  <strong className="result-title d-block mb-2">
                                    {emp.name || "No Name"}
                                  </strong>
                                  <div className="result-grid">
                                    <span>
                                      <strong>Employee ID:</strong>{" "}
                                      {emp.employee_id || "N/A"}
                                    </span>
                                    <span>
                                      <strong>Email:</strong> {emp.email || "N/A"}
                                    </span>
                                    <span>
                                      <strong>Department:</strong>{" "}
                                      {emp.dept || "N/A"}
                                    </span>
                                    <span>
                                      <strong>Designation:</strong>{" "}
                                      {emp.job_title || "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="col-12 col-lg-4">
                                  <div className="d-grid d-sm-flex justify-content-lg-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleEmployeeSelect(emp)}
                                    >
                                      Assign Task
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="row g-4">
                <div className="col-12 col-xl-6">
                  <div className="card custom-card border-0 shadow-sm h-100">
                    <div className="card-body p-3 p-lg-4">
                      <div className="section-title-wrap mb-3">
                        <h5 className="mb-1">Assign Task</h5>
                        <p className="text-muted mb-0">
                          Select an employee and assign work with date and priority.
                        </p>
                      </div>

                      {selectedEmployee && (
                        <div className="selected-employee-box mb-3">
                          <div className="mb-1">
                            <strong>Selected Employee:</strong>{" "}
                            {selectedEmployee.name || "No Name"}
                          </div>
                          <div>
                            <strong>Employee ID:</strong>{" "}
                            {selectedEmployee.employee_id || "N/A"}
                          </div>
                          <div>
                            <strong>Email:</strong>{" "}
                            {selectedEmployee.email || "N/A"}
                          </div>
                          <div>
                            <strong>Department:</strong>{" "}
                            {selectedEmployee.dept || "N/A"}
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger mt-3"
                            onClick={() =>
                              setTaskForm((prev) => ({
                                ...prev,
                                employeeId: "",
                              }))
                            }
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}

                      <select
                        className="form-select mb-3"
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
                        className="form-control mb-3"
                        placeholder="Task title"
                        value={taskForm.title}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, title: e.target.value })
                        }
                      />

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <input
                            type="date"
                            className="form-control"
                            value={taskForm.dueDate}
                            onChange={(e) =>
                              setTaskForm({ ...taskForm, dueDate: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <select
                            className="form-select"
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

                      <div className="d-grid d-sm-inline-block mb-4">
                        <button
                          type="button"
                          className="btn btn-primary px-4"
                          onClick={assignTask}
                        >
                          Assign
                        </button>
                      </div>

                      <div className="section-title-wrap mb-3">
                        <h6 className="mb-1">Recent Tasks</h6>
                        <p className="text-muted mb-0">
                          Edit or delete tasks without leaving the dashboard.
                        </p>
                      </div>

                      <div className="task-list-wrapper">
                        {recentTasks.length === 0 ? (
                          <p className="empty-text mb-0">No tasks available</p>
                        ) : (
                          recentTasks.map((task) => (
                            <div key={task.id} className="task-item">
                              <div className="task-main">
                                <strong className="d-block mb-1">
                                  {task.title}
                                </strong>
                                <div className="task-meta">
                                  <span>
                                    <strong>Employee:</strong>{" "}
                                    {task.employee_name || task.name || "N/A"}
                                  </span>
                                  <span>
                                    <strong>Due:</strong>{" "}
                                    {task.due_date
                                      ? String(task.due_date).split("T")[0]
                                      : "No date"}
                                  </span>
                                </div>

                                <div className="mt-2">
                                  <span className="me-2 fw-semibold">Priority:</span>
                                  <span
                                    className={`priority-badge ${getPriorityClass(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority || "Medium"}
                                  </span>
                                </div>
                              </div>

                              <div className="task-actions d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-warning"
                                  onClick={() => updateTask(task)}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
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
                </div>

                <div className="col-12 col-xl-6">
                  <div className="card custom-card border-0 shadow-sm h-100">
                    <div className="card-body p-3 p-lg-4">
                      <div className="section-title-wrap mb-3">
                        <h5 className="mb-1">Add Announcement</h5>
                        <p className="text-muted mb-0">
                          Share important admin updates in a cleaner card layout.
                        </p>
                      </div>

                      <div className="row g-2 align-items-stretch mb-4">
                        <div className="col-12 col-sm">
                          <input
                            type="text"
                            className="form-control"
                            value={announcementInput}
                            onChange={(e) =>
                              setAnnouncementInput(e.target.value)
                            }
                            placeholder="Enter announcement..."
                          />
                        </div>
                        <div className="col-12 col-sm-auto">
                          <div className="d-grid">
                            <button
                              type="button"
                              className="btn btn-success px-4"
                              onClick={addAnnouncement}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="section-title-wrap mb-3">
                        <h6 className="mb-1">Announcement List</h6>
                        <p className="text-muted mb-0">
                          Remove announcements when they are no longer needed.
                        </p>
                      </div>

                      <div className="announcement-list-wrapper">
                        {announcements.length === 0 ? (
                          <p className="empty-text mb-0">
                            No announcements available
                          </p>
                        ) : (
                          announcements.map((item) => {
                            const announcementId =
                              item.id || item.announcement_id;

                            return (
                              <div
                                key={announcementId}
                                className="announcement-item"
                              >
                                <span className="announcement-text">
                                  {item.text}
                                </span>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    deleteAnnouncement(announcementId)
                                  }
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
              </div>
            </>
          )}

          {activePage === "Attendance" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminAttendance />
            </div>
          )}

          {activePage === "Employees" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminEmployeeList />
            </div>
          )}

          {activePage === "Roles" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminRoleManager />
            </div>
          )}

          {activePage === "Leave Management" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminLeaveManagement />
            </div>
          )}

          {activePage === "Admin Approval" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminEmployeeApproval />
            </div>
          )}

          {activePage === "Payroll" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              {search && (
                <div className="mb-4">
                  <div className="section-title-wrap mb-3">
                    <h5 className="mb-1">Search Results</h5>
                    <p className="text-muted mb-0">
                      Select an employee and send the data directly into payroll.
                    </p>
                  </div>

                  {filteredEmployees.length === 0 ? (
                    <p className="empty-text mb-0">No employees found</p>
                  ) : (
                    <div className="row g-3">
                      {filteredEmployees.map((emp) => (
                        <div className="col-12" key={emp.id}>
                          <div
                            className={`search-result-item ${
                              String(selectedPayrollEmployee?.employee_id) ===
                              String(emp.employee_id)
                                ? "selected-search-result"
                                : ""
                            }`}
                          >
                            <div className="row g-3 align-items-center">
                              <div className="col-12 col-lg-8">
                                <strong className="result-title d-block mb-2">
                                  {emp.name || "No Name"}
                                </strong>
                                <div className="result-grid">
                                  <span>
                                    <strong>Employee ID:</strong>{" "}
                                    {emp.employee_id || "N/A"}
                                  </span>
                                  <span>
                                    <strong>Email:</strong>{" "}
                                    {emp.email || "N/A"}
                                  </span>
                                  <span>
                                    <strong>Department:</strong>{" "}
                                    {emp.dept || "N/A"}
                                  </span>
                                  <span>
                                    <strong>Designation:</strong>{" "}
                                    {emp.job_title || "N/A"}
                                  </span>
                                </div>
                              </div>

                              <div className="col-12 col-lg-4">
                                <div className="d-grid d-sm-flex justify-content-lg-end gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                      handlePayrollEmployeeSelect(emp)
                                    }
                                  >
                                    Use In Payroll
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPayrollEmployee && (
                <div className="selected-employee-box mb-4">
                  <h6 className="mb-3">Selected Employee For Payroll</h6>
                  <div>
                    <strong>Name:</strong>{" "}
                    {selectedPayrollEmployee.name || "No Name"}
                  </div>
                  <div>
                    <strong>Employee ID:</strong>{" "}
                    {selectedPayrollEmployee.employee_id || "N/A"}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {selectedPayrollEmployee.email || "N/A"}
                  </div>
                  <div>
                    <strong>Department:</strong>{" "}
                    {selectedPayrollEmployee.dept || "N/A"}
                  </div>
                  <div>
                    <strong>Designation:</strong>{" "}
                    {selectedPayrollEmployee.job_title || "N/A"}
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-3"
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
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminManagerReview />
            </div>
          )}

          {activePage === "Performance Reviews" && (
            <div className="card custom-card page-panel border-0 shadow-sm p-3 p-md-4">
              <AdminPerformanceReviews />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}