"use client";

import { useMemo } from "react";
import StudentGuard from "../../../components/StudentGuard";
import { getDatabase, logout } from "../../../lib/local-db";

export default function StudentDashboardPage({ onLogout }) {
  return (
    <StudentGuard>
      {(session) => <StudentDashboard session={session} onLogout={onLogout} />}
    </StudentGuard>
  );
}

function StudentDashboard({
  session,
  onLogout,
}) {
  const dashboardData = useMemo(() => {
    const database = getDatabase();

    const courses = database.courses.filter(
      (course) => course.semester === session.semester
    );

    const timetable = database.timetable.filter(
      (entry) => entry.semester === session.semester
    );

    const attendance = database.attendance.filter(
      (record) => record.studentId === session.studentId
    );

    const scores = database.scores.filter(
      (score) => score.studentId === session.studentId
    );

    const presentCount = attendance.filter(
      (record) =>
        record.status === "present" || record.status === "late"
    ).length;

    const attendancePercentage =
      attendance.length === 0
        ? 0
        : Math.round((presentCount / attendance.length) * 100);

    return {
      courses,
      timetable,
      attendance,
      scores,
      attendancePercentage,
    };
  }, [session]);

  function handleLogout() {
    logout();
    if (onLogout) {
      onLogout();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return (
    <main className="student-dashboard min-h-screen bg-[#F7F4EC] p-6 lg:p-10 font-sans text-[#1B2A4A]">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D2BE] pb-6">
        <div>
          <p className="font-mono text-xs font-bold tracking-widest text-[#B8863B] uppercase">STUDENT ACADEMIC WORKSPACE</p>
          <h1 className="font-serif text-3xl font-bold text-[#1B2A4A] mt-1">Welcome, {session.studentName}</h1>

          <div className="student-identity mt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="bg-white px-2.5 py-1 rounded border border-[#D9D2BE]">USN: {session.usn}</span>
            <span className="bg-white px-2.5 py-1 rounded border border-[#D9D2BE]">Verified Semester: Semester {session.semester}</span>
            <span className="bg-white px-2.5 py-1 rounded border border-[#D9D2BE]">Section: {session.section}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#1B2A4A] text-white text-xs font-mono rounded-lg hover:bg-[#2B3A5C] transition"
        >
          Logout 🚪
        </button>
      </header>

      <section className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <article className="p-5 bg-white rounded-lg border border-[#D9D2BE] shadow-sm">
          <p className="text-[11px] font-mono text-[#5B6478] mb-1">ENROLLED COURSES</p>
          <strong className="font-mono text-2xl text-[#1B2A4A]">{dashboardData.courses.length}</strong>
        </article>

        <article className="p-5 bg-white rounded-lg border border-[#D9D2BE] shadow-sm">
          <p className="text-[11px] font-mono text-[#5B6478] mb-1">ATTENDANCE</p>
          <strong className="font-mono text-2xl text-[#2D6A4F]">{dashboardData.attendancePercentage}%</strong>
        </article>

        <article className="p-5 bg-white rounded-lg border border-[#D9D2BE] shadow-sm">
          <p className="text-[11px] font-mono text-[#5B6478] mb-1">ASSESSMENT RECORDS</p>
          <strong className="font-mono text-2xl text-[#B8863B]">{dashboardData.scores.length}</strong>
        </article>

        <article className="p-5 bg-white rounded-lg border border-[#D9D2BE] shadow-sm">
          <p className="text-[11px] font-mono text-[#5B6478] mb-1">LOCKED SEMESTER</p>
          <strong className="font-mono text-2xl text-[#1B2A4A]">Semester {session.semester}</strong>
        </article>
      </section>

      <section className="bg-white p-6 rounded-lg border border-[#D9D2BE] shadow-sm mb-8">
        <h2 className="font-serif text-xl font-bold mb-4">My Courses (Semester {session.semester})</h2>

        {dashboardData.courses.length === 0 ? (
          <p className="text-xs font-mono text-[#5B6478]">No courses have been assigned yet for Semester {session.semester}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.courses.map((course) => (
              <article key={course.id} className="p-4 rounded-lg bg-[#EFEADB] border border-[#D9D2BE]">
                <div className="font-mono text-xs font-bold text-[#B8863B] mb-1">{course.code}</div>
                <p className="font-serif font-bold text-base text-[#1B2A4A] mb-2">{course.title}</p>
                <div className="flex items-center justify-between text-xs font-mono text-[#5B6478]">
                  <span>{course.credits} Credits</span>
                  <span>Faculty: {course.facultyName || "Not assigned"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-lg border border-[#D9D2BE] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold">Class Timetable (Semester {session.semester})</h2>
          <span className="text-xs font-mono bg-[#EFEADB] px-2.5 py-1 rounded border border-[#D9D2BE] text-[#1B2A4A] font-bold">
            🗓️ Official Schedule
          </span>
        </div>

        {dashboardData.timetable.length === 0 ? (
          <p className="text-xs font-mono text-[#5B6478]">No timetable sessions scheduled yet for Semester {session.semester}.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dashboardData.timetable.map((entry) => {
              const course = dashboardData.courses.find((c) => c.id === entry.courseId || c.code === entry.courseId);
              return (
                <div key={entry.id} className="p-3.5 rounded-lg border border-[#D9D2BE] bg-[#FDFBF7] space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#B8863B]">{entry.day}</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#D9D2BE] font-bold text-[#1B2A4A]">
                      {entry.startTime} – {entry.endTime}
                    </span>
                  </div>
                  <p className="font-sans font-bold text-sm text-[#1B2A4A]">
                    {course ? `${course.code}: ${course.title}` : entry.courseId}
                  </p>
                  <div className="text-[11px] text-[#5B6478] pt-1 border-t border-[#D9D2BE]/60 flex items-center justify-between">
                    <span>Room: <strong className="text-[#1B2A4A]">{entry.room}</strong></span>
                    {course?.facultyName && <span>{course.facultyName}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
