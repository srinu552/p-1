import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../SmallComponents/Header";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .es-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0f9ff 100%);
    position: relative;
    overflow-x: hidden;
    padding-bottom: 48px;
  }

  .es-blob { position: fixed; border-radius: 50%; pointer-events: none; animation: esFloat 10s ease-in-out infinite; }
  .es-b1 { width:500px;height:500px;background:radial-gradient(circle,#93c5fd55,#3b82f645);filter:blur(90px);top:-150px;left:-120px;animation-delay:0s; }
  .es-b2 { width:380px;height:380px;background:radial-gradient(circle,#bfdbfe50,#60a5fa40);filter:blur(80px);bottom:-100px;right:-80px;animation-delay:3.5s; }
  @keyframes esFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }

  .es-inner { max-width: 1100px; margin: 0 auto; padding: 32px 16px 0; }

  /* page header */
  .es-page-header {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px; padding: 26px 32px; margin-bottom: 22px;
    display: flex; align-items: center; gap: 18px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: esIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes esIn { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:none} }

  .es-avatar {
    width:60px;height:60px;border-radius:18px;flex-shrink:0;
    background:linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 20px rgba(37,99,235,0.35);
  }
  .es-page-title { font-size: 22px; font-weight: 700; color: #1e3a8a; letter-spacing: -0.4px; margin: 0 0 3px; }
  .es-page-sub   { font-size: 13px; color: #64748b; margin: 0; }

  /* glass card */
  .es-card {
    background: rgba(255,255,255,0.58);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px; padding: 24px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: esIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* layout */
  .es-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
  @media (max-width: 900px) { .es-layout { grid-template-columns: 1fr; } }

  /* slip list */
  .es-list-title { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }

  .es-slip-item {
    border: 1.5px solid rgba(226,232,240,0.7);
    border-radius: 14px; padding: 14px 16px; margin-bottom: 10px;
    cursor: pointer; transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;
    background: rgba(255,255,255,0.6);
  }
  .es-slip-item:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(59,130,246,0.12); }
  .es-slip-item.active { border-color: #3b82f6; background: rgba(239,246,255,0.75); }

  .es-slip-month { font-size: 14px; font-weight: 700; color: #1e3a8a; margin: 0 0 3px; }
  .es-slip-id    { font-size: 12px; color: #64748b; margin: 0 0 6px; }
  .es-slip-net   { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }

  /* preview */
  .es-preview {
    background: #fff;
    border: 1.5px solid rgba(226,232,240,0.7);
    border-radius: 18px; padding: 28px;
  }

  .es-preview-title { font-size: 18px; font-weight: 700; color: #1e3a8a; text-align: center; margin-bottom: 22px; }

  .es-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  @media (max-width: 600px) { .es-info-grid { grid-template-columns: 1fr; } }

  .es-info-box {
    background: rgba(248,250,252,0.9); border: 1px solid rgba(226,232,240,0.7);
    border-radius: 12px; padding: 14px;
  }
  .es-info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; gap: 8px; }
  .es-info-row:last-child { margin-bottom: 0; }
  .es-info-label { color: #64748b; font-weight: 500; flex-shrink: 0; }
  .es-info-val   { color: #0f172a; font-weight: 600; text-align: right; }

  .es-hr { height: 1px; background: rgba(226,232,240,0.7); margin: 20px 0; }

  .es-earnings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media (max-width: 600px) { .es-earnings-grid { grid-template-columns: 1fr; } }

  .es-section-head { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.6px; }
  .es-line { display: flex; justify-content: space-between; font-size: 13.5px; padding: 7px 0; border-bottom: 1px solid rgba(226,232,240,0.5); }
  .es-line:last-child { border-bottom: none; }
  .es-line-label { color: #475569; }
  .es-line-val   { color: #0f172a; font-weight: 500; }
  .es-line-strong .es-line-label,
  .es-line-strong .es-line-val { font-weight: 700; color: #0f172a; font-size: 14px; }

  .es-net-box {
    background: linear-gradient(135deg,#1e3a8a,#2563eb 70%);
    border-radius: 14px; padding: 16px 24px; text-align: center; margin-top: 4px;
  }
  .es-net-label { font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; margin-bottom: 2px; }
  .es-net-amount { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }

  /* action buttons */
  .es-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
  .es-btn {
    flex: 1; min-width: 130px; padding: 12px 20px;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
    border: none; border-radius: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.14s, box-shadow 0.2s;
  }
  .es-btn:hover { transform: translateY(-1.5px); }
  .es-btn-pdf   { background: linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; box-shadow:0 4px 16px rgba(37,99,235,0.28); }
  .es-btn-print { background: rgba(15,23,42,0.06); color:#0f172a; border: 1.5px solid rgba(203,213,225,0.8); }
  .es-btn-pdf:hover   { box-shadow:0 8px 24px rgba(37,99,235,0.36); }
  .es-btn-print:hover { background: rgba(15,23,42,0.10); }

  /* alerts */
  .es-alert { padding:12px 16px; border-radius:12px; font-size:13.5px; font-weight:500; margin-bottom:16px; }
  .es-alert-info    { background:rgba(219,234,254,0.7); color:#1d4ed8; border:1px solid rgba(147,197,253,0.5); }
  .es-alert-danger  { background:rgba(254,226,226,0.7); color:#b91c1c; border:1px solid rgba(252,165,165,0.5); }
  .es-alert-warning { background:rgba(254,243,199,0.7); color:#b45309; border:1px solid rgba(253,230,138,0.5); }
`;

export default function EmployeeSalary() {
  const [salaryData,   setSalaryData]   = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [message,      setMessage]      = useState("");
  const slipRef = useRef();

  /* ─── fetch ─── */
  useEffect(() => {
    const fetchMySlips = async () => {
      try {
        const token = localStorage.getItem("employeeToken");
        if (!token) { window.location.href = "/login"; return; }
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/payroll/my-slips`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeUser");
          window.location.href = "/login"; return;
        }
        if (!res.ok) { setMessage(data.message || "Failed to load salary slips"); setLoading(false); return; }
        setSalaryData(Array.isArray(data) ? data : []);
        if (data.length > 0) setSelectedSlip(data[0]);
      } catch { setMessage("Server error while fetching salary slips"); }
      finally { setLoading(false); }
    };
    fetchMySlips();
  }, []);

  /* ─── pdf ─── */
  const downloadPDF = async () => {
    if (!slipRef.current || !selectedSlip) return;
    const canvas   = await html2canvas(slipRef.current, { scale: 2 });
    const imgData  = canvas.toDataURL("image/png");
    const pdf      = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`SalarySlip_${selectedSlip.employee_id}_${selectedSlip.month}.pdf`);
  };

  const fmt = (v) => `₹${Number(v || 0).toFixed(2)}`;

  return (
    <>
      <style>{css}</style>
      <Header />
      <div className="es-root">
        <div className="es-blob es-b1" /><div className="es-blob es-b2" />
        <div className="es-inner">

          {/* page header */}
          <div className="es-page-header">
            <div className="es-avatar">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="es-page-title">My Salary Slips</p>
              <p className="es-page-sub">View and download your payroll records</p>
            </div>
          </div>

          {/* alerts */}
          {loading  && <div className="es-alert es-alert-info">Loading salary slips…</div>}
          {message  && <div className="es-alert es-alert-danger">{message}</div>}
          {!loading && salaryData.length === 0 && !message && (
            <div className="es-alert es-alert-warning">No salary slips available.</div>
          )}

          {/* main layout */}
          {!loading && salaryData.length > 0 && (
            <div className="es-layout">

              {/* LEFT — slip list */}
              <div className="es-card" style={{animationDelay:"0.08s", alignSelf:"start"}}>
                <p className="es-list-title">Available Slips</p>
                {salaryData.map((slip) => (
                  <div
                    key={slip.id}
                    className={`es-slip-item${selectedSlip?.id === slip.id ? " active" : ""}`}
                    onClick={() => setSelectedSlip(slip)}
                  >
                    <p className="es-slip-month">{slip.month}</p>
                    <p className="es-slip-id">ID: {slip.employee_id}</p>
                    <p className="es-slip-net">{fmt(slip.net_salary)}</p>
                  </div>
                ))}
              </div>

              {/* RIGHT — preview */}
              {selectedSlip && (
                <div className="es-card" style={{animationDelay:"0.14s"}}>
                  <div ref={slipRef} className="es-preview">
                    <p className="es-preview-title">Official Salary Slip</p>

                    <div className="es-info-grid">
                      <div className="es-info-box">
                        <div className="es-info-row"><span className="es-info-label">Employee ID</span><span className="es-info-val">{selectedSlip.employee_id}</span></div>
                        <div className="es-info-row"><span className="es-info-label">Email</span><span className="es-info-val">{selectedSlip.email}</span></div>
                        <div className="es-info-row"><span className="es-info-label">Designation</span><span className="es-info-val">{selectedSlip.designation}</span></div>
                      </div>
                      <div className="es-info-box">
                        <div className="es-info-row"><span className="es-info-label">Department</span><span className="es-info-val">{selectedSlip.department}</span></div>
                        <div className="es-info-row"><span className="es-info-label">Month</span><span className="es-info-val">{selectedSlip.month}</span></div>
                        <div className="es-info-row"><span className="es-info-label">Annual Gross</span><span className="es-info-val">{fmt(selectedSlip.annual_gross)}</span></div>
                      </div>
                    </div>

                    <div className="es-hr" />

                    <div className="es-earnings-grid">
                      {/* earnings */}
                      <div>
                        <p className="es-section-head">Earnings</p>
                        {[["Basic", selectedSlip.basic],["HRA", selectedSlip.hra],["Conveyance", selectedSlip.conveyance],["Bonus", selectedSlip.bonus]].map(([k,v]) => (
                          <div className="es-line" key={k}><span className="es-line-label">{k}</span><span className="es-line-val">{fmt(v)}</span></div>
                        ))}
                        <div className="es-line es-line-strong"><span className="es-line-label">Gross Salary</span><span className="es-line-val">{fmt(selectedSlip.gross_salary)}</span></div>
                      </div>
                      {/* deductions */}
                      <div>
                        <p className="es-section-head">Deductions</p>
                        {[["PF", selectedSlip.pf],["ESI", selectedSlip.esi],["Professional Tax", selectedSlip.ptax],["TDS", selectedSlip.tds]].map(([k,v]) => (
                          <div className="es-line" key={k}><span className="es-line-label">{k}</span><span className="es-line-val">{fmt(v)}</span></div>
                        ))}
                        <div className="es-line es-line-strong"><span className="es-line-label">Total Deductions</span><span className="es-line-val">{fmt(selectedSlip.total_deductions)}</span></div>
                      </div>
                    </div>

                    <div className="es-net-box">
                      <p className="es-net-label">NET SALARY</p>
                      <p className="es-net-amount">{fmt(selectedSlip.net_salary)}</p>
                    </div>
                  </div>

                  {/* action buttons */}
                  <div className="es-actions">
                    <button className="es-btn es-btn-pdf" onClick={downloadPDF}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download PDF
                    </button>
                    <button className="es-btn es-btn-print" onClick={() => window.print()}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}