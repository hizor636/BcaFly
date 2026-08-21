import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // State for various roles
  const [hodData, setHodData] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form states
  const [newActivity, setNewActivity] = useState({ eventName: '', organizer: '', startDate: '', mode: 'OFFLINE', description: '', skillsSummary: '', requestOd: false, odReason: '' });
  const [newStudent, setNewStudent] = useState({ name: '', email: '', regNo: '', rollNo: '', semesterId: 3, sectionId: 3 });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Announcements for all
      const annRes = await apiClient.get('/announcements');
      setAnnouncements(annRes.data || []);

      if (user.role === 'HOD' || user.role === 'ADMIN') {
        const hodRes = await apiClient.get('/hod/overview');
        setHodData(hodRes.data);
        const stuRes = await apiClient.get('/students');
        setStudents(stuRes.data || []);
        const facRes = await apiClient.get('/faculty');
        setFaculty(facRes.data || []);
        const subRes = await apiClient.get('/academics/subjects');
        setSubjects(subRes.data || []);
        const actRes = await apiClient.get('/portfolio/submissions');
        setSubmissions(actRes.data || []);
      }

      if (user.role === 'FACULTY') {
        const assignRes = await apiClient.get('/faculty/me/assignments');
        setMyAssignments(assignRes.data.assignments || []);
        const actRes = await apiClient.get('/portfolio/submissions');
        setSubmissions(actRes.data || []);
      }

      if (user.role === 'STUDENT') {
        const statRes = await apiClient.get('/students/me/portfolio-stats');
        setStudentStats(statRes.data);
        const catRes = await apiClient.get('/portfolio/categories');
        setCategories(catRes.data || []);
        const actRes = await apiClient.get('/portfolio/submissions');
        setSubmissions(actRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/students', newStudent);
      setFeedbackMsg('Student profile created successfully!');
      loadDashboardData();
    } catch (err) {
      setFeedbackMsg('Failed to create student.');
    }
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/portfolio/submit', newActivity);
      setFeedbackMsg('Activity portfolio submission sent for faculty verification!');
      setNewActivity({ eventName: '', organizer: '', startDate: '', mode: 'OFFLINE', description: '', skillsSummary: '', requestOd: false, odReason: '' });
      loadDashboardData();
    } catch (err) {
      setFeedbackMsg('Failed to submit activity.');
    }
  };

  const handleVerifySubmission = async (id, status) => {
    try {
      await apiClient.put(`/portfolio/submissions/${id}/verify`, { status, remarks: 'Verified by department staff.' });
      setFeedbackMsg(`Submission marked as ${status}!`);
      loadDashboardData();
    } catch (err) {
      setFeedbackMsg('Verification update failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Greeting */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--gold)] uppercase tracking-wider font-semibold">
            {user.role} WORKSPACE • BCA DEPARTMENT
          </span>
          <h2 className="text-2xl font-display font-bold text-[var(--text)] mt-1">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            BcaFly Zero-Cost Self-Hosted Academic Ledger • Running on PostgreSQL 18 & Spring Boot
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDashboardData} 
            className="px-3 py-1.5 text-xs font-medium bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg hover:bg-[var(--gold-soft)] transition">
            🔄 Refresh Data
          </button>
          <button 
            onClick={logout} 
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
            Sign Out
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex justify-between items-center">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="font-bold">×</button>
        </div>
      )}

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="bg-[var(--gold-soft)] border border-[#ead6ab] p-4 rounded-xl">
          <div className="text-xs font-bold text-[#8c6721] uppercase tracking-wider mb-2">📢 Department Notices & Announcements</div>
          <div className="space-y-2">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="text-xs text-[var(--text)]">
                <span className="font-semibold text-[#664b18]">{a.title}: </span>
                <span>{a.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLE: HOD & ADMIN DASHBOARD */}
      {(user.role === 'HOD' || user.role === 'ADMIN') && hodData && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--text-muted)]">Total Students</div>
              <div className="text-2xl font-bold font-display text-[var(--text)] mt-1">{hodData.metrics?.totalStudents || students.length}</div>
              <div className="text-[10px] text-emerald-700 font-mono mt-1">BCA Semesters 1, 3, 5</div>
            </div>
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--text-muted)]">Average CGPA</div>
              <div className="text-2xl font-bold font-display text-[var(--text)] mt-1">{hodData.metrics?.averageCgpa}</div>
              <div className="text-[10px] text-emerald-700 font-mono mt-1">Class Standing: Good</div>
            </div>
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--text-muted)]">Average Attendance</div>
              <div className="text-2xl font-bold font-display text-[var(--text)] mt-1">{hodData.metrics?.averageAttendance}</div>
              <div className="text-[10px] text-amber-700 font-mono mt-1">Min Threshold: 75%</div>
            </div>
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--text-muted)]">Attention Needed</div>
              <div className="text-2xl font-bold font-display text-amber-700 mt-1">{hodData.metrics?.studentsNeedingSupport}</div>
              <div className="text-[10px] text-amber-700 font-mono mt-1">Shortage / Backlogs</div>
            </div>
          </div>

          {/* Attention Alerts */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-3">⚠️ Academic Attention Panel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hodData.attentionAlerts?.map((alert, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Department Student Registry</h3>
              <span className="text-xs text-[var(--text-muted)]">{students.length} Registered</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-soft)] text-[var(--text-muted)] border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Semester / Section</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--surface-soft)] transition">
                      <td className="p-3 font-mono font-medium">{s.regNo}</td>
                      <td className="p-3">{s.user?.name}</td>
                      <td className="p-3">Semester {s.currentSemester?.semesterNumber || 3} - {s.section?.name || 'A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono ${s.attendancePct < 75 ? 'bg-red-50 text-red-700 font-bold' : 'bg-emerald-50 text-emerald-700'}`}>
                          {s.attendancePct}%
                        </span>
                      </td>
                      <td className="p-3 font-mono">{s.cgpa}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.riskStatus === 'HIGH' ? 'bg-red-100 text-red-800' : s.riskStatus === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {s.riskStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Approvals Queue */}
          {submissions.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">📋 Student Activity Verification Queue</h3>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="font-semibold text-xs text-[var(--text)]">{sub.eventName} ({sub.organizer})</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Submitted by: {sub.student?.user?.name} ({sub.student?.regNo}) • Date: {sub.startDate} • Code: {sub.submissionCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${sub.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {sub.verificationStatus}
                      </span>
                      {sub.verificationStatus === 'SUBMITTED' && (
                        <button onClick={() => handleVerifySubmission(sub.id, 'VERIFIED')} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLE: FACULTY DASHBOARD */}
      {user.role === 'FACULTY' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">📚 My Assigned Subjects & Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myAssignments.map((a) => (
                <div key={a.id} className="p-4 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
                  <div className="text-xs font-mono text-[var(--gold)] font-bold">{a.subject?.code}</div>
                  <div className="font-semibold text-sm mt-1">{a.subject?.title}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-2">
                    Semester {a.semester?.semesterNumber} • Section {a.section?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROLE: STUDENT DASHBOARD & ACTIVITY PORTFOLIO */}
      {user.role === 'STUDENT' && (
        <div className="space-y-6">
          {/* Student Academic Metrics */}
          {studentStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="text-xs text-[var(--text-muted)]">My Attendance</div>
                <div className="text-2xl font-bold font-display text-[var(--text)] mt-1">{studentStats.attendancePercentage}%</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1">{studentStats.attendedClasses}/{studentStats.totalClasses} Conducted</div>
              </div>
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="text-xs text-[var(--text-muted)]">Cumulative CGPA</div>
                <div className="text-2xl font-bold font-display text-[var(--text)] mt-1">{studentStats.cgpa}</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1">Status: Eligible</div>
              </div>
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="text-xs text-[var(--text-muted)]">Academic Risk</div>
                <div className="text-2xl font-bold font-display text-emerald-700 mt-1">{studentStats.riskStatus}</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1">Standing: Good</div>
              </div>
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <div className="text-xs text-[var(--text-muted)]">Verified Portfolio</div>
                <div className="text-2xl font-bold font-display text-[var(--gold)] mt-1">{submissions.length}</div>
                <div className="text-[10px] text-[var(--gold)] font-mono mt-1">Activities Recorded</div>
              </div>
            </div>
          )}

          {/* Submit New Activity Portfolio Form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">🏆 Submit Event / Certification to Portfolio</h3>
            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Event / Certification Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. National Level Web Hackathon 2026"
                    value={newActivity.eventName}
                    onChange={(e) => setNewActivity({...newActivity, eventName: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface-soft)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Organizing Body / Platform</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. IEEE / Coursera / IIT Madras"
                    value={newActivity.organizer}
                    onChange={(e) => setNewActivity({...newActivity, organizer: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface-soft)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Event Date</label>
                  <input 
                    type="date" 
                    required
                    value={newActivity.startDate}
                    onChange={(e) => setNewActivity({...newActivity, startDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface-soft)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Skills Developed</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React, PostgreSQL, Cloud Deployment"
                    value={newActivity.skillsSummary}
                    onChange={(e) => setNewActivity({...newActivity, skillsSummary: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface-soft)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Description & Key Learnings</label>
                <textarea 
                  rows={2}
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Summary of project or participation..."
                  className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface-soft)]"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <input 
                    type="checkbox" 
                    checked={newActivity.requestOd} 
                    onChange={(e) => setNewActivity({...newActivity, requestOd: e.target.checked})}
                    className="rounded border-[var(--border)]"
                  />
                  Request Official Duty (OD) Attendance for this date
                </label>
                <button type="submit" className="px-4 py-2 bg-[var(--gold)] text-white font-semibold text-xs rounded-xl shadow-sm hover:opacity-90 transition">
                  Submit to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
