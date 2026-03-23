import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../SmallComponents/Header";

export default function EmployeeSalary() {
  const [salaryData, setSalaryData] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const slipRef = useRef();

  /* ================= FETCH MY SALARY SLIPS ================= */
  useEffect(() => {
    const fetchMySlips = async () => {
      try {
        const token = localStorage.getItem("employeeToken");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payroll/my-slips`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.status === 401) {
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeUser");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          setMessage(data.message || "Failed to load salary slips");
          setLoading(false);
          return;
        }

        setSalaryData(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setSelectedSlip(data[0]);
        }
      } catch (error) {
        console.error("FETCH SLIPS ERROR:", error);
        setMessage("Server error while fetching salary slips");
      } finally {
        setLoading(false);
      }
    };

    fetchMySlips();
  }, []);

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = async () => {
    if (!slipRef.current || !selectedSlip) return;

    const canvas = await html2canvas(slipRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`SalarySlip_${selectedSlip.employee_id}_${selectedSlip.month}.pdf`);
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <style>{`
          .salary-card {
            background: #fff;
            border: 0;
            border-radius: 20px;
            box-shadow: 0 12px 35px rgba(0,0,0,0.08);
          }

          .slip-list-item {
            border: 1px solid #e9ecef;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: 0.3s;
            background: #fff;
          }

          .slip-list-item:hover {
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .slip-list-item.active {
            border: 1px solid #0d6efd;
            background: #eef5ff;
          }

          .slip-preview {
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.05);
          }

          .info-box {
            background: #f8f9fa;
            border-radius: 14px;
            padding: 12px;
            border: 1px solid #e9ecef;
          }
        `}</style>

        <div className="card salary-card p-4">
          <h3 className="text-center mb-4">My Salary Slips</h3>

          {loading && <div className="alert alert-info">Loading salary slips...</div>}
          {message && <div className="alert alert-danger">{message}</div>}

          {!loading && salaryData.length === 0 && (
            <div className="alert alert-warning text-center">
              No salary slips available.
            </div>
          )}

          {!loading && salaryData.length > 0 && (
            <div className="row g-4">
              {/* LEFT SIDE - SLIP LIST */}
              <div className="col-lg-4">
                <h5 className="mb-3">Available Slips</h5>

                {salaryData.map((slip) => (
                  <div
                    key={slip.id}
                    className={`slip-list-item ${
                      selectedSlip?.id === slip.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedSlip(slip)}
                  >
                    <p className="mb-1"><strong>Month:</strong> {slip.month}</p>
                    <p className="mb-1"><strong>Employee ID:</strong> {slip.employee_id}</p>
                    <p className="mb-0"><strong>Net Salary:</strong> ₹{Number(slip.net_salary).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* RIGHT SIDE - SLIP PREVIEW */}
              <div className="col-lg-8">
                {selectedSlip && (
                  <>
                    <div ref={slipRef} className="slip-preview p-4">
                      <h4 className="text-center mb-4">Official Salary Slip</h4>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="info-box mb-3">
                            <p className="mb-1"><strong>Employee ID:</strong> {selectedSlip.employee_id}</p>
                            <p className="mb-1"><strong>Email:</strong> {selectedSlip.email}</p>
                            <p className="mb-0"><strong>Designation:</strong> {selectedSlip.designation}</p>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="info-box mb-3">
                            <p className="mb-1"><strong>Department:</strong> {selectedSlip.department}</p>
                            <p className="mb-1"><strong>Month:</strong> {selectedSlip.month}</p>
                            <p className="mb-0"><strong>Annual Gross:</strong> ₹{Number(selectedSlip.annual_gross || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <hr />

                      <div className="row">
                        <div className="col-md-6">
                          <h5>Earnings</h5>
                          <p>Basic: ₹{Number(selectedSlip.basic).toFixed(2)}</p>
                          <p>HRA: ₹{Number(selectedSlip.hra).toFixed(2)}</p>
                          <p>Conveyance: ₹{Number(selectedSlip.conveyance).toFixed(2)}</p>
                          <p>Bonus: ₹{Number(selectedSlip.bonus).toFixed(2)}</p>
                          <p><strong>Gross Salary: ₹{Number(selectedSlip.gross_salary).toFixed(2)}</strong></p>
                        </div>

                        <div className="col-md-6">
                          <h5>Deductions</h5>
                          <p>PF: ₹{Number(selectedSlip.pf).toFixed(2)}</p>
                          <p>ESI: ₹{Number(selectedSlip.esi).toFixed(2)}</p>
                          <p>Professional Tax: ₹{Number(selectedSlip.ptax).toFixed(2)}</p>
                          <p>TDS: ₹{Number(selectedSlip.tds).toFixed(2)}</p>
                          <p><strong>Total Deductions: ₹{Number(selectedSlip.total_deductions).toFixed(2)}</strong></p>
                        </div>
                      </div>

                      <div className="alert alert-success text-center mt-4 mb-0">
                        <strong>Net Salary: ₹{Number(selectedSlip.net_salary).toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button className="btn btn-success me-3" onClick={downloadPDF}>
                        Download PDF
                      </button>

                      <button className="btn btn-dark" onClick={() => window.print()}>
                        Print
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}