import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false); // auto close on mobile
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    navigate("/login");
    setProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <style>{`
        body {
          background: #eef4fb;
        }

        .navbar {
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-link {
          font-weight: 500;
          cursor: pointer;
          color: #555 !important;
          padding-bottom: 10px;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          display: inline-block;
        }

        .nav-link:hover {
          color: #1e40af !important;
        }

        .nav-link.active {
          color: #1e40af !important;
          border-bottom: 3px solid #1e40af;
        }

        /* Hamburger */
        .menu-toggle {
          font-size: 24px;
          cursor: pointer;
          display: none;
        }

        /* Mobile menu */
        .mobile-menu {
          position: absolute;
          top: 70px;
          left: 0;
          width: 100%;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 20px;
          border-radius: 0 0 16px 16px;
          animation: slideDown 0.3s ease;
        }

        .mobile-menu div {
          cursor: pointer;
          padding: 10px 0;
          font-weight: 500;
          color: #555;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .mobile-menu div:hover {
          color: #1e40af;
        }

        .mobile-menu .active-mobile {
          color: #1e40af;
          border-bottom: 2px solid #1e40af;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-size: 18px;
          color: #fff;
          cursor: pointer;
        }

        .icon-blue {
          background-color: #1e40af;
        }

        .icon-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: red;
          color: white;
          font-size: 10px;
          padding: 3px 6px;
          border-radius: 50%;
          font-weight: bold;
        }

        .profile-wrapper {
          position: relative;
        }

        .profile-circle img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
        }

        .profile-dropdown {
          position: absolute;
          top: 52px;
          right: 0;
          width: 160px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 2000;
          animation: slideDown 0.25s ease;
        }

        .profile-dropdown div {
          padding: 12px 16px;
          cursor: pointer;
          font-weight: 500;
          color: #444;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .profile-dropdown div:hover {
          background: #eef4fb;
          color: #1e40af;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .navbar-nav {
            display: none !important;
          }

          .menu-toggle {
            display: block;
          }
        }
      `}</style>

      <nav className="navbar d-flex justify-content-between align-items-center px-4 py-3">
        <span className="fw-bold fs-5">Path Axiom</span>

        {/* Desktop Menu */}
        <ul className="navbar-nav d-flex flex-row gap-4 mb-0">
          <li className="nav-item">
            <span
              className={`nav-link ${isActive("/employeedashboard") ? "active" : ""}`}
              onClick={() => handleNavClick("/employeedashboard")}
            >
              Dashboard
            </span>
          </li>
          <li className="nav-item">
            <span
              className={`nav-link ${isActive("/employeepayroll") ? "active" : ""}`}
              onClick={() => handleNavClick("/employeepayroll")}
            >
              Payroll
            </span>
          </li>
          <li className="nav-item">
            <span
              className={`nav-link ${isActive("/employeeattendance") ? "active" : ""}`}
              onClick={() => handleNavClick("/employeeattendance")}
            >
              Attendance
            </span>
          </li>
          <li className="nav-item">
            <span
              className={`nav-link ${isActive("/leaveapplication") ? "active" : ""}`}
              onClick={() => handleNavClick("/leaveapplication")}
            >
              LeaveManagement
            </span>
          </li>
        </ul>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle icon-blue">
            🔔
            <span className="icon-badge">13</span>
          </div>

          <div className="profile-wrapper" ref={profileRef}>
            <div
              className="profile-circle"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="profile" />
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                <div
                  onClick={() => {
                    navigate("/update");
                    setProfileOpen(false);
                  }}
                >
                  Profile
                </div>
                <div onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ⋮
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="mobile-menu">
            <div
              className={isActive("/employeedashboard") ? "active-mobile" : ""}
              onClick={() => handleNavClick("/employeedashboard")}
            >
              Dashboard
            </div>
            <div
              className={isActive("/employeepayroll") ? "active-mobile" : ""}
              onClick={() => handleNavClick("/employeepayroll")}
            >
              Payroll
            </div>
            <div
              className={isActive("/employeeattendance") ? "active-mobile" : ""}
              onClick={() => handleNavClick("/employeeattendance")}
            >
              Attendance
            </div>
            <div
              className={isActive("/leaveapplication") ? "active-mobile" : ""}
              onClick={() => handleNavClick("/leaveapplication")}
            >
              LeaveManagement
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;