const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET EMPLOYEES FOR MANAGER REVIEW ================= */
router.get(
  "/employees",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            id,
            employee_id,
            COALESCE(full_name, name) AS name,
            email,
            COALESCE(department, dept) AS dept,
            COALESCE(designation, job_title) AS job_title,
            LOWER(role) AS role
         FROM users
         WHERE LOWER(role) = 'employee'
         ORDER BY id ASC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET EMPLOYEES FOR MANAGER ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching employees",
      });
    }
  }
);

/* ================= MANAGER REVIEW EMPLOYEE ================= */
router.post(
  "/manager-review",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { revieweeId, rating, comments } = req.body;

      if (!revieweeId || !rating) {
        return res.status(400).json({
          message: "Employee and rating are required",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      const revieweeResult = await pool.query(
        `SELECT id, LOWER(role) AS role
         FROM users
         WHERE id = $1`,
        [revieweeId]
      );

      if (revieweeResult.rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const reviewee = revieweeResult.rows[0];

      if (reviewee.role !== "employee") {
        return res.status(400).json({
          message: "Manager can review only employees",
        });
      }

      const result = await pool.query(
        `INSERT INTO performance_reviews
         (
           reviewer_id,
           reviewee_id,
           reviewer_role,
           reviewee_role,
           review_type,
           rating,
           comments
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          revieweeId,
          "manager",
          "employee",
          "manager_review",
          parsedRating,
          comments?.trim() || null,
        ]
      );

      return res.status(201).json({
        message: "Employee review submitted successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.log("MANAGER REVIEW ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while submitting employee review",
      });
    }
  }
);

/* ================= GET MANAGERS FOR ADMIN REVIEW ================= */
router.get(
  "/managers",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            id,
            employee_id,
            COALESCE(full_name, name) AS name,
            email,
            COALESCE(department, dept) AS dept,
            COALESCE(designation, job_title) AS job_title,
            LOWER(role) AS role
         FROM users
         WHERE LOWER(role) = 'manager'
         ORDER BY id ASC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET MANAGERS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching managers",
      });
    }
  }
);

/* ================= ADMIN REVIEW MANAGER ================= */
router.post(
  "/admin-review",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { revieweeId, rating, comments } = req.body;

      if (!revieweeId || !rating) {
        return res.status(400).json({
          message: "Manager and rating are required",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      const revieweeResult = await pool.query(
        `SELECT id, LOWER(role) AS role
         FROM users
         WHERE id = $1`,
        [revieweeId]
      );

      if (revieweeResult.rows.length === 0) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      const reviewee = revieweeResult.rows[0];

      if (reviewee.role !== "manager") {
        return res.status(400).json({
          message: "Admin can review only managers here",
        });
      }

      const result = await pool.query(
        `INSERT INTO performance_reviews
         (
           reviewer_id,
           reviewee_id,
           reviewer_role,
           reviewee_role,
           review_type,
           rating,
           comments
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          revieweeId,
          "admin",
          "manager",
          "admin_review",
          parsedRating,
          comments?.trim() || null,
        ]
      );

      return res.status(201).json({
        message: "Manager review submitted successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.log("ADMIN REVIEW ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while submitting manager review",
      });
    }
  }
);

/* ================= ADMIN GET ALL REVIEWS ================= */
router.get(
  "/all",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            pr.id,
            pr.review_type,
            pr.rating,
            pr.comments,
            pr.created_at,
            pr.reviewer_role,
            pr.reviewee_role,
            reviewer.employee_id AS reviewer_employee_id,
            COALESCE(reviewer.full_name, reviewer.name) AS reviewer_name,
            reviewee.employee_id AS reviewee_employee_id,
            COALESCE(reviewee.full_name, reviewee.name) AS reviewee_name
         FROM performance_reviews pr
         JOIN users reviewer ON reviewer.id = pr.reviewer_id
         JOIN users reviewee ON reviewee.id = pr.reviewee_id
         ORDER BY pr.created_at DESC, pr.id DESC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET ALL REVIEWS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching all reviews",
      });
    }
  }
);

module.exports = router;