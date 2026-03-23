import React, { useEffect, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

export default function UpdateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal
    full_name: "",
    dob: "",
    gender: "",
    marital_status: "",
    nationality: "",

    // Contact
    email: "",
    phone: "",
    alternate_phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Next of Kin
    kin_name: "",
    kin_relationship: "",
    kin_phone: "",
    kin_address: "",

    // Education
    qualification: "",
    institution: "",
    year_of_passing: "",

    // Guarantor
    guarantor_name: "",
    guarantor_phone: "",
    guarantor_address: "",

    // Family
    father_name: "",
    mother_name: "",
    spouse_name: "",
    children_count: "",

    // Job
    employee_id: "",
    department: "",
    designation: "",
    joining_date: "",

    // Financial
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    pan_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("employeeToken");
  const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "null");

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateForInput = (value) => {
  if (!value) return "";
  return String(value).split("T")[0];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token || !employeeUser?.id) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profile/${employeeUser.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok && data) {
        setFormData((prev) => ({
          ...prev,
          ...data,
          dob: formatDateForInput(data.dob),
          joining_date: formatDateForInput(data.joining_date),
        }));
      }
      } catch (error) {
        console.log("Fetch profile error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [token, employeeUser?.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: employeeUser?.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully");
      } else {
        setMessage(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.log("Update error:", error);
      setMessage("Server error while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "18px",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "10px",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    marginBottom: "22px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#f9fafb",
  };

  if (fetching) {
    return (
      <>
        <Header />
        <div style={{ padding: "30px", background: "#eef5ff", minHeight: "100vh" }}>
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div style={{ background: "#eef5ff", minHeight: "100vh", padding: "24px" }}>
        <div
          style={{
            background: "#fff",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "600",
            color: "#334155",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
          onClick={() => navigate("/employeedashboard")}
        >
          Dashboard &gt; Update Profile
        </div>

        <form onSubmit={handleSubmit}>
          <div style={cardStyle}>
            <div style={sectionTitle}>Personal Details</div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Full Name</label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Marital Status</label>
                <input
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Nationality</label>
                <input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Contact Details</div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Alternate Phone</label>
                <input
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label style={labelStyle}>Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Pincode</label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Next of Kin Details</div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Kin Name</label>
                <input
                  name="kin_name"
                  value={formData.kin_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Relationship</label>
                <input
                  name="kin_relationship"
                  value={formData.kin_relationship}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Phone</label>
                <input
                  name="kin_phone"
                  value={formData.kin_phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label style={labelStyle}>Address</label>
                <input
                  name="kin_address"
                  value={formData.kin_address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Education Qualifications</div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Qualification</label>
                <input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Institution</label>
                <input
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Year of Passing</label>
                <input
                  name="year_of_passing"
                  value={formData.year_of_passing}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Guarantor Details</div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Guarantor Name</label>
                <input
                  name="guarantor_name"
                  value={formData.guarantor_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Guarantor Phone</label>
                <input
                  name="guarantor_phone"
                  value={formData.guarantor_phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Guarantor Address</label>
                <input
                  name="guarantor_address"
                  value={formData.guarantor_address}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Family Details</div>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Father Name</label>
                <input
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Mother Name</label>
                <input
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Spouse Name</label>
                <input
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Children Count</label>
                <input
                  name="children_count"
                  value={formData.children_count}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Job Details</div>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Employee ID</label>
                <input
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Department</label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Designation</label>
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Joining Date</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date || ""}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitle}>Financial Details</div>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Bank Name</label>
                <input
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Account Number</label>
                <input
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>IFSC Code</label>
                <input
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label style={labelStyle}>PAN Number</label>
                <input
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "10px" }}>
            {message && (
              <span
                style={{
                  marginRight: "15px",
                  fontWeight: "600",
                  color: message.includes("success") ? "green" : "red",
                }}
              >
                {message}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                padding: "13px 24px",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}