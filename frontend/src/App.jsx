import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import Register from "./Components/Eregister";
import EmployeeDashboard from "./Components/EmployeeDashboard";
import NotFound from "./Components/NotFound";
import UpdateProfile from "./Components/UpdateProfile";
import AdminLogin from "./Components/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import EmployeeSalary from "./Components/EmployeePayroll";
import EmployeeAttendance from "./Components/EmployeeAttendance";
import LeaveApplication from "./Components/LeaveApplication";
import ApplyLeaveForm from "./Components/ApplyLeaveForm";
import LeaveView from "./Components/LeaveView";
import AdminProfileUpdate from "./Components/AdminProfileUpdate";
import EmployeeAppraisal from "./Components/EmployeeAppraisal";
import ManagerReviewPage from "./Components/ManagerReviewPage";



function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgotPassword />} />
        <Route path="/eregister" element={<Register/>} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/employeedashboard" element={<EmployeeDashboard />} />
        <Route path="/employeepayroll" element={<EmployeeSalary/>} />
        <Route path="/update" element={<UpdateProfile/>} />
        <Route path="/adminlogin" element={<AdminLogin/>} />
        <Route path="/admindashboard" element={<AdminDashboard/>} />
        <Route path="/employeeattendance" element={<EmployeeAttendance />} />
        <Route path="/employeeapparsal" element={<EmployeeAppraisal />} />
        <Route path="/leaveapplication" element={<LeaveApplication />} />
        <Route path="/apply-leave/:type" element={<ApplyLeaveForm />} />
        <Route path="/leave-view/:id" element={<LeaveView />} />
        <Route path="/admin-profile" element={<AdminProfileUpdate />} />
        <Route path="/manager-review" element={<ManagerReviewPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
