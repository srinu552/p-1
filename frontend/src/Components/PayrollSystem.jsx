import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PayrollSystem({ selectedEmployee }) {
  const slipRef = useRef();

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    designation: "",
    department: "",
    month: "",
    basic: "",
    hra: "",
    conveyance: "",
    bonus: "",
  });

  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [employeeMessage, setEmployeeMessage] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  /* ================= FETCH EMPLOYEE DETAILS ================= */
  const fetchEmployeeDetails = async (employeeId, preservePayrollFields = true) => {
    try {
      const cleanEmployeeId = employeeId?.trim();

      if (!cleanEmployeeId) {
        setEmployeeMessage("");
        setForm((prev) => ({
          ...prev,
          employeeId: "",
          name: "",
          email: "",
          designation: "",
          department: "",
        }));
        return;
      }

      setLoadingEmployee(true);
      setEmployeeMessage("");

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        setEmployeeMessage("Admin token missing. Please login again.");
        return;
      }

      const res = await fetch(
        `http://localhost:10000/api/payroll/employee-details/${cleanEmployeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          name: "",
          email: "",
          designation: "",
          department: "",
        }));
        setEmployeeMessage(data.message || "Employee not found");
        return;
      }

      setForm((prev) => ({
        ...(preservePayrollFields ? prev : {}),
        ...prev,
        employeeId: data.employee_id || cleanEmployeeId,
        name: data.name || "",
        email: data.email || "",
        designation: data.job_title || data.designation || "",
        department: data.dept || data.department || "",
      }));

      setEmployeeMessage("Employee details fetched successfully ✅");
    } catch (error) {
      console.error("FETCH EMPLOYEE ERROR:", error);
      setEmployeeMessage("Server error while fetching employee details");
    } finally {
      setLoadingEmployee(false);
    }
  };

  /* ================= AUTO FILL FROM ADMINDASHBOARD ================= */
  useEffect(() => {
    if (selectedEmployee) {
      const nextEmployeeId = selectedEmployee.employee_id || "";

      setForm((prev) => ({
        ...prev,
        employeeId: nextEmployeeId,
        name: selectedEmployee.name || selectedEmployee.full_name || "",
        email: selectedEmployee.email || "",
        designation:
          selectedEmployee.job_title ||
          selectedEmployee.designation ||
          "",
        department:
          selectedEmployee.dept ||
          selectedEmployee.department ||
          "",
      }));

      if (nextEmployeeId) {
        fetchEmployeeDetails(nextEmployeeId, true);
      } else {
        setEmployeeMessage("Employee selected successfully ✅");
      }
    }
  }, [selectedEmployee]);

  const payroll = useMemo(() => {
    const basic = toNumber(form.basic);
    const hra = toNumber(form.hra);
    const conveyance = toNumber(form.conveyance);
    const bonus = toNumber(form.bonus);

    const monthlyGross = basic + hra + conveyance + bonus;
    const annualGross = monthlyGross * 12;

    const employeePf = basic * 0.12;
    const employerPf = basic * 0.12;

    const employeeEsi = monthlyGross <= 21000 ? monthlyGross * 0.0075 : 0;
    const employerEsi = monthlyGross <= 21000 ? monthlyGross * 0.0325 : 0;

    let professionalTax = 0;
    if (monthlyGross <= 15000) {
      professionalTax = 0;
    } else if (monthlyGross <= 20000) {
      professionalTax = 150;
    } else {
      professionalTax = 200;
    }

    const standardDeduction = 75000;
    const annualTaxableIncome = Math.max(annualGross - standardDeduction, 0);

    const slabTax = (income) => {
      let tax = 0;

      if (income <= 400000) return 0;

      if (income > 400000) {
        tax += Math.max(Math.min(income, 800000) - 400000, 0) * 0.05;
      }

      if (income > 800000) {
        tax += Math.max(Math.min(income, 1200000) - 800000, 0) * 0.1;
      }

      if (income > 1200000) {
        tax += Math.max(Math.min(income, 1600000) - 1200000, 0) * 0.15;
      }

      if (income > 1600000) {
        tax += Math.max(Math.min(income, 2000000) - 1600000, 0) * 0.2;
      }

      if (income > 2000000) {
        tax += Math.max(Math.min(income, 2400000) - 2000000, 0) * 0.25;
      }

      if (income > 2400000) {
        tax += (income - 2400000) * 0.3;
      }

      return tax;
    };

    let annualIncomeTax = slabTax(annualTaxableIncome);

    if (annualTaxableIncome <= 1200000) {
      annualIncomeTax = 0;
    }

    const cess = annualIncomeTax * 0.04;
    const totalAnnualTax = annualIncomeTax + cess;
    const monthlyTds = totalAnnualTax / 12;

    const monthlyEmployeeDeductions =
      employeePf + employeeEsi + professionalTax + monthlyTds;

    const netSalary = monthlyGross - monthlyEmployeeDeductions;
    const annualNetSalary = netSalary * 12;

    return {
      basic,
      hra,
      conveyance,
      bonus,
      monthlyGross,
      annualGross,
      employeePf,
      employerPf,
      employeeEsi,
      employerEsi,
      professionalTax,
      standardDeduction,
      annualTaxableIncome,
      annualIncomeTax,
      cess,
      totalAnnualTax,
      monthlyTds,
      monthlyEmployeeDeductions,
      netSalary,
      annualNetSalary,
    };
  }, [form]);

  /* ================= SAVE TO DATABASE ================= */
  const savePayroll = async () => {
    try {
      if (!form.employeeId?.trim()) {
        alert("Employee ID is required");
        return;
      }

      if (!form.month?.trim()) {
        alert("Month is required");
        return;
      }

      const adminToken = localStorage.getItem("adminToken");

      const res = await fetch("http://localhost:10000/api/payroll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          employeeId: form.employeeId.trim().toUpperCase(),
          name: form.name,
          email: form.email,
          designation: form.designation,
          department: form.department,
          month: form.month,

          basic: payroll.basic,
          hra: payroll.hra,
          conveyance: payroll.conveyance,
          bonus: payroll.bonus,

          grossSalary: payroll.monthlyGross,

          pf: payroll.employeePf,
          esi: payroll.employeeEsi,
          ptax: payroll.professionalTax,
          tds: payroll.monthlyTds,

          totalDeductions: payroll.monthlyEmployeeDeductions,
          netSalary: payroll.netSalary,

          annualGross: payroll.annualGross,
          annualTaxableIncome: payroll.annualTaxableIncome,
          annualTax: payroll.totalAnnualTax,

          employerPf: payroll.employerPf,
          employerEsi: payroll.employerEsi,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Payroll Saved Successfully ✅");
      } else {
        alert(data.message || "Error saving payroll");
        console.log(data);
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = async () => {
    if (!slipRef.current) return;

    const canvas = await html2canvas(slipRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`SalarySlip_${form.employeeId || "Employee"}.pdf`);
  };

  return (
    <div className="container py-4">
      <style>{`
        .payroll-card {
          background: #fff;
          border: 0;
          border-radius: 20px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.08);
        }
        .section-card {
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          border: 1px solid #eef2f7;
          border-radius: 18px;
          padding: 18px;
          height: 100%;
        }
        .summary-box {
          border-radius: 18px;
          padding: 18px;
          color: #fff;
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          box-shadow: 0 10px 25px rgba(13,110,253,0.25);
        }
        .mini-stat {
          background: #f8f9fa;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid #e9ecef;
          height: 100%;
        }
        .label-title {
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 4px;
        }
        .value-strong {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .slip-box {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 18px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
      `}</style>

      <div className="card payroll-card p-4">
        <h3 className="text-center mb-4">Admin Payroll System</h3>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Employee ID</label>
            <input
              className="form-control"
              value={form.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value.toUpperCase())}
              onBlur={() => fetchEmployeeDetails(form.employeeId)}
              placeholder="Enter Employee ID"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Employee Name</label>
            <input
              className="form-control"
              value={form.name}
              readOnly
              placeholder="Employee Name"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Email</label>
            <input
              className="form-control"
              value={form.email}
              readOnly
              placeholder="Employee Email"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Designation</label>
            <input
              className="form-control"
              value={form.designation}
              readOnly
              placeholder="Employee Designation"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Department</label>
            <input
              className="form-control"
              value={form.department}
              readOnly
              placeholder="Employee Department"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Month</label>
            <input
              className="form-control"
              value={form.month}
              onChange={(e) => handleChange("month", e.target.value)}
              placeholder="Enter Month"
            />
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-info w-100"
              onClick={() => fetchEmployeeDetails(form.employeeId)}
              type="button"
            >
              Fetch Employee Details
            </button>
          </div>
        </div>

        {loadingEmployee && (
          <div className="alert alert-info py-2">
            Fetching employee details...
          </div>
        )}

        {employeeMessage && (
          <div className="alert alert-secondary py-2">
            {employeeMessage}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="section-card">
              <h5 className="mb-3">Earnings</h5>

              {[
                { key: "basic", label: "Basic" },
                { key: "hra", label: "HRA" },
                { key: "conveyance", label: "Conveyance" },
                { key: "bonus", label: "Bonus / Special Allowance" },
              ].map((field) => (
                <div className="mb-3" key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                  />
                </div>
              ))}

              <div className="row g-3 mt-1">
                <div className="col-sm-6">
                  <div className="mini-stat">
                    <div className="label-title">Monthly Gross</div>
                    <p className="value-strong">₹{payroll.monthlyGross.toFixed(2)}</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mini-stat">
                    <div className="label-title">Annual Gross</div>
                    <p className="value-strong">₹{payroll.annualGross.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="section-card">
              <h5 className="mb-3">Deductions & Tax</h5>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Employee PF (12% Basic)</span>
                <strong>₹{payroll.employeePf.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Employee ESI</span>
                <strong>₹{payroll.employeeEsi.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Professional Tax</span>
                <strong>₹{payroll.professionalTax.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Annual Taxable Income</span>
                <strong>₹{payroll.annualTaxableIncome.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Annual Income Tax</span>
                <strong>₹{payroll.annualIncomeTax.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>4% Cess</span>
                <strong>₹{payroll.cess.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Monthly TDS</span>
                <strong>₹{payroll.monthlyTds.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between pt-3">
                <span className="fw-bold">Total Monthly Deductions</span>
                <strong>₹{payroll.monthlyEmployeeDeductions.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-box mt-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="label-title text-white-50">Monthly Net Salary</div>
              <h4 className="mb-0">₹{payroll.netSalary.toFixed(2)}</h4>
            </div>
            <div className="col-md-4">
              <div className="label-title text-white-50">Annual Net Salary</div>
              <h4 className="mb-0">₹{payroll.annualNetSalary.toFixed(2)}</h4>
            </div>
            <div className="col-md-4">
              <div className="label-title text-white-50">Employer Cost (PF + ESI)</div>
              <h4 className="mb-0">
                ₹{(payroll.employerPf + payroll.employerEsi).toFixed(2)}
              </h4>
            </div>
          </div>
        </div>

        <div ref={slipRef} className="slip-box p-4 mt-4">
          <h4 className="text-center mb-4">Official Salary Slip</h4>

          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>Employee ID:</strong> {form.employeeId || "-"}</p>
              <p><strong>Employee Name:</strong> {form.name || "-"}</p>
              <p><strong>Email:</strong> {form.email || "-"}</p>
              <p><strong>Designation:</strong> {form.designation || "-"}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Department:</strong> {form.department || "-"}</p>
              <p><strong>Month:</strong> {form.month || "-"}</p>
              <p><strong>Standard Deduction:</strong> ₹{payroll.standardDeduction.toFixed(2)}</p>
            </div>
          </div>

          <hr />

          <div className="row">
            <div className="col-md-6">
              <h6>Earnings</h6>
              <p>Basic: ₹{payroll.basic.toFixed(2)}</p>
              <p>HRA: ₹{payroll.hra.toFixed(2)}</p>
              <p>Conveyance: ₹{payroll.conveyance.toFixed(2)}</p>
              <p>Bonus: ₹{payroll.bonus.toFixed(2)}</p>
              <p><strong>Gross Salary: ₹{payroll.monthlyGross.toFixed(2)}</strong></p>
            </div>

            <div className="col-md-6">
              <h6>Deductions</h6>
              <p>PF: ₹{payroll.employeePf.toFixed(2)}</p>
              <p>ESI: ₹{payroll.employeeEsi.toFixed(2)}</p>
              <p>Professional Tax: ₹{payroll.professionalTax.toFixed(2)}</p>
              <p>TDS: ₹{payroll.monthlyTds.toFixed(2)}</p>
              <p><strong>Total Deductions: ₹{payroll.monthlyEmployeeDeductions.toFixed(2)}</strong></p>
            </div>
          </div>

          <div className="alert alert-success text-center mt-3 mb-0">
            <strong>Net Salary: ₹{payroll.netSalary.toFixed(2)}</strong>
          </div>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-primary me-3" onClick={savePayroll}>
            Save Payroll
          </button>

          <button className="btn btn-success me-3" onClick={downloadPDF}>
            Download PDF
          </button>

          <button className="btn btn-dark" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}