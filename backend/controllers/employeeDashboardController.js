const pool = require("../config/db");

/* ================= GET LOGGED-IN EMPLOYEE TASKS ================= */
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        title,
        due_date,
        priority,
        created_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get My Assigned Tasks Error:", error);
    res.status(500).json({
      message: "Failed to fetch assigned tasks",
    });
  }
};

/* ================= GET ALL ANNOUNCEMENTS FOR EMPLOYEE ================= */
exports.getEmployeeAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        text,
        created_at
       FROM announcements
       ORDER BY id DESC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get Employee Announcements Error:", error);
    res.status(500).json({
      message: "Failed to fetch announcements",
    });
  }
};