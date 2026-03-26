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

  // added
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
      width="18"
      height="18"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      {open ? (
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.12 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
      ) : (
        <>
          <path d="M13.359 11.238 15 12.879l-.707.707-14-14 .707-.707 2.223 2.223A8.717 8.717 0 0 1 8 2.5c5 0 8 5.5 8 5.5a15.29 15.29 0 0 1-2.64 3.238zM11.297 9.176l-1.275-1.275a2 2 0 0 1-2.626-2.626L6.121 4a3 3 0 0 0 5.176 5.176z" />
          <path d="M3.98 5.394 5.59 7.005a3 3 0 0 0 3.404 3.404l1.61 1.61A7.862 7.862 0 0 1 8 12.5c-5 0-8-5.5-8-5.5a15.724 15.724 0 0 1 3.98-4.606z" />
        </>
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
        .password-group .form-control {
          border-right: 0;
        }
        .password-toggle {
          border: 1.5px solid #e3c7c7;
          border-left: 0;
          background: #fff;
          color: #233a8b;
        }
        .password-toggle:focus {
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
              <input name="name" className="form-control" onChange={handleChange} />
              <div className="error">{errors.name}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Department</label>
              <input name="dept" className="form-control" onChange={handleChange} />
              <div className="error">{errors.dept}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Job Title</label>
              <input name="jobTitle" className="form-control" onChange={handleChange} />
              <div className="error">{errors.jobTitle}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Start Date</label>
              <input type="date" name="startDate" className="form-control" onChange={handleChange} />
              <div className="error">{errors.startDate}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Category</label>
              <input name="category" className="form-control" onChange={handleChange} />
              <div className="error">{errors.category}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Gender</label>
              <select name="gender" className="form-control" onChange={handleChange}>
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
            <input name="actions" className="form-control" onChange={handleChange} />
            <div className="error">{errors.actions}</div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Email Address</label>
              <input name="email" className="form-control" onChange={handleChange} />
              <div className="error">{errors.email}</div>
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone Number</label>
              <input name="phone" className="form-control" onChange={handleChange} />
              <div className="error">{errors.phone}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Password</label>
              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn password-toggle"
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
              <div className="input-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              <div className="error">{errors.confirmPassword}</div>
            </div>
          </div>

          <div className="form-check mb-2">
            <input type="checkbox" name="agree" className="form-check-input" onChange={handleChange} />
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