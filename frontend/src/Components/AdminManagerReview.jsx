import React, { useEffect, useMemo, useState } from "react";

export default function AdminManagerReview() {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchManagers = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/managers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load managers");
        setManagers([]);
        return;
      }

      setManagers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Server error while loading managers");
      setManagers([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filteredManagers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return managers.filter((manager) => {
      return (
        String(manager.name || "").toLowerCase().includes(value) ||
        String(manager.email || "").toLowerCase().includes(value) ||
        String(manager.employee_id || "").toLowerCase().includes(value) ||
        String(manager.dept || "").toLowerCase().includes(value) ||
        String(manager.job_title || "").toLowerCase().includes(value)
      );
    });
  }, [managers, search]);

  const submitReview = async () => {
    if (!selectedManager) {
      setError("Please select a manager");
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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/admin-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revieweeId: selectedManager.id,
          rating: Number(rating),
          comments: comments.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }

      setMessage(data.message || "Manager review submitted successfully");
      setComments("");
      setRating("5");
    } catch (err) {
      setError("Server error while submitting manager review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h4 className="mb-0">Review Managers</h4>
        <button className="btn btn-outline-primary" onClick={fetchManagers}>
          {fetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Managers List</h5>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search manager by name, email, department, employee id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {fetching ? (
                <p>Loading managers...</p>
              ) : filteredManagers.length === 0 ? (
                <p className="text-muted mb-0">No managers found</p>
              ) : (
                filteredManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className={`p-3 mb-3 rounded border ${
                      String(selectedManager?.id) === String(manager.id)
                        ? "border-primary bg-light"
                        : ""
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <div><strong>{manager.name || "No Name"}</strong></div>
                        <div>Employee ID: {manager.employee_id || "N/A"}</div>
                        <div>Email: {manager.email || "N/A"}</div>
                        <div>Department: {manager.dept || "N/A"}</div>
                        <div>Designation: {manager.job_title || "N/A"}</div>
                      </div>

                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedManager(manager)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Submit Manager Review</h5>

              {selectedManager ? (
                <div className="p-3 rounded bg-light border mb-3">
                  <div><strong>Name:</strong> {selectedManager.name || "No Name"}</div>
                  <div><strong>Employee ID:</strong> {selectedManager.employee_id || "N/A"}</div>
                  <div><strong>Email:</strong> {selectedManager.email || "N/A"}</div>
                  <div><strong>Department:</strong> {selectedManager.dept || "N/A"}</div>
                </div>
              ) : (
                <div className="alert alert-info">
                  Select a manager from the left side first.
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
                  placeholder="Write performance review comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <button
                className="btn btn-success"
                onClick={submitReview}
                disabled={loading || !selectedManager}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>

              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
              {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}