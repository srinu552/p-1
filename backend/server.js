require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./Routes/auth");
const employeeRoutes = require("./Routes/employeeRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const payrollRoutes = require("./Routes/payrollRoutes");
const attendanceRoutes = require("./Routes/attendance");
const adminRoutes = require("./Routes/adminRoutes"); 
const employeeDashboardRoutes = require("./Routes/employeeDashboardRoutes");
const leaveRoutes = require("./Routes/leaveRoutes");
const profileRoutes = require("./Routes/profileRoutes");
const adminProfileRoutes = require("./Routes/adminProfileRoutes");
const roleRoutes = require("./Routes/roleRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");


const app = express();

/* ================= CORS CONFIG ================= */

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or Postman requests
      if (!origin) return callback(null, true);

      // Allow localhost (development)
      if (origin.includes("localhost")) {
        return callback(null, true);
      }

      // Allow ALL Vercel deployments (preview + production)
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */

app.use(express.json());

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee-dashboard", employeeDashboardRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminProfileRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/reviews", reviewRoutes);
/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});