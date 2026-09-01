import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { LedgerTable } from '../../../components/common/LedgerTable';

export const FacultyAssignmentsPage = () => {
  const { activeSemester, activeWorkspace, assignments, submissions, createAssignment, gradeAssignmentSubmission, remindPendingAssignmentStudents } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedAssignment, setSelectedAssignment] = useState(assignments[0] || null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [evaluatingSub, setEvaluatingSub] = useState(null);
  const [gradeMarks, setGradeMarks] = useState(18);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // Create Assignment Form State
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxMarks, setMaxMarks] = useState(20);
  const [dueAt, setDueAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [allowLate, setAllowLate] = useState(true);
  const [allowResubmission, setAllowResubmission] = useState(true);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const created = createAssignment({
      courseCode: courseCode || (courses[0]?.code || 'CORE'),
      title,
      description,
      instructions,
      maxMarks,
      dueAt: new Date(dueAt).toISOString(),
      allowLate,
      allowResubmission,
      createdBy: user?.name || 'Course Instructor'
    });

    setCreateModalOpen(false);
    setSelectedAssignment(created);
    setTitle('');
    setDescription('');
    setInstructions('');
    setActionSuccess({ type: 'success', text: '✓ Assignment published successfully to student workspace!' });
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!evaluatingSub) return;

    gradeAssignmentSubmission(evaluatingSub.id, {
      marksObtained: gradeMarks,
      feedback: gradeFeedback,
      status: 'GRADED',
      gradedBy: user?.name || 'Prof. K. Rao'
    });

    setActionSuccess({ type: 'success', text: `✓ Grade recorded for ${evaluatingSub.studentName}: ${gradeMarks}/${selectedAssignment?.maxMarks} Marks.` });
    setEvaluatingSub(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRemind = () => {
    if (!selectedAssignment) return;
    remindPendingAssignmentStudents(selectedAssignment.id);
    setActionSuccess({ type: 'info', text: '✓ Notification alert sent to all pending students.' });
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const assignmentSubmissions = selectedAssignment
    ? students.map(s => {
        const sub = submissions.find(sub => sub.assignmentId === selectedAssignment.id && (sub.studentId === s.id || (s.reg && sub.reg === s.reg)));
        return {
          studentId: s.id,
          studentName: s.name,
          reg: s.reg || s.usn,
          subId: sub?.id || null,
          status: sub ? sub.status : 'PENDING',
          submittedAt: sub?.submittedAt || null,
          marksObtained: sub?.marksObtained || null,
          feedback: sub?.feedback || null,
          uploadedFiles: sub?.uploadedFiles || [],
          submissionLinks: sub?.submissionLinks || [],
          submissionText: sub?.submissionText || ''
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>📝</span> ASSIGNMENT GOVERNANCE &amp; EVALUATION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assignments &amp; Mini-Project Submissions
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Create course tasks, review student solution uploads, grade code repos, and return feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>➕</span> Create Assignment
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess.text}
        </div>
      )}

      {/* 2-Column Layout: Assignment Selector & Submissions Ledger */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Assignment Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="font-display font-bold text-sm text-[var(--ink)] uppercase tracking-wider">
            Active Assignments ({assignments.length})
          </h4>

          {assignments.map(asg => {
            const isSelected = selectedAssignment?.id === asg.id;
            return (
              <div
                key={asg.id}
                onClick={() => setSelectedAssignment(asg)}
                className={`card p-4 cursor-pointer transition border ${
                  isSelected ? 'border-[var(--brass)] bg-[var(--parchment)] shadow-sm' : 'border-[var(--rule)] bg-white hover:border-[var(--slate-light)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{asg.courseCode}</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[var(--rule)]">
                    Max: {asg.maxMarks} Marks
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[var(--ink)] mb-1">{asg.title}</h5>
                <div className="text-[10px] font-mono text-[var(--slate)] flex justify-between pt-2 border-t border-[var(--rule)]/60">
                  <span>Due: {new Date(asg.dueAt).toLocaleDateString('en-GB')}</span>
                  <span className="text-[var(--brass-2)] font-bold">Inspect →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Submissions Review & Grading */}
        <div className="lg:col-span-8">
          {selectedAssignment ? (
            <div className="card p-6 bg-white space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--rule)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)]">{selectedAssignment.courseCode}</span>
                    <span className="font-mono text-xs text-[var(--slate)]">• Max: {selectedAssignment.maxMarks} Marks</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--ink)]">{selectedAssignment.title}</h3>
                  <p className="text-xs text-[var(--slate)] font-sans mt-0.5">{selectedAssignment.description}</p>
                </div>

                <button
                  onClick={handleRemind}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-mono text-xs font-bold transition cursor-pointer"
                >
                  🔔 Remind Pending Students
                </button>
              </div>

              {/* Submissions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono font-bold text-xs text-[var(--ink)] uppercase tracking-wider">
                    Student Submissions Roster ({assignmentSubmissions.length})
                  </h4>
                </div>

                <LedgerTable
                  columns={[
                    {
                      header: 'Register No',
                      accessor: 'reg',
                      render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg}</span>
                    },
                    { header: 'Student Name', accessor: 'studentName', render: (s) => <strong className="text-xs">{s.studentName}</strong> },
                    {
                      header: 'Submission Status',
                      accessor: 'status',
                      render: (s) => (
                        <Badge variant={s.status === 'GRADED' ? 'pass' : s.status === 'SUBMITTED' ? 'ink' : s.status === 'LATE' ? 'fail' : 'amber'}>
                          {s.status}
                        </Badge>
                      )
                    },
                    {
                      header: 'Score',
                      accessor: 'marksObtained',
                      render: (s) => (
                        <span className="font-mono font-bold text-xs text-[var(--ink)]">
                          {s.marksObtained !== null ? (
                            <strong className="text-emerald-800">{s.marksObtained} / {selectedAssignment.maxMarks}</strong>
                          ) : (
                            '—'
                          )}
                        </span>
                      )
                    },
                    {
                      header: 'Action',
                      accessor: 'studentId',
                      render: (s) => (
                        <button
                          onClick={() => {
                            setEvaluatingSub({
                              id: s.subId || `sub-${Date.now()}`,
                              studentId: s.studentId,
                              studentName: s.studentName,
                              text: s.submissionText,
                              links: s.submissionLinks,
                              files: s.uploadedFiles,
                              marks: s.marksObtained || 18,
                              feedback: s.feedback || ''
                            });
                            setGradeMarks(s.marksObtained || 18);
                            setGradeFeedback(s.feedback || '');
                          }}
                          className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] cursor-pointer"
                        >
                          {s.status === 'GRADED' ? '✏️ Edit Score' : '📝 Grade'}
                        </button>
                      )
                    }
                  ]}
                  data={assignmentSubmissions}
                />
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center font-mono text-xs text-[var(--slate)] bg-white">
              Select an assignment on the left to review student submissions.
            </div>
          )}
        </div>
      </div>

      {/* Grade Submission Modal */}
      {evaluatingSub && selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setEvaluatingSub(null)}
          title={`Grade Submission — ${evaluatingSub.studentName}`}
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{evaluatingSub.studentName}</strong></div>
              <div>Assignment: <strong>{selectedAssignment.title}</strong></div>
              <div>Max Marks: <strong>{selectedAssignment.maxMarks}</strong></div>
            </div>

            {/* Inspect Solution Content */}
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Student Solution Summary:</label>
              <div className="p-3 bg-white border border-[var(--rule)] rounded text-xs text-[var(--ink)]">
                {evaluatingSub.text || 'Solution files and documentation attached.'}
              </div>
            </div>

            {evaluatingSub.links && evaluatingSub.links.length > 0 && (
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">External Links &amp; GitHub Repos:</label>
                <div className="space-y-1">
                  {evaluatingSub.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 font-mono text-[11px] block hover:underline"
                    >
                      🔗 {link} →
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Marks Awarded (Max {selectedAssignment.maxMarks}) *:</label>
              <input
                type="number"
                min="0"
                max={selectedAssignment.maxMarks}
                required
                value={gradeMarks}
                onChange={(e) => setGradeMarks(Number(e.target.value))}
                className="field-input font-mono font-bold text-sm w-28 py-1.5"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Constructive Feedback / Remarks:</label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="e.g. Excellent modular implementation. Add exception handling test cases in next submission."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setEvaluatingSub(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save &amp; Return Grade →
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Course Assignment"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Course *:</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="field-input text-xs"
              >
                {courses.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assignment Title *:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Problem Set 3: Java Socket Programming & Multithreaded Server"
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Max Marks *:</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="field-input text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Due Date *:</label>
                <input
                  type="date"
                  required
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="field-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Description &amp; Problem Statement *:</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide problem specification..."
                className="field-input text-xs"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Evaluation Rubrics &amp; Instructions:</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Include JUnit test reports and schema diagrams."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Publish Assignment →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
