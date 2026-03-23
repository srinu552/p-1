import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminUpdateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:10000/api/admin/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch profile");
          setLoading(false);
          return;
        }

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "",
          designation: data.designation || "",
          role: data.role || "",
        });
      } catch (err) {
        console.log("FETCH PROFILE ERROR:", err);
        setError("Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError("No token found. Please login again.");
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch("http://localhost:10000/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      setMessage("Profile updated successfully");
      setFormData({
        fullName: data.profile.fullName || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        department: data.profile.department || "",
        designation: data.profile.designation || "",
        role: data.profile.role || formData.role,
      });
    } catch (err) {
      console.log("UPDATE PROFILE ERROR:", err);
      setError("Server error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading profile...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.breadcrumb} onClick={() => navigate("/admindashboard")}>
          Dashboard
        </div>
        <div style={styles.current}>Profile</div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.heading}>
          {formData.role?.toLowerCase() === "hr"
            ? "HR Profile Update"
            : "Admin Profile Update"}
        </h2>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter full name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter email"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter phone"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter department"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter designation"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <input
                type="text"
                value={formData.role}
                readOnly
                style={{ ...styles.input, background: "#f3f4f6", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <div style={styles.buttonWrap}>
            <button type="submit" style={styles.button} disabled={saving}>
              {saving ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef4fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  topBar: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: "600",
  },
  breadcrumb: {
    color: "#2563eb",
    cursor: "pointer",
  },
  current: {
    color: "#111827",
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "30px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    marginBottom: "20px",
    color: "#1f2937",
  },
  form: {
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },
  buttonWrap: {
    marginTop: "25px",
    textAlign: "right",
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
  success: {
    color: "green",
    marginBottom: "15px",
  },
  error: {
    color: "red",
    marginBottom: "15px",
  },
};