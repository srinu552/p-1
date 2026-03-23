import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

export default function ManagerReviewPage() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("employeeToken") ||
    localStorage.getItem("managerToken");

  const loggedUser = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("employeeUser")) ||
        JSON.parse(localStorage.getItem("managerUser")) ||
        null
      );
    } catch {
      return null;
    }
  })();

  const normalizedRole = String(loggedUser?.role || "").toLowerCase();

  useEffect(() => {
    if (normalizedRole !== "manager") {
      navigate("/employeedashboard");
      return;
    }

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch employees");
        setEmployees([]);
        return;
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Server error while loading employees");
      setEmployees([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const value = search.toLowerCase().trim();

    return employees.filter((emp) => {
      return (
        String(emp.name || "").toLowerCase().includes(value) ||
        String(emp.email || "").toLowerCase().includes(value) ||
        String(emp.employee_id || "").toLowerCase().includes(value) ||
        String(emp.dept || "").toLowerCase().includes(value) ||
        String(emp.job_title || "").toLowerCase().includes(value)
      );
    });
  }, [employees, search]);

  const submitReview = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    if (!rating) {
      setError("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviews/manager-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            revieweeId: selectedEmployee.id,
            rating: Number(rating),
            comments: comments.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }

      setMessage(data.message || "Employee review submitted successfully");
      setComments("");
      setRating("5");
    } catch (err) {
      setError("Server error while submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .manager-review-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
          padding-bottom: 40px;
          font-family: "Inter", sans-serif;
        }

        .review-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          padding: 24px;
          height: 100%;
        }

        .employee-item {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 12px;
          background: #f8fafc;
          transition: 0.25s ease;
        }

        .employee-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.06);
        }

        .selected-employee {
          border: 1px solid #c7d2fe;
          background: #eef2ff;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .action-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 600;
          color: #fff;
          transition: 0.25s ease;
        }

        .primary-btn {
          background: #4f46e5;
        }

        .primary-btn:hover {
          background: #4338ca;
        }

        .success-btn {
          background: #16a34a;
        }

        .success-btn:hover {
          background: #15803d;
        }

        .back-btn {
          background: #0d6efd;
        }

        .back-btn:hover {
          background: #0b5ed7;
        }

        @media (max-width: 768px) {
          .review-card {
            padding: 18px;
          }
        }
      `}</style>

      <div className="manager-review-wrapper">
        <Header />

        <div className="container my-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h3 className="mb-1">Review Employees</h3>
              <p className="text-muted mb-0">
                Manager can review employee performance here.
              </p>
            </div>

            <button
              className="action-btn back-btn"
              onClick={() => navigate("/employeedashboard")}
            >
              Back to Dashboard
            </button>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="review-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h5 className="mb-0">Employees List</h5>

                  <button
                    className="action-btn primary-btn"
                    onClick={fetchEmployees}
                  >
                    {fetching ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search by name, email, employee id, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {fetching ? (
                  <p>Loading employees...</p>
                ) : filteredEmployees.length === 0 ? (
                  <p className="text-muted mb-0">No employees found</p>
                ) : (
                  filteredEmployees.map((emp) => (
                    <div key={emp.id} className="employee-item">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <div><strong>{emp.name || "No Name"}</strong></div>
                          <div>Employee ID: {emp.employee_id || "N/A"}</div>
                          <div>Email: {emp.email || "N/A"}</div>
                          <div>Department: {emp.dept || "N/A"}</div>
                          <div>Designation: {emp.job_title || "N/A"}</div>
                        </div>

                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="review-card">
                <h5 className="mb-3">Submit Employee Review</h5>

                {selectedEmployee ? (
                  <div className="selected-employee">
                    <div><strong>Name:</strong> {selectedEmployee.name || "No Name"}</div>
                    <div><strong>Employee ID:</strong> {selectedEmployee.employee_id || "N/A"}</div>
                    <div><strong>Email:</strong> {selectedEmployee.email || "N/A"}</div>
                    <div><strong>Department:</strong> {selectedEmployee.dept || "N/A"}</div>
                    <div><strong>Designation:</strong> {selectedEmployee.job_title || "N/A"}</div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    Select an employee from the left side first.
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Needs Improvement</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Write review comments..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <button
                  className="action-btn success-btn"
                  onClick={submitReview}
                  disabled={loading || !selectedEmployee}
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>

                {error && (
                  <div className="alert alert-danger mt-3 mb-0">{error}</div>
                )}

                {message && (
                  <div className="alert alert-success mt-3 mb-0">{message}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}