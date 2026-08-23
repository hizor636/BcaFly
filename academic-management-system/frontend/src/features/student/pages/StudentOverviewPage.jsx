import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { MetricCard } from '../../../components/ui/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const StudentOverviewPage = () => {
  const {
    activeSemester,
    activeWorkspace,
    activities,
    timetableEntries,
    announcements,
    assignments,
    submissions,
    detailedAttendance,
    assessmentMarks,
    examResults,
    helpdeskTickets
  } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  // Current student object matching user
  const currentStudent = students.find(
    s => s.name?.toLowerCase() === (user?.name || 'rahul kumar').toLowerCase() || s.reg === user?.usn || s.id === user?.id
  ) || students[0] || {
    name: user?.name || 'Rahul Kumar',
    reg: user?.usn || 'BCS23CA001',
    attendance: 88,
    sgpa: 8.85,
    cgpa: 8.92,
    section: 'A',
    batch: '2024–27',
    resultStatus: 'PASS'
  };

  // Compute Today's classes from Timetable
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDayName = dayNames[new Date().getDay()] || 'MONDAY';
  // Default to MONDAY or WEDNESDAY schedule if Sunday/Saturday for demo purposes
  const effectiveDay = todayDayName === 'SUNDAY' ? 'MONDAY' : todayDayName;
  const todaysClasses = timetableEntries.filter(
    t => t.dayOfWeek === effectiveDay && (!t.semesterId || t.semesterId === String(activeSemester))
  );

  // Check pending assignments
  const pendingAssignments = assignments.filter(asg => {
    const sub = submissions.find(s => s.assignmentId === asg.id && (s.studentId === currentStudent.id || s.studentId === 'student-s3-001'));
    return !sub || sub.status === 'DRAFT';
  });

  // Unread announcements
  const unreadAnnouncements = announcements.filter(a => !a.isRead);

  // Shortage risk courses (< 75%)
  const riskCourses = (detailedAttendance?.summary || []).filter(s => s.attendancePercentage < 75);

  // Open Helpdesk tickets
  const openTickets = helpdeskTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  // Activities
  const myActivities = activities.filter(
    a => a.studentName?.toLowerCase() === currentStudent.name.toLowerCase() || a.studentId === currentStudent.id || a.studentId === 'student-s3-001'
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-lg border border-[var(--rule)] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2 font-bold">
            <span>🎓</span> VERIFIED STUDENT ACADEMIC WORKSPACE
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            Welcome back, {currentStudent.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--slate)] mt-1.5">
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--ink)]">
              USN / Reg No: <strong className="text-[var(--brass-2)]">{currentStudent.reg || currentStudent.usn}</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Semester: <strong className="text-[var(--ink)]">Semester {activeSemester}</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Section: <strong className="text-[var(--ink)]">{currentStudent.section || 'A'}</strong>
            </span>
            <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)]">
              Batch: <strong className="text-[var(--ink)]">{currentStudent.batch || '2024–27'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/timetable')}
            className="btn-ink px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🗓️</span> View Timetable
          </button>
          <button
            onClick={() => navigate('/student/submit-activity')}
            className="btn-brass px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🎖️</span> Submit Activity / OD
          </button>
        </div>
      </div>

      {/* Action-Oriented Quick Launcher */}
      <div className="bg-[var(--parchment-2)] p-3 rounded-lg border border-[var(--rule)] flex items-center justify-between overflow-x-auto gap-2 text-xs font-mono">
        <span className="text-[var(--slate)] font-bold uppercase tracking-wider shrink-0 pl-1">QUICK ACTIONS:</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate('/student/assignments')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📝 Submit Assignment ({pendingAssignments.length})
          </button>
          <button onClick={() => navigate('/student/materials')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            📚 Course Materials
          </button>
          <button onClick={() => navigate('/student/attendance')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            ⏱️ Check Attendance
          </button>
          <button onClick={() => navigate('/student/results')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            🏆 Marks Card PDF
          </button>
          <button onClick={() => navigate('/student/helpdesk')} className="px-3 py-1.5 bg-white border border-[var(--rule)] hover:border-[var(--brass)] rounded font-semibold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer">
            💬 Raise Ticket
          </button>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="OVERALL ATTENDANCE"
          value={`${currentStudent.attendance}%`}
          subtitle="Threshold: ≥ 75% for Exam Hall Ticket"
          valueColor={currentStudent.attendance >= 75 ? 'text-emerald-800' : 'text-red-700'}
          onClick={() => navigate('/student/attendance')}
        />
        <MetricCard
          title="ACADEMIC SGPA / CGPA"
          value={`${currentStudent.sgpa?.toFixed(2) || '8.85'} / ${examResults?.cgpa?.toFixed(2) || '8.92'}`}
          subtitle="Provisional Distinction Grade"
          valueColor="text-[var(--brass-2)]"
          onClick={() => navigate('/student/results')}
        />
        <MetricCard
          title="PENDING ASSIGNMENTS"
          value={`${pendingAssignments.length} Tasks`}
          subtitle={pendingAssignments.length > 0 ? `Next due: ${new Date(pendingAssignments[0].dueAt).toLocaleDateString('en-GB')}` : 'All submitted on time'}
          valueColor={pendingAssignments.length > 0 ? 'text-amber-800' : 'text-emerald-800'}
          onClick={() => navigate('/student/assignments')}
        />
        <MetricCard
          title="UNREAD NOTICES"
          value={`${unreadAnnouncements.length} New`}
          subtitle="Department & College circulars"
          valueColor="text-[var(--ink)]"
          onClick={() => navigate('/student/announcements')}
        />
      </div>

      {/* Attendance Shortage Risk Warning Banner (if any) */}
      {riskCourses.length > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg shadow-2xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-bold text-red-900 text-sm">
                Attendance Shortage Risk Alert — {riskCourses.map(r => `${r.courseCode} (${r.attendancePercentage}%)`).join(', ')}
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                {riskCourses[0].courseName}: Attendance is below the mandatory 75% threshold. You must attend the next <strong>{riskCourses[0].requiredFutureClasses} classes</strong> without absence to regain exam eligibility.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/attendance')}
            className="px-3 py-1.5 bg-red-700 text-white rounded text-xs font-mono font-bold hover:bg-red-800 transition cursor-pointer"
          >
            Review Attendance &amp; File Correction →
          </button>
        </div>
      )}

      {/* 2-Column Dashboard Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Schedule & Enrolled Courses */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Classes Widget */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>🗓️</span> Today&apos;s Class Schedule ({effectiveDay})
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">
                  {todaysClasses.length} lecture &amp; lab sessions scheduled
                </p>
              </div>
              <button
                onClick={() => navigate('/student/timetable')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                Full Week →
              </button>
            </div>

            {todaysClasses.length === 0 ? (
              <p className="text-xs font-mono text-[var(--slate)] py-4 text-center">
                No classes scheduled for today. Enjoy your academic study break!
              </p>
            ) : (
              <div className="space-y-2.5">
                {todaysClasses.map((item, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border transition ${
                        item.status === 'CANCELLED'
                          ? 'bg-red-50/60 border-red-200 opacity-75'
                          : isFirst
                          ? 'bg-[var(--parchment-2)] border-[var(--brass)] shadow-2xs'
                          : 'bg-white border-[var(--rule)] hover:border-[var(--slate-light)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--ink)]">
                            {item.startTime} – {item.endTime}
                          </span>
                          <Badge variant={item.sessionType === 'LAB' ? 'ink' : item.sessionType === 'SEMINAR' ? 'amber' : 'pass'}>
                            {item.sessionType}
                          </Badge>
                          {item.status === 'SUBSTITUTED' && <Badge variant="amber">SUBSTITUTE</Badge>}
                          {item.status === 'CANCELLED' && <Badge variant="fail">CANCELLED</Badge>}
                          {isFirst && item.status !== 'CANCELLED' && (
                            <span className="text-[10px] font-mono font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-1.5 py-0.5 rounded">
                              ● CURRENT / NEXT CLASS
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-[var(--slate)] font-semibold">{item.room}</span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--ink)]">
                            <span className="font-mono text-xs text-[var(--brass-2)] font-bold mr-1.5">{item.courseCode}</span>
                            {item.courseName}
                          </h4>
                          <p className="text-xs text-[var(--slate)] font-mono mt-0.5">
                            Instructor: {item.substituteFacultyName || item.facultyName}
                          </p>
                        </div>
                      </div>

                      {item.notice && (
                        <div className="mt-2 p-2 bg-white/80 rounded border border-dashed border-[var(--rule)] text-[11px] text-[var(--slate)] font-mono">
                          ℹ️ {item.notice}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrolled Courses Summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                Enrolled Courses — Semester {activeSemester}
              </h3>
              <span className="font-mono text-xs text-[var(--slate)]">{courses.length} Subjects Total</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {courses.map((course) => (
                <div key={course.id || course.code} className="p-3.5 rounded-lg bg-[var(--parchment)] border border-[var(--rule)] hover:border-[var(--brass)] transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{course.code}</span>
                    <span className="font-mono text-[11px] text-[var(--slate)]">{course.credits} Credits</span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--ink)] line-clamp-1">{course.name || course.title}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--rule)]/60 text-[11px] font-mono text-[var(--slate)]">
                    <span>{course.room || 'Room 301'}</span>
                    <button
                      onClick={() => navigate('/student/materials')}
                      className="text-[var(--brass-2)] hover:underline font-semibold cursor-pointer"
                    >
                      Materials →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Assignments & Announcements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pending Assignments */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>📝</span> Pending Assignments &amp; Tasks
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">{pendingAssignments.length} active submissions pending</p>
              </div>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center text-xs font-mono text-emerald-800">
                ✓ All course assignments submitted on time!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map((asg) => (
                  <div key={asg.id} className="p-3.5 rounded-lg border border-[var(--rule)] bg-white hover:border-[var(--brass)] transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{asg.courseCode}</span>
                      <span className="font-mono text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        Due: {new Date(asg.dueAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[var(--ink)] mb-1">{asg.title}</h4>
                    <p className="text-[11px] text-[var(--slate)] line-clamp-2">{asg.description}</p>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--rule)] text-xs font-mono">
                      <span className="text-[var(--slate)]">Max: {asg.maxMarks} Marks</span>
                      <button
                        onClick={() => navigate('/student/assignments')}
                        className="btn-ink px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Submit Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>📢</span> Department Notice Board
                </h3>
                <p className="text-xs text-[var(--slate)] font-mono">Official updates &amp; notifications</p>
              </div>
              <button
                onClick={() => navigate('/student/announcements')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                All Notices →
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => navigate('/student/announcements')}
                  className="p-3 rounded-lg border border-[var(--rule)] bg-[var(--parchment)] hover:border-[var(--brass)] cursor-pointer transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant={ann.priority === 'URGENT' ? 'fail' : ann.priority === 'IMPORTANT' ? 'amber' : 'ink'}>
                      {ann.priority}
                    </Badge>
                    <span className="font-mono text-[10px] text-[var(--slate)]">
                      {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--ink)]">{ann.title}</h4>
                  <p className="text-[11px] text-[var(--slate)] line-clamp-2 mt-0.5">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity & OD Claim Status Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
              <h3 className="font-display font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                <span>🎖️</span> Co-Curricular &amp; OD Status
              </h3>
              <button
                onClick={() => navigate('/student/submit-activity')}
                className="text-xs font-mono text-[var(--brass-2)] font-semibold hover:underline cursor-pointer"
              >
                New Claim →
              </button>
            </div>

            {myActivities.length === 0 ? (
              <p className="text-xs font-mono text-[var(--slate)]">No activity claims submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {myActivities.slice(0, 2).map((act) => (
                  <div key={act.id} className="p-2.5 bg-[var(--parchment-2)] rounded border border-[var(--rule)] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[var(--ink)]">{act.title}</div>
                      <div className="text-[10px] font-mono text-[var(--slate)]">{act.category} • {act.org}</div>
                    </div>
                    <Badge variant={act.status === 'HOD_APPROVED' ? 'pass' : act.status === 'REJECTED' ? 'fail' : 'amber'}>
                      {act.status === 'HOD_APPROVED' ? 'APPROVED' : act.status}
                    </Badge>
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
