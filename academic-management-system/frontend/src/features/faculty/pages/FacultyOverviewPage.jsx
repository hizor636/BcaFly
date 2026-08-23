import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const FacultyOverviewPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    timetableEntries,
    assignments,
    submissions,
    activities,
    helpdeskTickets,
    announcements,
    detailedAttendance,
    assessmentMarks,
    attendanceSessions
  } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  // Filter courses assigned to Prof. K. Rao (FAC02) or default teaching assignments
  const facultyId = user?.id || 'FAC02';
  const facultyName = user?.name || 'Prof. K. Rao';

  const myCourses = courses.filter(
    c => c.facultyId === facultyId || c.code === 'BCA302' || c.code === 'BCA305L'
  );

  // Today's classes for faculty
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDayName = dayNames[new Date().getDay()] || 'MONDAY';
  const effectiveDay = todayDayName === 'SUNDAY' ? 'MONDAY' : todayDayName;

  const todayFacultyClasses = timetableEntries.filter(
    t => t.dayOfWeek === effectiveDay &&
         (t.facultyId === facultyId || t.substituteFacultyId === facultyId || myCourses.some(mc => mc.code === t.courseCode))
  );

  // Pending Actions
  const ungradedSubmissions = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'LATE');
  const pendingOdRequests = activities.filter(a => a.status === 'SUBMITTED');
  const pendingCorrectionRequests = (detailedAttendance?.correctionRequests || []).filter(r => r.status === 'UNDER_REVIEW');
  const openStudentQueries = helpdeskTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-lg border border-[var(--rule)] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2 font-bold">
            <span>👨‍🏫</span> AUTHORISED INSTRUCTOR WORKSPACE
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            Welcome back, {facultyName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--slate)] mt-1.5">
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--ink)]">
              Designation: <strong>Associate Professor</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Assigned Semester: <strong className="text-[var(--ink)]">Semester {activeSemester}</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Department: <strong className="text-[var(--ink)]">Computer Applications</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/faculty/attendance')}
            className="btn-ink px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>⏱️</span> Take Attendance
          </button>
          <button
            onClick={() => navigate('/faculty/assessments')}
            className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📋</span> Enter Assessment Marks
          </button>
        </div>
      </div>

      {/* Quick Actions Launcher */}
      <div className="bg-[var(--parchment-2)] p-3 rounded-lg border border-[var(--rule)] flex items-center justify-between overflow-x-auto gap-2 text-xs font-mono">
        <span className="text-[var(--slate)] font-bold uppercase tracking-wider shrink-0 pl-1">QUICK ACTIONS:</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/faculty/attendance')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            ⏱️ Take Attendance
          </button>
          <button onClick={() => navigate('/faculty/assignments')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📝 Create Assignment
          </button>
          <button onClick={() => navigate('/faculty/materials')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📁 Upload Material
          </button>
          <button onClick={() => navigate('/faculty/announcements')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📢 Post Notice
          </button>
          <button onClick={() => navigate('/faculty/activities')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            🎖️ Review OD Claims ({pendingOdRequests.length})
          </button>
          <button onClick={() => navigate('/faculty/reports')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📈 Course Performance
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="MY ASSIGNED COURSES"
          value={`${myCourses.length} Courses`}
          subtitle="BCA302 (Theory) & BCA305L (Lab)"
          onClick={() => navigate('/faculty/courses')}
        />
        <MetricCard
          title="TOTAL ENROLLED STUDENTS"
          value={`${students.length} Students`}
          subtitle="Semester 3 Section A & B"
          valueColor="text-[var(--ink)]"
        />
        <MetricCard
          title="PENDING EVALUATIONS"
          value={`${ungradedSubmissions.length} Submissions`}
          subtitle="Assignments awaiting review"
          valueColor={ungradedSubmissions.length > 0 ? 'text-amber-800' : 'text-emerald-800'}
          onClick={() => navigate('/faculty/assignments')}
        />
        <MetricCard
          title="STUDENT REQUESTS & OD"
          value={`${pendingOdRequests.length + pendingCorrectionRequests.length} Pending`}
          subtitle="OD verification & attendance appeals"
          valueColor={pendingOdRequests.length > 0 ? 'text-red-700' : 'text-emerald-800'}
          onClick={() => navigate('/faculty/activities')}
        />
      </div>

      {/* 2-Column Faculty Dashboard */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Teaching Schedule & Assigned Courses */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Teaching Schedule */}
          <div className="card p-5 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>🗓️</span> Today&apos;s Teaching Schedule ({effectiveDay})
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">
                  {todayFacultyClasses.length} lectures &amp; lab sessions allocated
                </p>
              </div>
              <button
                onClick={() => navigate('/faculty/timetable')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                Full Schedule →
              </button>
            </div>

            {todayFacultyClasses.length === 0 ? (
              <p className="text-xs font-mono text-[var(--slate)] py-4 text-center">
                No teaching sessions scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todayFacultyClasses.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.status === 'CANCELLED'
                        ? 'bg-red-50/70 border-red-200'
                        : idx === 0
                        ? 'bg-[var(--parchment-2)] border-[var(--brass)] shadow-2xs'
                        : 'bg-white border-[var(--rule)] hover:border-[var(--slate-light)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--ink)]">
                          {item.startTime} – {item.endTime}
                        </span>
                        <Badge variant={item.sessionType === 'LAB' ? 'ink' : 'pass'}>
                          {item.sessionType}
                        </Badge>
                        <span className="font-mono text-xs text-[var(--slate)]">📍 {item.room}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)]">
                        <span className="font-mono text-xs text-[var(--brass-2)] font-bold mr-1.5">{item.courseCode}</span>
                        {item.courseName}
                      </h4>
                      {item.notice && (
                        <p className="text-[11px] font-mono text-[var(--slate)] mt-1 italic">
                          ℹ️ {item.notice}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => navigate('/faculty/attendance')}
                      className="btn-ink px-3 py-1.5 rounded text-xs font-mono font-bold shrink-0 shadow-2xs cursor-pointer"
                    >
                      Start Attendance ⏱️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Courses Overview */}
          <div className="card p-5 bg-white">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                Assigned Courses (Semester {activeSemester})
              </h3>
              <button
                onClick={() => navigate('/faculty/courses')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                Manage All →
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              {myCourses.map((c) => (
                <div key={c.id || c.code} className="p-4 rounded-lg bg-[var(--parchment)] border border-[var(--rule)] hover:border-[var(--brass)] transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{c.code}</span>
                    <Badge variant={c.type?.includes('Lab') ? 'ink' : 'pass'}>{c.type}</Badge>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--ink)] line-clamp-1">{c.name || c.title}</h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--slate)] pt-2 border-t border-[var(--rule)]/60">
                    <span>Credits: <strong>{c.credits}</strong></span>
                    <span>Room: <strong>{c.room || 'Room 302'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/faculty/courses/${c.code}`)}
                      className="flex-1 py-1 bg-white hover:bg-[var(--brass-soft)] border border-[var(--rule)] rounded font-mono text-[11px] font-bold text-[var(--ink)] transition text-center cursor-pointer"
                    >
                      Workspace 📂
                    </button>
                    <button
                      onClick={() => navigate('/faculty/assessments')}
                      className="flex-1 btn-brass py-1 rounded font-mono text-[11px] font-bold text-center cursor-pointer"
                    >
                      Marks 📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Action Queue & Requests */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Item Queue */}
          <div className="card p-5 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>⚡</span> Faculty Action Queue
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">Tasks requiring your attention</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Task 1: Attendance */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-amber-900">Attendance Pending</div>
                  <div className="text-[11px] text-amber-800">BCA302 — Today Period 1</div>
                </div>
                <button
                  onClick={() => navigate('/faculty/attendance')}
                  className="px-2.5 py-1 bg-amber-700 text-white rounded font-bold text-[11px] cursor-pointer"
                >
                  Enter Now
                </button>
              </div>

              {/* Task 2: Ungraded Assignments */}
              {ungradedSubmissions.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-blue-900">{ungradedSubmissions.length} Ungraded Submissions</div>
                    <div className="text-[11px] text-blue-800">Wireshark &amp; Multithreading Lab</div>
                  </div>
                  <button
                    onClick={() => navigate('/faculty/assignments')}
                    className="px-2.5 py-1 bg-blue-800 text-white rounded font-bold text-[11px] cursor-pointer"
                  >
                    Grade
                  </button>
                </div>
              )}

              {/* Task 3: OD Claims */}
              {pendingOdRequests.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-emerald-900">{pendingOdRequests.length} OD Claims to Verify</div>
                    <div className="text-[11px] text-emerald-800">SIH Hackathon &amp; Symposia</div>
                  </div>
                  <button
                    onClick={() => navigate('/faculty/activities')}
                    className="px-2.5 py-1 bg-emerald-800 text-white rounded font-bold text-[11px] cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              )}

              {/* Task 4: Attendance Correction */}
              {pendingCorrectionRequests.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50/70 border border-red-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-red-900">{pendingCorrectionRequests.length} Attendance Appeal</div>
                    <div className="text-[11px] text-red-800">Biometric reader glitch report</div>
                  </div>
                  <button
                    onClick={() => navigate('/faculty/attendance')}
                    className="px-2.5 py-1 bg-red-700 text-white rounded font-bold text-[11px] cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student Requests & Helpdesk Queries */}
          <div className="card p-5 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>💬</span> Student Academic Queries
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">{openStudentQueries.length} open tickets</p>
              </div>
              <button
                onClick={() => navigate('/faculty/student-requests')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {openStudentQueries.length === 0 ? (
              <p className="text-xs font-mono text-[var(--slate)] text-center py-3">No pending student queries.</p>
            ) : (
              <div className="space-y-2.5">
                {openStudentQueries.slice(0, 2).map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-lg bg-[var(--parchment)] border border-[var(--rule)] space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[var(--brass-2)]">{ticket.studentName}</span>
                      <Badge variant="amber">{ticket.category}</Badge>
                    </div>
                    <h4 className="font-bold text-xs text-[var(--ink)]">{ticket.subject}</h4>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => navigate('/faculty/student-requests')}
                        className="text-[11px] font-mono font-bold text-[var(--brass-2)] hover:underline cursor-pointer"
                      >
                        Reply to Student →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
