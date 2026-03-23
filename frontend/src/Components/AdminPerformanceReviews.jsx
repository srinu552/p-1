import React, { useEffect, useMemo, useState } from "react";

export default function AdminPerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:10000/api/reviews/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch reviews");
        setReviews([]);
        return;
      }

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Server error while fetching reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const value = search.toLowerCase().trim();

    return reviews.filter((review) => {
      const matchesSearch =
        String(review.reviewer_name || "").toLowerCase().includes(value) ||
        String(review.reviewee_name || "").toLowerCase().includes(value) ||
        String(review.reviewer_employee_id || "").toLowerCase().includes(value) ||
        String(review.reviewee_employee_id || "").toLowerCase().includes(value) ||
        String(review.comments || "").toLowerCase().includes(value);

      const matchesType =
        typeFilter === "all" ? true : review.review_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [reviews, search, typeFilter]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h4 className="mb-0">Performance Reviews</h4>
        <button className="btn btn-outline-primary" onClick={fetchReviews}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search by reviewer, reviewee, employee id, comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="manager_review">Manager → Employee</option>
            <option value="admin_review">Admin → Manager</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body">Loading reviews...</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-muted">No reviews found</div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredReviews.map((review) => (
            <div className="col-12" key={review.id}>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <h5 className="mb-1 text-capitalize">
                        {review.review_type === "manager_review"
                          ? "Manager → Employee Review"
                          : "Admin → Manager Review"}
                      </h5>
                      <small className="text-muted">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleString()
                          : "No date"}
                      </small>
                    </div>

                    <span className="badge bg-primary fs-6">
                      Rating: {review.rating || "N/A"}/5
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded bg-light border h-100">
                        <div><strong>Reviewer:</strong> {review.reviewer_name || "N/A"}</div>
                        <div><strong>Reviewer ID:</strong> {review.reviewer_employee_id || "N/A"}</div>
                        <div><strong>Reviewer Role:</strong> {review.reviewer_role || "N/A"}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded bg-light border h-100">
                        <div><strong>Reviewee:</strong> {review.reviewee_name || "N/A"}</div>
                        <div><strong>Reviewee ID:</strong> {review.reviewee_employee_id || "N/A"}</div>
                        <div><strong>Reviewee Role:</strong> {review.reviewee_role || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <strong>Comments:</strong>
                    <div className="mt-2 p-3 rounded border bg-white">
                      {review.comments || "No comments provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}