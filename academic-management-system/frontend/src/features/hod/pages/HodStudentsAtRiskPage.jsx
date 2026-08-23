import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Modal } from '../../../components/ui/Modal';

export const HodStudentsAtRiskPage = () => {
  const { activeSemester, faculty, studentRiskCases, assignStudentMentor, updateStudentRiskStatus } = useAcademic();

  const [selectedCase, setSelectedCase] = useState(null);
  const [mentorFacultyId, setMentorFacultyId] = useState(faculty[1]?.id || 'FAC02');
  const [interventionPlan, setInterventionPlan] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleAssignMentor = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    const mentorObj = faculty.find(f => f.id === mentorFacultyId) || { name: 'Prof. K. Rao' };

    assignStudentMentor(
      selectedCase.id,
      mentorFacultyId,
      mentorObj.name,
      interventionPlan || 'Scheduled weekly remedial tutoring and attendance progress tracking.'
    );

    setActionSuccess(`✓ Mentor ${mentorObj.name} assigned to ${selectedCase.studentName}. Intervention plan active.`);
    setSelectedCase(null);
    setInterventionPlan('');
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const headers = ['Case ID', 'Register No', 'Student Name', 'Risk Severity', 'Attendance %', 'Current SGPA', 'Assigned Mentor', 'Intervention Plan', 'Status'];
  const rows = studentRiskCases.map(c => [
    c.id,
    c.reg,
    c.studentName,
    c.riskLevel,
    `${c.attendance}%`,
    c.sgpa,
    c.mentorName || 'Unassigned',
    c.interventionPlan,
    c.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🚨</span> ACADEMIC INTERVENTION &amp; MENTORSHIP TRACKER
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Students at Academic Risk &amp; Early Warning System
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Proactive intervention for students with attendance shortages, standing arrears, or low continuous assessment scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`hod_students_at_risk_sem${activeSemester}`}
            title={`Students at Academic Risk — Semester ${activeSemester}`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Intervention Cases Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {studentRiskCases.map((c) => {
          const isHigh = c.riskLevel === 'HIGH';

          return (
            <div
              key={c.id}
              className={`card p-6 bg-white border transition space-y-4 ${
                isHigh ? 'border-red-300 shadow-xs' : 'border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--rule)] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2.5 py-0.5 rounded border border-[var(--brass)]">
                      {c.reg}
                    </span>
                    <Badge variant={isHigh ? 'fail' : 'amber'}>{c.riskLevel} RISK</Badge>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {c.studentName}
                  </h4>
                  <p className="text-xs font-mono text-[var(--slate)] mt-0.5">
                    Section {c.section} • Semester {c.semesterId}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[11px] text-[var(--slate)]">Attendance: <strong className={c.attendance < 75 ? 'text-red-700 font-bold' : 'text-emerald-800'}>{c.attendance}%</strong></div>
                  <div className="text-[11px] text-[var(--slate)]">SGPA: <strong>{c.sgpa}</strong></div>
                </div>
              </div>

              {/* Diagnostic Reasons */}
              <div className="space-y-1.5 font-mono text-xs">
                <strong className="text-[var(--slate)] uppercase tracking-wider text-[10px] block">Trigger Factors:</strong>
                <div className="space-y-1">
                  {c.riskReasons.map((reason, idx) => (
                    <div key={idx} className="p-2 rounded bg-red-50/80 border border-red-200 text-red-900 text-[11px] flex items-center gap-1.5">
                      <span>⚠️</span> {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentorship & Intervention Plan */}
              <div className="p-3.5 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--slate)]">Assigned Mentor:</span>
                  <strong className="text-[var(--brass-2)]">{c.mentorName || 'Unassigned'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--slate)]">Next Review:</span>
                  <strong className="text-[var(--ink)]">{c.nextReviewDate}</strong>
                </div>
                <div className="pt-2 border-t border-[var(--rule)]/60">
                  <span className="text-[var(--slate)] block text-[10px] uppercase">Plan:</span>
                  <p className="text-xs font-sans text-[var(--ink)] mt-0.5 italic">{c.interventionPlan}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between font-mono text-xs">
                <span className="text-[11px] text-[var(--slate)]">Status: <strong className="text-[var(--ink)]">{c.status}</strong></span>

                <button
                  onClick={() => {
                    setSelectedCase(c);
                    setInterventionPlan(c.interventionPlan || '');
                  }}
                  className="btn-brass px-3.5 py-1.5 rounded font-bold shadow-2xs cursor-pointer"
                >
                  ✏️ Update Mentorship Plan →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Mentor Modal */}
      {selectedCase && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCase(null)}
          title={`Intervention Governance — ${selectedCase.studentName}`}
        >
          <form onSubmit={handleAssignMentor} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{selectedCase.studentName}</strong> ({selectedCase.reg})</div>
              <div>Risk Level: <strong className="text-red-700">{selectedCase.riskLevel} RISK</strong></div>
              <div>Attendance: <strong>{selectedCase.attendance}%</strong> • SGPA: <strong>{selectedCase.sgpa}</strong></div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Assign Faculty Mentor / Advisor *:</label>
              <select
                value={mentorFacultyId}
                onChange={(e) => setMentorFacultyId(e.target.value)}
                className="field-input text-xs font-mono font-bold"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Academic Intervention &amp; Remedial Plan *:</label>
              <textarea
                rows={4}
                required
                value={interventionPlan}
                onChange={(e) => setInterventionPlan(e.target.value)}
                placeholder="Specify remedial coaching schedule, attendance recovery roadmap, or parent counseling details..."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Save Mentorship Plan →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
