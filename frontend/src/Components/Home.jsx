import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div style={darkMode ? styles.darkContainer : styles.lightContainer}>
      
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg px-4">
        <span className="navbar-brand fw-bold text-white">
          HR Management
        </span>

        <button
          className="btn btn-outline-light"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="text-center text-white mt-5">
        <h1 className="display-4 fw-bold">Smart HR Portal</h1>
        <p className="lead">Manage Employees • Payroll • Attendance</p>
      </div>

      {/* Cards */}
      <div className="container mt-5">
        <div className="row justify-content-center g-4">

          {/* Employee Register */}
          <div className="col-md-3">
            <div
              style={styles.card}
              className="p-4 text-center text-white"
            >
              <i className="fas fa-user-plus fa-2x mb-3"></i>
              <h5>Employee Register</h5>
              <button
                className="btn btn-light w-100 mt-3"
                onClick={() => navigate("/eregister")}
              >
                Register
              </button>
            </div>
          </div>

          {/* Employee Login */}
          <div className="col-md-3">
            <div
              style={styles.card}
              className="p-4 text-center text-white"
            >
              <i className="fas fa-user fa-2x mb-3"></i>
              <h5>Employee Login</h5>
              <button
                className="btn btn-light w-100 mt-3"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </div>

          {/* Admin Login */}
          <div className="col-md-3">
            <div
              style={styles.card}
              className="p-4 text-center text-white"
            >
              <i className="fas fa-user-shield fa-2x mb-3"></i>
              <h5>HR Login</h5>
              <button
                className="btn btn-light w-100 mt-3"
                onClick={() => navigate("/adminlogin")}
              >
                Admin Access
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  darkContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #141E30, #46484a)",
    transition: "0.4s",
  },
  lightContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6a6d6d, #a49d9d)",
    transition: "0.4s",
  },
  card: {
    backdropFilter: "blur(15px)",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "0.4s",
    cursor: "pointer",
  },
};

export default Home;
