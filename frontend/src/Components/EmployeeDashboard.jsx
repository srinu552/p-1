import React, { useEffect, useMemo, useState, useCallback } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   ICON COMPONENTS  (no extra lib needed)
───────────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Icons = {
  leave:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  payslip:  "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  profile:  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  attend:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  appraise: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  review:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  sun:      "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon:     "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  task:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  announce: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  wallet:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a2 2 0 00-3 3v8a3 3 0 003 3z",
  manager:  "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  arrow:    "M17 8l4 4m0 0l-4 4m4-4H3",
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem("empDash_theme") === "dark");
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [salaryMessage, setSalaryMessage] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const toggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("empDash_theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const getPriorityMeta = (priority) => {
    const v = String(priority || "Medium").toLowerCase();
    if (v === "high") return { cls: "p-high", label: "High" };
    if (v === "low") return { cls: "p-low", label: "Low" };
    return { cls: "p-medium", label: "Medium" };
  };

  const loadUser = () => {
    try {
      const src = ["employeeUser", "managerUser", "adminUser", "user"]
        .map((k) => localStorage.getItem(k))
        .find(Boolean);
      setLoggedUser(src ? JSON.parse(src) : null);
    } catch {
      setLoggedUser(null);
    }
  };

  const getToken = () =>
    localStorage.getItem("employeeToken") || localStorage.getItem("managerToken");

  const apiFetch = async (url) => {
    const t = getToken();
    if (!t) return null;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${t}` },
    });
    return r.ok ? r.json() : null;
  };

  const fetchTasks = async () => {
    const d = await apiFetch("${import.meta.env.VITE_API_URL}/api/employee-dashboard/my-tasks");
    setTasks(Array.isArray(d) ? d : Array.isArray(d?.tasks) ? d.tasks : []);
  };

  const fetchAnnouncements = async () => {
    const d = await apiFetch("${import.meta.env.VITE_API_URL}/api/employee-dashboard/announcements");
    setAnnouncements(
      Array.isArray(d)
        ? d
        : Array.isArray(d?.announcements)
        ? d.announcements
        : Array.isArray(d?.data)
        ? d.data
        : []
    );
  };

  const fetchSlips = async () => {
    try {
      const t = getToken();
      if (!t) {
        setSalaryMessage("Please login again");
        return;
      }

      const r = await fetch("${import.meta.env.VITE_API_URL}/api/payroll/my-slips", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
      });

      const d = await r.json();

      if (!r.ok) {
        setSalaryMessage(d.message || "Failed to load");
        setSalaryData([]);
        return;
      }

      const slips = Array.isArray(d) ? d : [];
      setSalaryData(slips);
      setSelectedSlip(slips[0] || null);
    } catch {
      setSalaryMessage("Server error");
    }
  };

  useEffect(() => {
    loadUser();
    fetchTasks();
    fetchAnnouncements();
    fetchSlips();
    setTimeout(() => setMounted(true), 60);
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "empDash_theme") {
        setDark(event.newValue === "dark");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const normalizedRole = String(loggedUser?.role || "").toLowerCase();
  const isManager = normalizedRole === "manager";

  const quickActions = useMemo(() => {
    const base = [
      { label: "Apply Leave", path: "/leaveapplication", icon: Icons.leave },
      { label: "View Payslip", path: "/employeepayroll", icon: Icons.payslip },
      { label: "Update Profile", path: "/update", icon: Icons.profile },
      { label: "Attendance", path: "/employeeattendance", icon: Icons.attend },
      { label: "Appraisal", path: "/employeeapparsal", icon: Icons.appraise },
    ];

    if (isManager) {
      base.push({
        label: "Review Employees",
        path: "/manager-review",
        icon: Icons.review,
      });
    }

    return base;
  }, [isManager]);

  // KEEP ALL YOUR EXISTING CSS + REMAINING JSX BELOW EXACTLY SAME

  const payRows = [
    ["Basic Wage","basic","PF","pf"],
    ["HRA","hra","ESI","esi"],
    ["Conveyance","conveyance","Prof. Tax","ptax"],
    ["Bonus","bonus","TDS","tds"],
  ];

  /* ─────────── CSS ─────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    /* ═══════════════════ VARIABLES ═══════════════════ */
    .emp-dash {
      --font:       'Plus Jakarta Sans', sans-serif;
      --mono:       'JetBrains Mono', monospace;

      /* ── Light palette ── */
      --bg:         #eef1f8;
      --orb-a:      rgba(99,102,241,.13);
      --orb-b:      rgba(14,165,233,.10);
      --orb-c:      rgba(168,85,247,.08);

      --g-bg:       rgba(255,255,255,.68);
      --g-border:   rgba(255,255,255,.92);
      --g-rim:      rgba(255,255,255,.95);
      --g-inner:    rgba(255,255,255,.42);
      --g-shadow:   0 8px 32px rgba(15,23,42,.08), 0 1.5px 3px rgba(15,23,42,.04);
      --g-hover:    0 20px 56px rgba(15,23,42,.13), 0 2px 4px rgba(15,23,42,.06);
      --noise:      .028;

      --txt:        #0f172a;
      --txt2:       #475569;
      --txt3:       #94a3b8;
      --txt-inv:    #ffffff;

      --accent:     #4f46e5;
      --accent2:    #0ea5e9;
      --grad:       linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
      --asoft:      rgba(79,70,229,.08);
      --aborder:    rgba(79,70,229,.18);
      --divider:    rgba(148,163,184,.16);
      --row-h:      rgba(238,242,255,.55);
      --net-bg:     rgba(79,70,229,.07);
      --net-fg:     #4338ca;
      --chip-bg:    rgba(79,70,229,.09);
      --chip-fg:    #4f46e5;

      --ph-bg: rgba(239,68,68,.10);   --ph-fg: #dc2626;
      --pm-bg: rgba(34,197,94,.10);   --pm-fg: #16a34a;
      --pl-bg: rgba(249,115,22,.10);  --pl-fg: #ea580c;

      --btn-sh:     0 4px 18px rgba(79,70,229,.28);
      --scroll:     rgba(99,102,241,.22);
      --trans:      background .42s ease, color .42s ease, border-color .42s ease, box-shadow .42s ease;
    }

    .emp-dash.dark {
      --bg:         #070b12;
      --orb-a:      rgba(99,102,241,.20);
      --orb-b:      rgba(14,165,233,.13);
      --orb-c:      rgba(168,85,247,.15);

      --g-bg:       rgba(13,19,33,.72);
      --g-border:   rgba(99,102,241,.20);
      --g-rim:      rgba(255,255,255,.07);
      --g-inner:    rgba(255,255,255,.03);
      --g-shadow:   0 8px 40px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35);
      --g-hover:    0 22px 60px rgba(0,0,0,.60), 0 0 0 1px rgba(99,102,241,.28);
      --noise:      .045;

      --txt:        #f0f4ff;
      --txt2:       #8b9ab5;
      --txt3:       #3d4d66;
      --txt-inv:    #ffffff;

      --accent:     #dbeafe;
      --accent2:    #eff6ff;
      --grad:       linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
      --asoft:      rgba(129,140,248,.10);
      --aborder:    rgba(129,140,248,.24);
      --divider:    rgba(99,102,241,.14);
      --row-h:      rgba(99,102,241,.08);
      --net-bg:     rgba(99,102,241,.14);
      --net-fg:     #a5b4fc;
      --chip-bg:    rgba(129,140,248,.12);
      --chip-fg:    #a5b4fc;

      --ph-bg: rgba(239,68,68,.14);   --ph-fg: #f87171;
      --pm-bg: rgba(34,197,94,.12);   --pm-fg: #4ade80;
      --pl-bg: rgba(251,146,60,.12);  --pl-fg: #fb923c;

      --btn-sh:     0 4px 24px rgba(99,102,241,.36);
      --scroll:     rgba(129,140,248,.28);
    }

    /* ═══════════════════ BASE ═══════════════════ */
    .emp-dash *, .emp-dash *::before, .emp-dash *::after { box-sizing:border-box; margin:0; padding:0; }

    .emp-dash {
      min-height:100vh;
      font-family: var(--font);
      background: var(--bg);
      color: var(--txt);
      overflow-x: hidden;
      position: relative;
      transition: var(--trans);
    }

    /* ── Noise overlay ── */
    .emp-dash::after {
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: var(--noise);
      mix-blend-mode: overlay;
      transition: opacity .42s ease;
    }

    /* ── Orbs ── */
    .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:orbDrift 20s ease-in-out infinite; }
    .orb-a { width:700px; height:700px; background:var(--orb-a); top:-200px; left:-200px; animation-delay:0s; }
    .orb-b { width:520px; height:520px; background:var(--orb-b); top:38%; right:-140px; animation-delay:-7s; }
    .orb-c { width:400px; height:400px; background:var(--orb-c); bottom:-60px; left:28%; animation-delay:-13s; }
    @keyframes orbDrift {
      0%,100% { transform:translate(0,0) scale(1); }
      33%      { transform:translate(28px,-22px) scale(1.04); }
      66%      { transform:translate(-18px,16px) scale(0.97); }
    }

    /* ── Glass card ── */
    .glass {
      background: var(--g-bg);
      backdrop-filter: blur(28px) saturate(200%) brightness(1.02);
      -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.02);
      border: 1px solid var(--g-border);
      box-shadow: var(--g-shadow);
      border-radius: 22px;
      position: relative;
      overflow: hidden;
      transition: var(--trans), transform .30s ease;
    }
    /* Top rim highlight */
    .glass::before {
      content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:0;
      background: linear-gradient(155deg, var(--g-rim) 0%, transparent 38%);
      opacity: .55;
    }
    /* Bottom inner fill */
    .glass::after {
      content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:0;
      background: linear-gradient(to bottom, transparent 50%, var(--g-inner) 100%);
    }
    .glass > * { position:relative; z-index:1; }
    .glass:hover { box-shadow:var(--g-hover); transform:translateY(-3px); }

    /* ═══════════════════ LAYOUT ═══════════════════ */
    .dash-body  { position:relative; z-index:1; padding-bottom:64px; }
    .dash-inner { max-width:1340px; margin:0 auto; padding:28px 28px; }

    /* mount animation */
    .m-anim { opacity:0; transform:translateY(16px); transition:opacity .55s ease, transform .55s ease; }
    .m-anim.in { opacity:1; transform:translateY(0); }
    .d1{transition-delay:.04s} .d2{transition-delay:.11s}
    .d3{transition-delay:.18s} .d4{transition-delay:.25s}

    /* ═══════════════════ TOPBAR ═══════════════════ */
    .topbar { display:flex; justify-content:flex-end; margin-bottom:20px; }

    .toggle-pill {
      display:flex; align-items:center; gap:9px;
      background: var(--g-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--g-border);
      border-radius: 999px;
      padding: 7px 16px 7px 12px;
      cursor:pointer;
      color: var(--txt2);
      font-family: var(--font); font-size:12px; font-weight:700;
      letter-spacing:.04em;
      transition: all .28s ease;
      box-shadow: var(--g-shadow);
    }
    .toggle-pill:hover { color:var(--accent); border-color:var(--aborder); transform:scale(1.03); }

    .tog-track {
      width:38px; height:21px;
      background: var(--divider);
      border-radius:999px; position:relative;
      transition: background .3s ease; flex-shrink:0;
    }
    .tog-track.on { background: var(--grad); }
    .tog-thumb {
      position:absolute; top:2.5px; left:2.5px;
      width:16px; height:16px;
      background:white; border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,.22);
      transition: transform .3s cubic-bezier(.34,1.56,.64,1);
    }
    .tog-track.on .tog-thumb { transform:translateX(17px); }

    /* ═══════════════════ PROFILE ═══════════════════ */
    .profile-card {
      padding:24px 28px;
      display:flex; justify-content:space-between; align-items:center;
      gap:16px; flex-wrap:wrap; margin-bottom:28px;
    }
    .prof-left { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }

    .av-ring {
      padding:2.5px;
      background: var(--grad);
      border-radius:19px; flex-shrink:0;
      box-shadow:0 6px 22px rgba(79,70,229,.32);
      transition: box-shadow .3s ease;
    }
    .av-ring:hover { box-shadow:0 10px 32px rgba(79,70,229,.44); }
    .avatar {
      width:60px; height:60px;
      background: var(--g-bg);
      color:var(--accent);
      border-radius:17px;
      display:flex; align-items:center; justify-content:center;
      font-weight:800; font-size:23px; text-transform:uppercase; letter-spacing:-0.5px;
    }

    .prof-name  { font-size:19px; font-weight:800; color:var(--txt); margin-bottom:4px; letter-spacing:-.3px; }
    .prof-meta  { font-size:13px; color:var(--txt2); margin-bottom:7px; }
    .role-chip  {
      display:inline-flex; align-items:center; gap:5px;
      padding:3px 11px;
      background:var(--chip-bg); color:var(--chip-fg);
      border:1px solid var(--aborder);
      border-radius:999px; font-size:11px; font-weight:700;
      text-transform:capitalize; letter-spacing:.04em;
    }

    .edit-btn {
      display:inline-flex; align-items:center; gap:8px;
      background: var(--grad); color:white; border:none;
      padding:11px 22px; border-radius:13px;
      font-family:var(--font); font-size:13px; font-weight:700;
      cursor:pointer; letter-spacing:.02em; white-space:nowrap;
      box-shadow: var(--btn-sh);
      transition: all .25s ease;
    }
    .edit-btn:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 10px 30px rgba(79,70,229,.42); }
    .edit-btn:active { transform:scale(.98); }

    /* ═══════════════════ SECTION LABEL ═══════════════════ */
    .sec-label {
      font-size:11px; font-weight:700; letter-spacing:.10em; text-transform:uppercase;
      color:var(--txt3); margin-bottom:14px;
      display:flex; align-items:center; gap:10px;
    }
    .sec-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,var(--divider),transparent); }

    /* ═══════════════════ QUICK ACTIONS ═══════════════════ */
    .qa-grid {
      display:grid;
      grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
      gap:12px; margin-bottom:32px;
    }

    .qa-btn {
      background: var(--g-bg);
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border:1px solid var(--g-border);
      box-shadow: var(--g-shadow);
      border-radius:17px;
      padding:21px 12px 17px;
      display:flex; flex-direction:column; align-items:center; gap:10px;
      cursor:pointer;
      font-family:var(--font); font-size:12.5px; font-weight:700;
      color:var(--txt2); text-align:center; line-height:1.3;
      position:relative; overflow:hidden;
      transition: all .28s cubic-bezier(.34,1.56,.64,1);
    }
    .qa-btn::before {
      content:''; position:absolute; inset:0; border-radius:inherit;
      background: var(--grad); opacity:0;
      transition: opacity .25s ease;
    }
    .qa-btn > * { position:relative; z-index:1; }
    .qa-btn:hover {
      transform:translateY(-7px);
      color:white; border-color:transparent;
      box-shadow:0 16px 40px rgba(79,70,229,.32);
    }
    .qa-btn:hover::before { opacity:1; }
    .qa-btn:hover .qa-icon { background:rgba(255,255,255,.18); color:white; }
    .qa-btn:active { transform:translateY(-2px) scale(.97); }

    .qa-icon {
      width:42px; height:42px;
      background:var(--asoft); border-radius:13px;
      display:flex; align-items:center; justify-content:center;
      color:var(--accent);
      transition: all .25s ease;
    }

    /* ═══════════════════ CARDS GRID ═══════════════════ */
    .cards-grid { display:grid; grid-template-columns:1fr 1fr; gap:22px; }

    .card-box { padding:24px; }

    .card-head {
      display:flex; justify-content:space-between; align-items:center;
      gap:12px; flex-wrap:wrap; margin-bottom:16px;
    }
    .card-title {
      display:flex; align-items:center; gap:10px;
      font-size:14.5px; font-weight:800;
      color:var(--txt); letter-spacing:-.2px;
    }
    .ct-icon {
      width:34px; height:34px;
      background:var(--asoft); border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      color:var(--accent);
    }

    /* ── Task items ── */
    .task-list { display:flex; flex-direction:column; gap:8px; }
    .task-item {
      background:var(--g-inner); border:1px solid var(--divider);
      border-radius:13px; padding:13px 15px;
      transition:all .22s ease; cursor:default;
    }
    .task-item:hover { background:var(--row-h); border-color:var(--aborder); transform:translateX(4px); }
    .task-name { font-size:13.5px; font-weight:700; color:var(--txt); margin-bottom:8px; line-height:1.35; }
    .task-foot { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .task-due  { font-family:var(--mono); font-size:11px; color:var(--txt3); }

    /* Priority */
    .p-high   { background:var(--ph-bg); color:var(--ph-fg); }
    .p-medium { background:var(--pm-bg); color:var(--pm-fg); }
    .p-low    { background:var(--pl-bg); color:var(--pl-fg); }
    .pri-badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 9px; border-radius:999px;
      font-size:10.5px; font-weight:800; letter-spacing:.04em;
    }
    .pri-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }

    /* ── Announcement items ── */
    .ann-list { display:flex; flex-direction:column; gap:8px; }
    .ann-item {
      background:var(--g-inner); border:1px solid var(--divider);
      border-left:3px solid var(--accent);
      border-radius:0 13px 13px 0; padding:12px 15px;
      font-size:13px; color:var(--txt2); line-height:1.65;
      transition:all .22s ease;
    }
    .ann-item:hover { background:var(--row-h); border-left-color:var(--accent2); transform:translateX(4px); }

    /* ── Empty state ── */
    .empty { text-align:center; padding:30px 16px; color:var(--txt3); font-size:13px; }
    .empty-icon { font-size:32px; opacity:.5; margin-bottom:6px; }

    /* ── Pay slip ── */
    .slip-select {
      background:var(--g-inner); border:1px solid var(--divider);
      border-radius:10px; padding:6px 12px;
      font-family:var(--font); font-size:12px; font-weight:600;
      color:var(--txt2); cursor:pointer; outline:none;
      transition:border .2s ease;
    }
    .slip-select:focus { border-color:var(--accent); color:var(--txt); }

    .ps-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; margin-top:8px; }
    .ps-scroll::-webkit-scrollbar { height:4px; }
    .ps-scroll::-webkit-scrollbar-track { background:transparent; }
    .ps-scroll::-webkit-scrollbar-thumb { background:var(--scroll); border-radius:99px; }

    .ps-tbl { width:100%; border-collapse:collapse; min-width:360px; }
    .ps-tbl thead tr { background:var(--grad); }
    .ps-tbl thead th {
      padding:9px 13px; text-align:left;
      font-size:10.5px; font-weight:700; letter-spacing:.07em;
      text-transform:uppercase; color:rgba(255,255,255,.90);
    }
    .ps-tbl thead th:first-child { border-radius:11px 0 0 11px; }
    .ps-tbl thead th:last-child  { border-radius:0 11px 11px 0; }
    .ps-tbl tbody tr { border-bottom:1px solid var(--divider); transition:background .15s; }
    .ps-tbl tbody tr:last-child { border-bottom:none; }
    .ps-tbl tbody tr:hover { background:var(--row-h); }
    .ps-tbl td { padding:8px 13px; vertical-align:middle; }
    .ps-lbl  { font-size:12px; color:var(--txt2); font-weight:500; }
    .ps-val  { font-family:var(--mono); font-size:11.5px; font-weight:600; color:var(--txt); }
    .ps-ded  { font-family:var(--mono); font-size:11.5px; font-weight:600; color:var(--ph-fg); }

    .ps-totrow td { font-weight:700; color:var(--txt); border-top:1px solid var(--divider); padding-top:10px; }
    .ps-netrow { background:var(--net-bg) !important; }
    .ps-netrow td {
      color:var(--net-fg) !important; font-weight:800 !important;
      font-size:13px !important; padding-top:11px; padding-bottom:11px;
    }
    .ps-netrow td:last-child { font-family:var(--mono); font-size:14px !important; }

    /* ── Salary alert ── */
    .sal-warn {
      background:rgba(245,158,11,.10); border:1px solid rgba(245,158,11,.25);
      border-radius:10px; padding:8px 14px;
      font-size:12.5px; color:#b45309; margin-bottom:10px;
    }
    .dark .sal-warn { color:#fbbf24; background:rgba(245,158,11,.08); }

    /* ── Manager card ── */
    .mgr-card {
      background: linear-gradient(135deg,rgba(99,102,241,.09) 0%,var(--g-bg) 100%) !important;
      border-color:var(--aborder) !important;
    }
    .mgr-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:4px 13px;
      background:var(--grad); color:white;
      border-radius:999px; font-size:10.5px; font-weight:800;
      letter-spacing:.06em; text-transform:uppercase;
      margin-bottom:12px;
      box-shadow:0 3px 14px rgba(79,70,229,.28);
    }
    .mgr-desc { font-size:13px; color:var(--txt2); line-height:1.68; margin:8px 0 16px; }
    .mgr-btn {
      display:inline-flex; align-items:center; gap:8px;
      background:linear-gradient(135deg,#2563eb,#3b82f6);
      color:white; border:none;
      padding:11px 22px; border-radius:13px;
      font-family:var(--font); font-size:13px; font-weight:700;
      cursor:pointer;
      box-shadow:0 4px 18px rgba(37,99,235,.28);
      transition:all .25s ease;
    }
    .mgr-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(37,99,235,.38); }

    /* ═══════════════════ RESPONSIVE ═══════════════════ */

    /* XL ≥ 1280 */
    @media (min-width:1280px) {
      .dash-inner { padding:32px 40px; }
      .qa-grid { grid-template-columns:repeat(auto-fill,minmax(165px,1fr)); gap:14px; }
      .cards-grid { gap:26px; }
    }

    /* LG 1024–1279 */
    @media (min-width:1024px) and (max-width:1279px) {
      .dash-inner { padding:26px 28px; }
      .qa-grid { grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); }
      .cards-grid { gap:20px; }
    }

    /* MD 768–1023  ← REFINED */
    @media (min-width:768px) and (max-width:1023px) {
      .dash-inner { padding:22px 20px; }
      .profile-card { padding:20px 22px; }
      .prof-name { font-size:17px; }
      .avatar { width:52px; height:52px; font-size:19px; border-radius:16px; }

      .qa-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
      .qa-btn   { padding:18px 10px 15px; font-size:11.5px; gap:8px; }
      .qa-icon  { width:36px; height:36px; border-radius:11px; }

      .cards-grid { grid-template-columns:1fr 1fr; gap:16px; }
      .card-box   { padding:20px; }
      .card-title { font-size:13.5px; }

      .ps-tbl thead th { padding:8px 10px; font-size:10px; }
      .ps-tbl td       { padding:7px 10px; }
      .ps-val, .ps-ded { font-size:11px; }
    }

    /* SM 576–767 */
    @media (min-width:576px) and (max-width:767px) {
      .dash-inner { padding:16px 16px; }
      .profile-card { padding:18px; gap:14px; }
      .prof-name  { font-size:16px; }
      .avatar     { width:48px; height:48px; font-size:17px; border-radius:14px; }

      .qa-grid { grid-template-columns:repeat(3,1fr); gap:9px; }
      .qa-btn  { padding:16px 8px 13px; font-size:11px; gap:7px; }
      .qa-icon { width:34px; height:34px; border-radius:10px; }

      .cards-grid { grid-template-columns:1fr; gap:14px; }
      .card-box   { padding:18px; }
    }

    /* XS < 576 */
    @media (max-width:575px) {
      .dash-inner { padding:12px 13px; }
      .profile-card { padding:16px; flex-direction:column; align-items:flex-start; gap:14px; }
      .edit-btn { width:100%; justify-content:center; }
      .avatar   { width:44px; height:44px; font-size:16px; border-radius:13px; }
      .prof-name { font-size:15px; }
      .prof-meta { font-size:12px; }

      .qa-grid { grid-template-columns:repeat(2,1fr); gap:8px; }
      .qa-btn  { padding:15px 6px 13px; font-size:11px; gap:6px; border-radius:14px; }
      .qa-icon { width:32px; height:32px; border-radius:9px; }

      .cards-grid { grid-template-columns:1fr; gap:12px; }
      .card-box { padding:14px 16px; }
      .card-title { font-size:13px; }

      .ps-tbl { min-width:340px; }
      .ps-tbl thead th  { padding:7px 8px; font-size:9.5px; }
      .ps-tbl td        { padding:6.5px 8px; }
      .ps-lbl           { font-size:11px; }
      .ps-val, .ps-ded  { font-size:10.5px; }
      .ps-netrow td       { font-size:12px !important; }
      .ps-netrow td:last-child { font-size:13px !important; }
    }
  `;

  return (
    <>
      <style>{css}</style>

      <div className={`emp-dash${dark ? " dark" : ""}`}>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />

        <Header dark={dark} onToggleTheme={toggleDark} />

        <div className="dash-body">
          <div className="dash-inner">

           
            {/* ── Profile Card ── */}
            <div className={`glass profile-card m-anim d1 ${mounted ? "in" : ""}`}>
              <div className="prof-left">
                <div className="av-ring">
                  <div className="avatar">
                    {loggedUser?.name ? loggedUser.name.charAt(0) : "U"}
                  </div>
                </div>
                <div>
                  <p className="prof-name">{loggedUser?.name || "Employee Name"}</p>
                  <p className="prof-meta">
                    {loggedUser?.dept || loggedUser?.department || "Department"}
                    {loggedUser?.job_title ? ` · ${loggedUser.job_title}` : ""}
                  </p>
                  {loggedUser?.role && (
                    <span className="role-chip">
                      <Icon d={Icons.manager} size={10} />
                      {loggedUser.role}
                    </span>
                  )}
                </div>
              </div>
              <button className="edit-btn" onClick={() => navigate("/update")}>
                <Icon d={Icons.edit} size={14} />
                Edit Profile
              </button>
            </div>

            {/* ── Quick Actions ── */}
            <p className={`sec-label m-anim d2 ${mounted ? "in" : ""}`}>Quick Actions</p>
            <div className={`qa-grid m-anim d2 ${mounted ? "in" : ""}`}>
              {quickActions.map((item, i) => (
                <button key={i} className="qa-btn" onClick={() => navigate(item.path)}>
                  <div className="qa-icon"><Icon d={item.icon} size={17} /></div>
                  {item.label}
                </button>
              ))}
            </div>

            {/* ── Dashboard Cards ── */}
            <p className={`sec-label m-anim d3 ${mounted ? "in" : ""}`}>Overview</p>
            <div className={`cards-grid m-anim d3 ${mounted ? "in" : ""}`}>

              {/* Tasks */}
              <div className="glass card-box">
                <div className="card-head">
                  <div className="card-title">
                    <div className="ct-icon"><Icon d={Icons.task} size={15} /></div>
                    My Tasks
                  </div>
                  {tasks.length > 0 && (
                    <span className="role-chip">{tasks.length} pending</span>
                  )}
                </div>
                {tasks.length === 0 ? (
                  <div className="empty"><div className="empty-icon">✅</div>No tasks assigned</div>
                ) : (
                  <div className="task-list">
                    {tasks.map((task) => {
                      const p = getPriorityMeta(task.priority);
                      return (
                        <div key={task.id} className="task-item">
                          <p className="task-name">{task.title}</p>
                          <div className="task-foot">
                            <span className={`pri-badge ${p.cls}`}>
                              <span className="pri-dot" />{p.label}
                            </span>
                            <span className="task-due">
                              Due: {task.due_date ? String(task.due_date).split("T")[0] : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Announcements */}
              <div className="glass card-box">
                <div className="card-head">
                  <div className="card-title">
                    <div className="ct-icon"><Icon d={Icons.announce} size={15} /></div>
                    Announcements
                  </div>
                  {announcements.length > 0 && (
                    <span className="role-chip">{announcements.length} new</span>
                  )}
                </div>
                {announcements.length === 0 ? (
                  <div className="empty"><div className="empty-icon">🔔</div>No announcements</div>
                ) : (
                  <div className="ann-list">
                    {announcements.map((item) => (
                      <div key={item.id || item.announcement_id} className="ann-item">
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payslip */}
              <div className="glass card-box">
                <div className="card-head">
                  <div className="card-title">
                    <div className="ct-icon"><Icon d={Icons.wallet} size={15} /></div>
                    {selectedSlip?.month ? `${selectedSlip.month} Payslip` : "Pay Slip"}
                  </div>
                  {salaryData.length > 1 && (
                    <select
                      className="slip-select"
                      value={selectedSlip?.id || ""}
                      onChange={(e) => {
                        const s = salaryData.find((x) => String(x.id) === e.target.value);
                        setSelectedSlip(s || null);
                      }}
                    >
                      {salaryData.map((s) => (
                        <option key={s.id} value={s.id}>{s.month}</option>
                      ))}
                    </select>
                  )}
                </div>

                {salaryMessage && <div className="sal-warn">{salaryMessage}</div>}

                {!selectedSlip ? (
                  <div className="empty"><div className="empty-icon">📄</div>No salary slip available</div>
                ) : (
                  <div className="ps-scroll">
                    <table className="ps-tbl">
                      <thead>
                        <tr>
                          <th>Earnings</th><th>Amount</th>
                          <th>Deductions</th><th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payRows.map(([el, ek, dl, dk]) => (
                          <tr key={ek}>
                            <td className="ps-lbl">{el}</td>
                            <td className="ps-val">₹{Number(selectedSlip?.[ek] || 0).toFixed(2)}</td>
                            <td className="ps-lbl">{dl}</td>
                            <td className="ps-ded">-₹{Number(selectedSlip?.[dk] || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="ps-totrow">
                          <td className="ps-lbl">Gross Salary</td>
                          <td className="ps-val">₹{Number(selectedSlip?.gross_salary || 0).toFixed(2)}</td>
                          <td className="ps-lbl">Total Deductions</td>
                          <td className="ps-ded">-₹{Number(selectedSlip?.total_deductions || 0).toFixed(2)}</td>
                        </tr>
                        <tr className="ps-netrow">
                          <td colSpan="3" className="ps-lbl">💰 Net Salary</td>
                          <td>₹{Number(selectedSlip?.net_salary || 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Manager Panel */}
              {isManager && (
                <div className="glass card-box mgr-card">
                  <div className="mgr-badge">
                    <Icon d={Icons.manager} size={11} />
                    Manager Access
                  </div>
                  <div className="card-title">
                    <div className="ct-icon"><Icon d={Icons.review} size={15} /></div>
                    Review Employees
                  </div>
                  <p className="mgr-desc">
                    Access team performance dashboards, review submitted appraisals, and manage employee evaluations from the manager portal.
                  </p>
                  <button className="mgr-btn" onClick={() => navigate("/manager-review")}>
                    <Icon d={Icons.review} size={14} />
                    Open Review Portal
                    <Icon d={Icons.arrow} size={13} />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}