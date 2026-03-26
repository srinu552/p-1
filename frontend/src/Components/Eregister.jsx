import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dept: "",
    jobTitle: "",
    startDate: "",
    category: "",
    gender: "",
    actions: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.dept.trim()) newErrors.dept = "Department is required";
    if (!form.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!form.startDate) newErrors.startDate = "Start date required";
    if (!form.category.trim()) newErrors.category = "Category required";
    if (!form.gender.trim()) newErrors.gender = "Gender required";
    if (!form.actions.trim()) newErrors.actions = "Actions required";

    if (!form.email.match(/^\S+@\S+\.\S+$/))
      newErrors.email = "Valid email required";

    if (!form.phone.match(/^[0-9]{10}$/))
      newErrors.phone = "Enter 10-digit phone number";

    if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.agree)
      newErrors.agree = "You must accept terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration submitted. Wait for admin approval before login.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      {open && (
        <path
          d="M4 20L20 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );

  return (
    <div className="container-fluid register-bg">
      <style>{`
        .register-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 20px;
        }
        .register-card {
          width: 100%;
          max-width: 760px;
        }
        h3 {
          color: #9c9c9c;
          font-weight: 500;
          margin-bottom: 25px;
        }
        label {
          font-weight: 600;
          color: #233a8b;
        }
        .form-control {
          border: 1.5px solid #e3c7c7;
          border-radius: 6px;
        }
        .form-control:focus {
          border-color: #233a8b;
          box-shadow: none;
        }
        .error {
          font-size: 13px;
          color: red;
        }
        .btn-primary {
          background: #233a8b;
          border: none;
          padding: 12px;
          font-size: 16px;
        }
        .btn-primary:hover {
          background: #1b2f70;
        }
        .link {
          color: #233a8b;
          font-weight: 500;
          cursor: pointer;
        }

        .password-wrap {
          position: relative;
        }

        .password-input {
          height: 56px;
          border: 1.5px solid #d9d9d9;
          border-radius: 16px;
          padding-right: 78px;
          background: #fff;
        }

        .password-input:focus {
          border-color: #233a8b;
          box-shadow: none;
        }

        .eye-btn {
          position: absolute;
          top: 0;
          right: 0;
          width: 74px;
          height: 56px;
          border: 1.5px solid #d9d9d9;
          border-left: 1.5px solid #d9d9d9;
          border-radius: 0 16px 16px 0;
          background: #fff;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }

        .eye-btn:hover {
          background: #fafafa;
          color: #333;
        }

        .eye-btn:focus {
          outline: none;
          box-shadow: none;
          border-color: #233a8b;
        }
      `}</style>

      <div className="register-card">
        <h3>Register your account</h3>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Name(s)</label>
              <input
                name="name"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.name}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Department</label>
              <input
                name="dept"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.dept}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Job Title</label>
              <input
                name="jobTitle"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.jobTitle}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.startDate}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Category</label>
              <input
                name="category"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.category}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Gender</label>
              <select
                name="gender"
                className="form-control"
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <div className="error">{errors.gender}</div>
            </div>
          </div>

          <div className="mb-3">
            <label>Actions</label>
            <input
              name="actions"
              className="form-control"
              onChange={handleChange}
            />
            <div className="error">{errors.actions}</div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Email Address</label>
              <input
                name="email"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.email}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone Number</label>
              <input
                name="phone"
                className="form-control"
                onChange={handleChange}
              />
              <div className="error">{errors.phone}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control password-input"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <div className="error">{errors.password}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Confirm Password</label>
              <div className="password-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control password-input"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              <div className="error">{errors.confirmPassword}</div>
            </div>
          </div>

          <div className="form-check mb-2">
            <input
              type="checkbox"
              name="agree"
              className="form-check-input"
              onChange={handleChange}
            />
            <label className="form-check-label">
              I agree to the <span className="link">Terms</span> &{" "}
              <span className="link">Privacy Policy</span>
            </label>
            <div className="error">{errors.agree}</div>
          </div>

          <button className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-center mt-3 text-muted">
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/login")}>
              Log In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;  