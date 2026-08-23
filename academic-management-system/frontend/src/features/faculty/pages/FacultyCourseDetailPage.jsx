import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Modal } from '../../../components/ui/Modal';

export const FacultyCourseDetailPage = () => {
  const { courseId = 'BCA302' } = useParams();
  const { activeSemester, activeWorkspace, courseMaterials, assignments, labExperiments, gradeLabExperiment } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'materials' | 'lab'
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [obsMarks, setObsMarks] = useState(9);
  const [vivaMarks, setVivaMarks] = useState(5);
  const [practMarks, setPractMarks] = useState(5);
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalSuccess, setEvalSuccess] = useState(false);

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const course = courses.find(c => c.code === courseId) || {
    code: courseId,
    name: courseId === 'BCA305L' ? 'DBMS & Java Programming Lab' : 'Java Programming & OOP Concepts',
    credits: courseId === 'BCA305L' ? 2 : 4,
    room: courseId === 'BCA305L' ? 'Database Lab' : 'Room 302',
    type: courseId === 'BCA305L' ? 'Laboratory' : 'Core Theory'
  };

  const isLab = course.type?.toLowerCase().includes('lab') || course.code.endsWith('L');

  const courseMats = courseMaterials.filter(m => m.courseCode === course.code);
  const courseAsgs = assignments.filter(a => a.courseCode === course.code);

  const handleOpenLabEval = (exp, student) => {
    setSelectedExperiment(exp);
    setEvaluatingStudent(student);
    const existing = exp.submissions?.find(s => s.studentId === student.id);
    if (existing) {
      setObsMarks(existing.observationMarks || 9);
      setVivaMarks(existing.vivaMarks || 5);
      setPractMarks(existing.practicalMarks || 5);
      setEvalFeedback(existing.feedback || '');
    } else {
      setObsMarks(9);
      setVivaMarks(5);
      setPractMarks(5);
      setEvalFeedback('');
    }
    setEvalSuccess(false);
  };

  const handleSaveLabEval = (e) => {
    e.preventDefault();
    if (!selectedExperiment || !evaluatingStudent) return;

    gradeLabExperiment(selectedExperiment.id, evaluatingStudent.id, {
      observationMarks: obsMarks,
      vivaMarks: vivaMarks,
      practicalMarks: practMarks,
      feedback: evalFeedback,
      status: 'VERIFIED'
    });

    setEvalSuccess(true);
    setTimeout(() => {
      setEvaluatingStudent(null);
      setEvalSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/faculty/courses')}
            className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline mb-1 flex items-center gap-1 cursor-pointer"
          >
            ← Back to Assigned Courses
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2.5 py-0.5 rounded border border-[var(--brass)]">
              {course.code}
            </span>
            <Badge variant={isLab ? 'ink' : 'pass'}>{course.type}</Badge>
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            {course.name}
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Semester {activeSemester} • Room/Lab: {course.room || 'Room 302'} • {course.credits} Credits
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate('/faculty/attendance')}
            className="btn-ink px-3 py-1.5 rounded font-bold shadow-2xs cursor-pointer"
          >
            ⏱️ Take Attendance
          </button>
          <button
            onClick={() => navigate('/faculty/assessments')}
            className="btn-brass px-3 py-1.5 rounded font-bold shadow-2xs cursor-pointer"
          >
            📋 Enter Marks
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--rule)] pb-1 overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
            activeTab === 'overview' ? 'bg-white border border-b-0 border-[var(--rule)] text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          📊 Course Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
            activeTab === 'students' ? 'bg-white border border-b-0 border-[var(--rule)] text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          🎓 Enrolled Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
            activeTab === 'materials' ? 'bg-white border border-b-0 border-[var(--rule)] text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
          }`}
        >
          📁 Study Materials ({courseMats.length})
        </button>
        {isLab && (
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-4 py-2 rounded-t-lg font-bold transition cursor-pointer ${
              activeTab === 'lab' ? 'bg-purple-100 border border-b-0 border-purple-300 text-purple-950 font-extrabold shadow-2xs' : 'text-purple-800 hover:text-purple-950'
            }`}
          >
            🧪 Lab Experiments &amp; Code Submissions ({labExperiments.length})
          </button>
        )}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 card p-6 bg-white space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--ink)] border-b border-[var(--rule)] pb-2">
              Course Syllabus &amp; Core Units
            </h4>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
                <div className="font-mono font-bold text-[var(--brass-2)] text-xs mb-1">UNIT 1: Core Fundamentals &amp; Architecture</div>
                <p className="text-[var(--slate)] leading-relaxed">
                  Object-oriented paradigm, Class design, encapsulation, access specifiers, constructor overloading, and garbage collection mechanics.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
                <div className="font-mono font-bold text-[var(--brass-2)] text-xs mb-1">UNIT 2: Inheritance, Polymorphism &amp; Interfaces</div>
                <p className="text-[var(--slate)] leading-relaxed">
                  Method overriding, abstract classes, multiple inheritance simulation via interfaces, packages, and access protection.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
                <div className="font-mono font-bold text-[var(--brass-2)] text-xs mb-1">UNIT 3: Multithreading &amp; Exception Handling</div>
                <p className="text-[var(--slate)] leading-relaxed">
                  Thread lifecycle, synchronization monitors, deadlock prevention, checked/unchecked exceptions, and custom exceptions.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
                <div className="font-mono font-bold text-[var(--brass-2)] text-xs mb-1">UNIT 4: Java Collections Framework &amp; Generics</div>
                <p className="text-[var(--slate)] leading-relaxed">
                  List, Set, Map hierarchies, ArrayList, HashMap implementations, iterators, and stream filtering lambda expressions.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
                <div className="font-mono font-bold text-[var(--brass-2)] text-xs mb-1">UNIT 5: Database Connectivity (JDBC) &amp; Stream I/O</div>
                <p className="text-[var(--slate)] leading-relaxed">
                  DriverManager, Connection, Statement, PreparedStatement, ResultSet, transaction commit/rollback, and file streaming.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="card p-5 bg-white space-y-3 font-mono text-xs">
              <h4 className="font-display font-bold text-sm text-[var(--ink)] border-b border-[var(--rule)] pb-2">
                Course Metrics
              </h4>

              <div className="space-y-2 text-[var(--slate)]">
                <div className="flex justify-between">
                  <span>Enrolled Students:</span>
                  <strong className="text-[var(--ink)]">{students.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Classes Conducted:</span>
                  <strong className="text-[var(--ink)]">28 Hours</strong>
                </div>
                <div className="flex justify-between">
                  <span>Average Attendance:</span>
                  <strong className="text-emerald-800">89%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Published Resources:</span>
                  <strong className="text-[var(--ink)]">{courseMats.length} Files</strong>
                </div>
              </div>

              <button
                onClick={() => navigate('/faculty/reports')}
                className="w-full py-2 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-bold text-[var(--ink)] border border-[var(--rule)] transition text-center cursor-pointer"
              >
                📈 Generate Performance Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Enrolled Students */}
      {activeTab === 'students' && (
        <div className="card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Enrolled Student Roster — {course.code} (Section A)
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">{students.length} Students Active</span>
          </div>

          <LedgerTable
            columns={[
              {
                header: 'Register No',
                accessor: 'reg',
                render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
              },
              { header: 'Student Name', accessor: 'name', render: (s) => <strong className="text-xs">{s.name}</strong> },
              { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
              {
                header: 'Attendance %',
                accessor: 'attendance',
                render: (s) => (
                  <span className={`font-mono font-bold ${s.attendance < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                    {s.attendance}%
                  </span>
                )
              },
              {
                header: 'SGPA Standing',
                accessor: 'sgpa',
                render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.sgpa?.toFixed(2)}</span>
              },
              {
                header: 'Academic Standing',
                accessor: 'status',
                render: (s) => (
                  <Badge variant={s.attendance >= 75 ? 'pass' : 'fail'}>
                    {s.attendance >= 75 ? 'ELIGIBLE ✓' : 'SHORTAGE ⚠️'}
                  </Badge>
                )
              }
            ]}
            data={students}
          />
        </div>
      )}

      {/* Tab 3: Course Materials */}
      {activeTab === 'materials' && (
        <div className="card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Uploaded Study Materials for {course.code}
            </h4>
            <button
              onClick={() => navigate('/faculty/materials')}
              className="btn-brass px-3 py-1.5 rounded font-mono text-xs font-bold cursor-pointer"
            >
              + Upload Material
            </button>
          </div>

          {courseMats.length === 0 ? (
            <p className="text-xs font-mono text-[var(--slate)] py-8 text-center">No study materials uploaded for this course yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {courseMats.map(mat => (
                <div key={mat.id} className="p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[var(--brass-2)]">Unit {mat.unitNumber}</span>
                      <Badge variant="ink">{mat.materialType}</Badge>
                    </div>
                    <h5 className="font-bold text-xs text-[var(--ink)]">{mat.title}</h5>
                    <p className="text-[11px] text-[var(--slate)] line-clamp-2 mt-1">{mat.description}</p>
                  </div>
                  <div className="pt-2 border-t border-[var(--rule)]/60 flex justify-between items-center text-[10px] font-mono text-[var(--slate)]">
                    <span>{mat.fileSize}</span>
                    <button
                      onClick={() => alert(`Downloading: ${mat.title}`)}
                      className="text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
                    >
                      Download 📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Lab Management (BCA305L) */}
      {activeTab === 'lab' && isLab && (
        <div className="card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <div>
              <h4 className="font-display font-bold text-lg text-[var(--ink)] flex items-center gap-2">
                <span>🧪</span> Laboratory Practical Experiments &amp; Submission Review
              </h4>
              <p className="text-xs font-mono text-[var(--slate)]">
                5 Standard experiments configured. Inspect GitHub repositories, execute test cases, and record observation &amp; viva marks.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {labExperiments.map((exp) => (
              <div key={exp.id} className="p-5 rounded-lg border border-[var(--rule)] bg-[var(--parchment)] space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-white bg-purple-900 px-2 py-0.5 rounded">
                        EXPERIMENT #{exp.experimentNumber}
                      </span>
                      <span className="font-mono text-xs text-[var(--slate)]">Max: {exp.maxMarks} Marks</span>
                    </div>
                    <h5 className="font-display font-bold text-base text-[var(--ink)]">
                      {exp.title}
                    </h5>
                    <p className="text-xs text-[var(--slate)] font-sans mt-0.5">{exp.description}</p>
                  </div>

                  <span className="font-mono text-xs text-[var(--slate)] bg-white px-2.5 py-1 rounded border border-[var(--rule)]">
                    Due: <strong>{exp.dueDate}</strong>
                  </span>
                </div>

                {/* Submissions by Students */}
                <div className="space-y-2 pt-2 border-t border-[var(--rule)]">
                  <div className="font-mono text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                    Student Submissions &amp; Code Repositories:
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.map((stu) => {
                      const sub = exp.submissions?.find(s => s.studentId === stu.id);
                      const isVerified = sub?.status === 'VERIFIED';
                      const isSubmitted = sub?.status === 'SUBMITTED';

                      return (
                        <div
                          key={stu.id}
                          className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between space-y-2 ${
                            isVerified ? 'bg-emerald-50/70 border-emerald-300' : isSubmitted ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-[var(--rule)]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <strong className="text-[var(--ink)] truncate max-w-[120px]">{stu.name}</strong>
                              <Badge variant={isVerified ? 'pass' : isSubmitted ? 'amber' : 'fail'}>
                                {isVerified ? `SCORE: ${sub.totalMarks}/${exp.maxMarks}` : isSubmitted ? 'SUBMITTED' : 'NOT SUBMITTED'}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-[var(--slate)]">{stu.reg || stu.usn}</span>

                            {sub?.githubUrl && (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-700 font-semibold truncate block mt-1 hover:underline"
                              >
                                🔗 GitHub Repository →
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenLabEval(exp, stu)}
                            className="w-full py-1 bg-white hover:bg-[var(--brass-soft)] border border-[var(--rule)] rounded font-bold text-[var(--ink)] hover:text-[var(--brass-2)] transition cursor-pointer text-center"
                          >
                            {isVerified ? '✏️ Edit Marks' : '📝 Evaluate Practical'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Evaluation Modal */}
      {evaluatingStudent && selectedExperiment && (
        <Modal
          isOpen={true}
          onClose={() => setEvaluatingStudent(null)}
          title={`Practical Evaluation — ${selectedExperiment.title}`}
        >
          {evalSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Lab practical evaluation recorded: Total {(Number(obsMarks) + Number(vivaMarks) + Number(practMarks))}/20 Marks!
            </div>
          ) : (
            <form onSubmit={handleSaveLabEval} className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">Student: {evaluatingStudent.name}</span>
                  <span className="text-[var(--slate)]">USN: {evaluatingStudent.reg || evaluatingStudent.usn}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Observation (10):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={obsMarks}
                    onChange={(e) => setObsMarks(Number(e.target.value))}
                    className="field-input text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Viva Voce (5):</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    required
                    value={vivaMarks}
                    onChange={(e) => setVivaMarks(Number(e.target.value))}
                    className="field-input text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Execution (5):</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    required
                    value={practMarks}
                    onChange={(e) => setPractMarks(Number(e.target.value))}
                    className="field-input text-center font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded font-mono text-xs flex justify-between font-bold">
                <span>Total Calculated Score:</span>
                <span className="text-emerald-800 text-sm">{Number(obsMarks) + Number(vivaMarks) + Number(practMarks)} / 20 Marks</span>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Faculty Feedback &amp; Verification Remarks:</label>
                <textarea
                  rows={2}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="e.g. Schema constraints verified, all test queries executed accurately."
                  className="field-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setEvaluatingStudent(null)}
                  className="px-3 py-2 rounded text-xs text-[var(--slate)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass px-4 py-2 rounded text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Evaluation →
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
