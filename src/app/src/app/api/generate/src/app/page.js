"use client";
import { useState } from "react";

const STEPS = ["Your Info", "Experience", "Skills & Goals", "Your Resume"];

const initialForm = {
  fullName: "", email: "", phone: "", city: "",
  jobTitle: "", industry: "", summary: "",
  jobs: [{ company: "", title: "", years: "", duties: "" }],
  education: "", skills: "", goal: "",
};

function Label({ children }) {
  return <div style={{ fontSize: 10, letterSpacing: 3, color: "#888", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, multiline, rows = 3 }) {
  const base = { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", fontSize: 14, padding: "12px 14px", fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box", resize: "vertical" };
  return multiline
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} />
    : <input value={value} onChange={onChange} placeholder={placeholder} style={{ ...base, height: 44 }} />;
}

function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ flex: 1 }}>
          <div style={{ height: 3, background: i <= step ? "#c8a84b" : "#1e1e1e", marginBottom: 6 }} />
          <div style={{ fontSize: 9, letterSpacing: 2, color: i === step ? "#c8a84b" : "#444", fontFamily: "monospace", textAlign: "center" }}>{s.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setJob = (i, field) => (e) => {
    const jobs = [...form.jobs];
    jobs[i] = { ...jobs[i], [field]: e.target.value };
    setForm({ ...form, jobs });
  };
  const addJob = () => setForm({ ...form, jobs: [...form.jobs, { company: "", title: "", years: "", duties: "" }] });
  const removeJob = (i) => setForm({ ...form, jobs: form.jobs.filter((_, j) => j !== i) });

  const generateResume = async () => {
    setLoading(true); setError(""); setResume("");
    const jobsText = form.jobs.map((j, i) => `Job ${i + 1}:\n  Company: ${j.company}\n  Title: ${j.title}\n  Years: ${j.years}\n  Duties: ${j.duties}`).join("\n\n");
    const prompt = `You are a professional resume writer. Create a polished ATS-friendly resume.\n\nName: ${form.fullName}\nEmail: ${form.email}\nPhone: ${form.phone}\nCity: ${form.city}\nTarget Role: ${form.jobTitle}\nIndustry: ${form.industry}\nGoal: ${form.goal}\n\nWork Experience:\n${jobsText}\n\nEducation: ${form.education}\nSkills: ${form.skills}\nExtra: ${form.summary}\n\nWrite a complete professional resume with contact header, professional summary, work experience with achievement bullet points, education, and skills. Use plain text with === underlines for section headers.`;
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await response.json();
      if (data.resume) { setResume(data.resume); setStep(3); }
      else setError("Something went wrong. Try again.");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  const copyResume = () => { navigator.clipboard.writeText(resume); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const reset = () => { setForm(initialForm); setResume(""); setStep(0); setError(""); };

  const btnStyle = (primary, disabled) => ({
    flex: primary ? 2 : 1, padding: "14px 20px",
    background: disabled ? "#1a1a1a" : primary ? "#c8a84b" : "none",
    border: primary ? "none" : "1px solid #2a2a2a",
    color: disabled ? "#444" : primary ? "#0a0a0a" : "#666",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12, letterSpacing: 2, fontFamily: "monospace"
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e0d0", fontFamily: "'Georgia', serif", paddingBottom: 60 }}>
      <div style={{ background: "linear-gradient(180deg, #16120a 0%, #0a0a0a 100%)", borderBottom: "2px solid #c8a84b", padding: "28px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#c8a84b", fontFamily: "monospace", marginBottom: 8 }}>AI-POWERED</div>
        <h1 style={{ fontSize: 26, fontWeight: "normal", margin: "0 0 6px", color: "#f0e8d0" }}>Resume Writer</h1>
        <p style={{ color: "#666", fontSize: 13, margin: 0, fontStyle: "italic" }}>Professional resumes in 60 seconds</p>
      </div>

      <div style={{ padding: "28px 16px", maxWidth: 580, margin: "0 auto" }}>
        {step < 3 && <ProgressBar step={step} />}

        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: "normal", marginBottom: 24, color: "#f0e8d0" }}>Let's start with the basics</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={set("fullName")} placeholder="John Smith" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={set("email")} placeholder="john@email.com" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} placeholder="(780) 555-0000" /></div>
              <div><Label>City / Province</Label><Input value={form.city} onChange={set("city")} placeholder="Edmonton, AB" /></div>
              <div><Label>Job Title You're Applying For</Label><Input value={form.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Project Manager, Welder" /></div>
              <div><Label>Industry</Label><Input value={form.industry} onChange={set("industry")} placeholder="e.g. Oil & Gas, Construction, Finance" /></div>
            </div>
            <button onClick={() => setStep(1)} disabled={!form.fullName || !form.email || !form.jobTitle} style={{ marginTop: 28, width: "100%", padding: 16, background: form.fullName && form.email && form.jobTitle ? "#c8a84b" : "#1a1a1a", color: form.fullName && form.email && form.jobTitle ? "#0a0a0a" : "#444", border: "none", fontSize: 13, letterSpacing: 3, fontFamily: "monospace", cursor: "pointer" }}>NEXT →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: "normal", marginBottom: 8, color: "#f0e8d0" }}>Work Experience</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 24, fontStyle: "italic" }}>Most recent first. Don't worry about wording — AI handles that.</p>
            {form.jobs.map((job, i) => (
              <div key={i} style={{ marginBottom: 20, padding: 16, border: "1px solid #1e1e1e", background: "#0f0f0f" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a84b", fontFamily: "monospace" }}>JOB {i + 1}</div>
                  {form.jobs.length > 1 && <button onClick={() => removeJob(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>×</button>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><Label>Company Name</Label><Input value={job.company} onChange={setJob(i, "company")} placeholder="Acme Corp" /></div>
                  <div><Label>Your Job Title</Label><Input value={job.title} onChange={setJob(i, "title")} placeholder="Lead Technician" /></div>
                  <div><Label>Years Worked</Label><Input value={job.years} onChange={setJob(i, "years")} placeholder="2019 – 2023" /></div>
                  <div><Label>What Did You Do?</Label><Input value={job.duties} onChange={setJob(i, "duties")} placeholder="- Managed a team of 6&#10;- Reduced downtime by 30%" multiline rows={4} /></div>
                </div>
              </div>
            ))}
            <button onClick={addJob} style={{ width: "100%", padding: 12, background: "none", border: "1px dashed #333", color: "#888", cursor: "pointer", fontSize: 12, letterSpacing: 2, fontFamily: "monospace", marginBottom: 24 }}>+ ADD ANOTHER JOB</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={btnStyle(false, false)}>← BACK</button>
              <button onClick={() => setStep(2)} style={btnStyle(true, false)}>NEXT →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: "normal", marginBottom: 8, color: "#f0e8d0" }}>Skills & Final Details</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 24, fontStyle: "italic" }}>The more detail here, the better your resume.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div><Label>Education</Label><Input value={form.education} onChange={set("education")} placeholder="Red Deer Polytechnic — Heavy Equipment Tech, 2008" multiline rows={2} /></div>
              <div><Label>Skills</Label><Input value={form.skills} onChange={set("skills")} placeholder="H2S Alive, First Aid, Class 1 License..." multiline rows={3} /></div>
              <div><Label>Career Goal</Label><Input value={form.goal} onChange={set("goal")} placeholder="Looking to move into a supervisory role..." multiline rows={3} /></div>
              <div><Label>Anything Else?</Label><Input value={form.summary} onChange={set("summary")} placeholder="Awards, certs, languages..." multiline rows={3} /></div>
            </div>
            {error && <div style={{ marginTop: 16, padding: 12, background: "#1a0a0a", border: "1px solid #4a1a1a", color: "#c05050", fontSize: 13 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={btnStyle(false, false)}>← BACK</button>
              <button onClick={generateResume} disabled={loading} style={btnStyle(true, loading)}>{loading ? "GENERATING..." : "BUILD MY RESUME →"}</button>
            </div>
            {loading && <div style={{ marginTop: 20, textAlign: "center", color: "#c8a84b", fontSize: 12, letterSpacing: 2, fontFamily: "monospace" }}>WRITING YOUR RESUME...</div>}
          </div>
        )}

        {step === 3 && resume && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#c8a84b", fontFamily: "monospace", marginBottom: 4 }}>COMPLETE</div>
                <h2 style={{ fontSize: 20, fontWeight: "normal", margin: 0, color: "#f0e8d0" }}>Your Resume</h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyResume} style={{ padding: "10px 16px", background: copied ? "#1a2a1a" : "#c8a84b", border: "none", color: copied ? "#4caf82" : "#0a0a0a", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "monospace" }}>{copied ? "COPIED ✓" : "COPY"}</button>
                <button onClick={reset} style={{ padding: "10px 16px", background: "none", border: "1px solid #2a2a2a", color: "#666", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "monospace" }}>NEW</button>
              </div>
            </div>
            <div style={{ background: "#f8f6f0", color: "#1a1a1a", padding: "28px 24px", fontFamily: "'Georgia', serif", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", border: "1px solid #ddd", minHeight: 400 }}>{resume}</div>
            <div style={{ marginTop: 20, padding: 16, background: "#0f120f", border: "1px solid #1e2e1e" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#4caf82", fontFamily: "monospace", marginBottom: 8 }}>NEXT STEPS</div>
              <div style={{ color: "#888", fontSize: 13, lineHeight: 1.7 }}>1. Copy the resume above<br />2. Paste into Google Docs or Word<br />3. Set font to Calibri, size 11<br />4. Save as PDF before sending</div>
            </div>
            <button onClick={reset} style={{ marginTop: 16, width: "100%", padding: 14, background: "none", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", fontSize: 12, letterSpacing: 2, fontFamily: "monospace" }}>← BUILD ANOTHER RESUME</button>
          </div>
        )}
      </div>
    </div>
  );
}
