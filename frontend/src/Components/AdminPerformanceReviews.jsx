import React, { useEffect, useMemo, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .apr-root {
    min-height: 100vh;
    background: transparent;
    font-family: 'Sora', sans-serif;
    padding: 32px 24px;
    position: relative;
    overflow-x: hidden;
  }

  /* ── Header ── */
  .apr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }

  .apr-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e1b4b;
    letter-spacing: -0.5px;
  }
  .apr-title span {
    background: linear-gradient(90deg, #7c3aed, #2563eb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .apr-refresh-btn {
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(124,58,237,0.25);
    color: #5b21b6;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 9px 20px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .apr-refresh-btn:hover {
    background: rgba(124,58,237,0.1);
    border-color: rgba(124,58,237,0.5);
    color: #4c1d95;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(124,58,237,0.15);
  }

  /* ── Filter bar ── */
  .apr-filters {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    margin-bottom: 24px;
    align-items: center;
  }
  @media (max-width: 640px) { .apr-filters { grid-template-columns: 1fr; } }

  .apr-search {
    width: 100%;
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 13px;
    padding: 11px 18px;
    color: #1e1b4b;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .apr-search::placeholder { color: #a78bfa; opacity: 0.7; }
  .apr-search:focus {
    border-color: rgba(124,58,237,0.45);
    background: rgba(255,255,255,0.65);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  .apr-select {
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 13px;
    padding: 11px 40px 11px 16px;
    color: #1e1b4b;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237c3aed' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    white-space: nowrap;
  }
  .apr-select:focus {
    border-color: rgba(124,58,237,0.45);
    background-color: rgba(255,255,255,0.65);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  /* ── Stats row ── */
  .apr-stats {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .stat-pill {
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 50px;
    padding: 7px 18px;
    font-size: 12px;
    font-weight: 600;
    color: #4c1d95;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .stat-pill-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── Review Cards ── */
  .reviews-list { display: flex; flex-direction: column; gap: 16px; }

  .review-card {
    background: rgba(255,255,255,0.35);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 4px 24px rgba(99,60,200,0.07),
      0 1px 0 rgba(255,255,255,0.8) inset;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .review-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99,60,200,0.12), 0 1px 0 rgba(255,255,255,0.8) inset;
  }

  /* top accent strip per type */
  .review-card-strip {
    height: 3px;
    width: 100%;
  }
  .strip-admin   { background: linear-gradient(90deg, #7c3aed, #2563eb); }
  .strip-manager { background: linear-gradient(90deg, #059669, #0891b2); }

  .review-card-body { padding: 20px 22px; }

  /* Card Header */
  .review-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .review-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 50px;
    border: 1px solid;
  }
  .badge-admin {
    background: rgba(124,58,237,0.1);
    border-color: rgba(124,58,237,0.25);
    color: #6d28d9;
  }
  .badge-manager {
    background: rgba(5,150,105,0.1);
    border-color: rgba(5,150,105,0.25);
    color: #065f46;
  }

  .review-date {
    font-size: 11.5px;
    color: #9ca3af;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 4px;
  }

  /* Rating stars display */
  .rating-display {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .rating-stars {
    display: flex;
    gap: 2px;
  }
  .star-filled { color: #f59e0b; font-size: 15px; }
  .star-empty  { color: #d1d5db; font-size: 15px; }
  .rating-num {
    font-size: 11px;
    color: #9ca3af;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  /* People row */
  .review-people {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
  }
  @media (max-width: 600px) {
    .review-people { grid-template-columns: 1fr; }
    .people-arrow { transform: rotate(90deg); }
  }

  .person-chip {
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 14px;
    padding: 14px 16px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .person-role-tag {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .role-dot { width: 6px; height: 6px; border-radius: 50%; }

  .person-avatar-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .person-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: #fff;
    flex-shrink: 0;
  }
  .avatar-purple { background: linear-gradient(135deg, #7c3aed, #4f46e5); box-shadow: 0 2px 8px rgba(124,58,237,0.3); }
  .avatar-teal   { background: linear-gradient(135deg, #059669, #0891b2); box-shadow: 0 2px 8px rgba(5,150,105,0.3); }

  .person-name { font-size: 13px; font-weight: 600; color: #1e1b4b; }
  .person-id   { font-size: 11px; color: #6b7280; font-family: 'JetBrains Mono', monospace; }
  .person-role-label { font-size: 11px; color: #6b7280; margin-top: 1px; }

  .people-arrow {
    font-size: 18px;
    color: #c4b5fd;
    text-align: center;
    font-weight: 300;
    user-select: none;
    flex-shrink: 0;
  }

  /* Comments */
  .comment-block {
    background: rgba(255,255,255,0.4);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 13px;
    padding: 14px 16px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .comment-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 7px;
  }
  .comment-text {
    font-size: 13px;
    color: #374151;
    line-height: 1.65;
    font-style: italic;
  }
  .comment-empty { color: #9ca3af; font-style: italic; }

  /* Empty / loading states */
  .state-card {
    background: rgba(255,255,255,0.35);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 20px;
    padding: 50px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
  }
  .state-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.35; }

  .alert {
    border-radius: 13px;
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 18px;
    border: 1px solid;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(254,226,226,0.5);
    border-color: rgba(239,68,68,0.3);
    color: #b91c1c;
  }
`;

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "No date";

const StarRow = ({ rating }) => (
  <div className="rating-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= rating ? "star-filled" : "star-empty"}>★</span>
    ))}
  </div>
);

export default function AdminPerformanceReviews() {
  const [reviews, setReviews]       = useState([]);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchReviews = async () => {
    try {
      setLoading(true); setError("");
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to fetch reviews"); setReviews([]); return; }
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setError("Server error while fetching reviews"); setReviews([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const filteredReviews = useMemo(() => {
    const v = search.toLowerCase().trim();
    return reviews.filter(r => {
      const matchSearch = [r.reviewer_name, r.reviewee_name, r.reviewer_employee_id, r.reviewee_employee_id, r.comments]
        .some(f => String(f || "").toLowerCase().includes(v));
      const matchType = typeFilter === "all" || r.review_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [reviews, search, typeFilter]);

  /* quick counts for stat pills */
  const totalCount   = filteredReviews.length;
  const adminCount   = filteredReviews.filter(r => r.review_type === "admin_review").length;
  const managerCount = filteredReviews.filter(r => r.review_type === "manager_review").length;
  const avgRating    = totalCount
    ? (filteredReviews.reduce((s, r) => s + Number(r.rating || 0), 0) / totalCount).toFixed(1)
    : "—";

  return (
    <>
      <style>{styles}</style>
      <div className="apr-root">

        {/* Header */}
        <div className="apr-header">
          <div className="apr-title">Performance <span>Reviews</span></div>
          <button className="apr-refresh-btn" onClick={fetchReviews}>
            {loading ? "↻ Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        {/* Filters */}
        <div className="apr-filters">
          <input
            className="apr-search"
            placeholder="Search by reviewer, reviewee, employee ID, comments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="apr-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="manager_review">Manager → Employee</option>
            <option value="admin_review">Admin → Manager</option>
          </select>
        </div>

        {/* Stat pills */}
        <div className="apr-stats">
          <div className="stat-pill">
            <div className="stat-pill-dot" style={{ background: "#7c3aed" }} />
            {totalCount} Total
          </div>
          <div className="stat-pill">
            <div className="stat-pill-dot" style={{ background: "#2563eb" }} />
            {adminCount} Admin Reviews
          </div>
          <div className="stat-pill">
            <div className="stat-pill-dot" style={{ background: "#059669" }} />
            {managerCount} Manager Reviews
          </div>
          <div className="stat-pill">
            <div className="stat-pill-dot" style={{ background: "#f59e0b" }} />
            ★ {avgRating} Avg Rating
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="state-card">
            <div className="state-icon">⏳</div>
            Loading reviews…
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="state-card">
            <div className="state-icon">🔍</div>
            No reviews found
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map(review => {
              const isAdmin = review.review_type === "admin_review";
              return (
                <div className="review-card" key={review.id}>
                  <div className={`review-card-strip ${isAdmin ? "strip-admin" : "strip-manager"}`} />
                  <div className="review-card-body">

                    {/* Card header */}
                    <div className="review-card-header">
                      <div>
                        <div className={`review-type-badge ${isAdmin ? "badge-admin" : "badge-manager"}`}>
                          <span>{isAdmin ? "🛡" : "👤"}</span>
                          {isAdmin ? "Admin → Manager" : "Manager → Employee"}
                        </div>
                        <div className="review-date">{formatDate(review.created_at)}</div>
                      </div>
                      <div className="rating-display">
                        <StarRow rating={Number(review.rating || 0)} />
                        <div className="rating-num">{review.rating || "N/A"} / 5</div>
                      </div>
                    </div>

                    {/* Reviewer ↔ Reviewee */}
                    <div className="review-people">
                      {/* Reviewer */}
                      <div className="person-chip">
                        <div className="person-role-tag">
                          <div className="role-dot" style={{ background: isAdmin ? "#7c3aed" : "#059669" }} />
                          Reviewer
                        </div>
                        <div className="person-avatar-row">
                          <div className={`person-avatar ${isAdmin ? "avatar-purple" : "avatar-teal"}`}>
                            {getInitials(review.reviewer_name)}
                          </div>
                          <div>
                            <div className="person-name">{review.reviewer_name || "N/A"}</div>
                            <div className="person-id">{review.reviewer_employee_id || "N/A"}</div>
                            <div className="person-role-label">{review.reviewer_role || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="people-arrow">→</div>

                      {/* Reviewee */}
                      <div className="person-chip">
                        <div className="person-role-tag">
                          <div className="role-dot" style={{ background: "#9ca3af" }} />
                          Reviewee
                        </div>
                        <div className="person-avatar-row">
                          <div className="person-avatar" style={{ background: "linear-gradient(135deg,#64748b,#94a3b8)", boxShadow:"0 2px 8px rgba(100,116,139,0.3)" }}>
                            {getInitials(review.reviewee_name)}
                          </div>
                          <div>
                            <div className="person-name">{review.reviewee_name || "N/A"}</div>
                            <div className="person-id">{review.reviewee_employee_id || "N/A"}</div>
                            <div className="person-role-label">{review.reviewee_role || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="comment-block">
                      <div className="comment-label">💬 Comments</div>
                      <div className={`comment-text ${!review.comments ? "comment-empty" : ""}`}>
                        {review.comments || "No comments provided"}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}