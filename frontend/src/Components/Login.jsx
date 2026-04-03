import { useNavigate } from "react-router-dom";
import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: linear-gradient(135deg, #e5e9ee 0%, #e8eaec 40%, #cacdcf 70%, #babec0 100%);
    position: relative;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* Floating blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.45;
    animation: float 8s ease-in-out infinite;
  }
  .blob-1 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, #a5b4fc, #818cf8);
    top: -120px; left: -100px;
    animation-delay: 0s;
  }
  .blob-2 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, #fbcfe8, #f9a8d4);
    bottom: -80px; right: -60px;
    animation-delay: 2.5s;
  }
  .blob-3 {
    width: 250px; height: 250px;
    background: radial-gradient(circle, #bfdbfe, #93c5fd);
    bottom: 80px; left: 60px;
    animation-delay: 5s;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.04); }
  }

  /* Glass Card */
  .glass-card {
    position: relative;
    width: 100%;
    max-width: 440px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 24px;
    padding: 44px 40px 36px;
    box-shadow:
      0 8px 32px rgba(99, 102, 241, 0.1),
      0 2px 8px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.9);
    animation: cardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* Logo area */
  .logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
  .logo-circle {
    width: 56px; height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 20px rgba(99,102,241,0.35);
  }
  .logo-circle svg {
    color: #fff;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 4px;
    letter-spacing: -0.3px;
  }
  .card-subtitle {
    text-align: center;
    font-size: 13.5px;
    color: #6b7280;
    margin-bottom: 32px;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  /* Error */
  .error-box {
    background: rgba(254, 226, 226, 0.7);
    border: 1px solid rgba(252, 165, 165, 0.5);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13.5px;
    color: #b91c1c;
    text-align: center;
    margin-bottom: 20px;
    backdrop-filter: blur(4px);
    animation: shake 0.35s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-6px); }
    75%      { transform: translateX(6px); }
  }

  /* Field */
  .field-group {
    margin-bottom: 20px;
  }
  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .glass-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(8px);
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #1e1b4b;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-shadow: 0 2px 8px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .glass-input::placeholder { color: #9ca3af; }
  .glass-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08);
  }

  /* Password wrapper */
  .pw-wrap {
    position: relative;
  }
  .pw-wrap .glass-input {
    padding-right: 48px;
  }
  .toggle-pw {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: #9ca3af;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: #6366f1; }

  /* Submit button */
  .submit-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .submit-btn.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 8px 20px rgba(99,102,241,0.35);
  }
  .submit-btn.active:hover {
    opacity: 0.93;
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(99,102,241,0.4);
  }
  .submit-btn.active:active { transform: translateY(0); }
  .submit-btn.loading {
    background: rgba(209,213,219,0.6);
    color: #6b7280;
    cursor: not-allowed;
    backdrop-filter: blur(4px);
  }
  .submit-btn .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%);
    transform: translateX(-100%);
    transition: transform 0.5s;
  }
  .submit-btn.active:hover .btn-shine { transform: translateX(100%); }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 22px 0 0;
  }
  .divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent);
  }

  /* Forgot password */
  .forgot-wrap {
    text-align: right;
    margin-top: 14px;
  }
  .forgot-link {
    font-size: 13px;
    font-weight: 500;
    color: #6366f1;
    cursor: pointer;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
    transition: color 0.2s, text-decoration 0.2s;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: transparent;
  }
  .forgot-link:hover {
    color: #4f46e5;
    text-decoration-color: #4f46e5;
  }

  /* Loading spinner dots */
  .dot-loader {
    display: inline-flex; gap: 4px; align-items: center;
  }
  .dot-loader span {
    width: 5px; height: 5px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bounce 1s infinite ease-in-out;
  }
  .dot-loader span:nth-child(2) { animation-delay: 0.15s; }
  .dot-loader span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-5px); }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "employee" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (!["employee", "manager"].includes(String(data.user.role).toLowerCase())) {
        setError("This login is only for employees and managers");
        return;
      }

      if (data.user.approval_status && data.user.approval_status !== "approved") {
        if (data.user.approval_status === "pending") {
          setError("Your account is waiting for admin approval");
        } else if (data.user.approval_status === "rejected") {
          setError("Your account has been rejected by admin");
        } else {
          setError("Your account is not approved yet");
        }
        return;
      }

      localStorage.setItem("employeeToken", data.token);
      localStorage.setItem("employeeUser", JSON.stringify(data.user));
      console.log("Stored user:", data.user);
      alert("✅ Login Successful");
      navigate("/employeedashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        {/* Background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="glass-card">
          {/* Logo */}
          <div className="logo-wrap">
            <div className="logo-circle">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <h2 className="card-title">Welcome Back</h2>
          <p className="card-subtitle">Sign in to your employee portal</p>

          {error && <div className="error-box">⚠️ {error}</div>}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                className="glass-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="pw-wrap">
                <input
                  className="glass-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82"/>
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`submit-btn ${loading ? "loading" : "active"}`}
            >
              <span className="btn-shine" />
              {loading ? (
                <span className="dot-loader">
                  <span /><span /><span />
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
          </div>

          {/* Forgot Password */}
          <div className="forgot-wrap">
            <button className="forgot-link" onClick={() => navigate("/forget")}>
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}