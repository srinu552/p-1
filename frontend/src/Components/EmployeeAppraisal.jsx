import { useState } from "react";

export default function EmployeeAppraisal() {
  const [form, setForm] = useState({
    goals: "",
    achievements: "",
    challenges: "",
    self_rating: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:10000/api/appraisal/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("employeeToken")
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    alert("Appraisal Submitted");
  };

  return (
    <div>
      <h2>Self Appraisal</h2>

      <form onSubmit={handleSubmit}>
        <textarea placeholder="Goals" onChange={(e)=>setForm({...form, goals:e.target.value})} />
        <textarea placeholder="Achievements" onChange={(e)=>setForm({...form, achievements:e.target.value})} />
        <textarea placeholder="Challenges" onChange={(e)=>setForm({...form, challenges:e.target.value})} />

        <input
          type="number"
          placeholder="Self Rating (1-5)"
          onChange={(e)=>setForm({...form, self_rating:e.target.value})}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}