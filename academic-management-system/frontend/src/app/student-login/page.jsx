"use client";

import { useState } from "react";
import { getDatabase, saveSession } from "../../lib/local-db";

export default function StudentLoginPage({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");

  function verifyStudent(event) {
    event.preventDefault();
    setError("");

    const selectedSemester = Number(semester);

    if (!name.trim() || !selectedSemester) {
      setError("Enter your registered name and select your semester.");
      return;
    }

    const database = getDatabase();

    const student = database.students.find(
      (item) =>
        item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        item.semester === selectedSemester
    );

    if (!student) {
      setError(
        "Student record was not found. Enter your registered name and correct semester."
      );
      return;
    }

    const session = {
      role: "student",
      studentId: student.id,
      studentName: student.name,
      usn: student.usn,
      semester: student.semester,
      section: student.section,
      loginAt: new Date().toISOString(),
    };

    saveSession(session);

    if (onLoginSuccess) {
      onLoginSuccess(session);
    } else if (typeof window !== "undefined") {
      window.location.href = "/student/dashboard";
    }
  }

  return (
    <main className="student-login-page min-h-screen flex items-center justify-center bg-[var(--parchment,#F7F4EC)] p-4">
      <section className="student-login-card max-w-md w-full bg-white p-8 rounded-xl border border-[var(--rule,#D9D2BE)] shadow-xl">
        <p className="eyebrow text-[10px] font-mono font-bold tracking-widest text-[#B8863B] uppercase mb-2">STUDENT PLATFORM</p>

        <h1 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-2">Verify Student Access</h1>

        <p className="text-xs text-[#5B6478] mb-6">
          Enter your registered name and select your current BCA semester.
        </p>

        <form onSubmit={verifyStudent} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-mono font-semibold text-[#1B2A4A] mb-1">Registered Student Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter full registered name (e.g. Rahul Kumar)"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full p-2.5 text-xs border border-[#D9D2BE] rounded-lg focus:outline-none focus:border-[#B8863B]"
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-xs font-mono font-semibold text-[#1B2A4A] mb-1">Current Semester</label>
            <select
              id="semester"
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="w-full p-2.5 text-xs border border-[#D9D2BE] rounded-lg focus:outline-none focus:border-[#B8863B]"
            >
              <option value="">Select your semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>

          {error && <p className="form-error text-xs font-mono text-red-700 bg-red-50 p-2.5 rounded border border-red-200">{error}</p>}

          <button type="submit" className="w-full py-2.5 px-4 bg-[#1B2A4A] text-white font-mono text-xs font-bold rounded-lg hover:bg-[#2B3A5C] transition">
            Verify and Continue →
          </button>
        </form>
      </section>
    </main>
  );
}
