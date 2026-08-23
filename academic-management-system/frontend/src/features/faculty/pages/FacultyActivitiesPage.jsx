import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const FacultyActivitiesPage = () => {
  const { activeSemester, activities, verifyActivity } = useAcademic();
  const { user } = useAuth();

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [creditDays, setCreditDays] = useState(2);
  const [decisionSuccess, setDecisionSuccess] = useState(null);

  const handleDecision = (decisionStatus) => {
    if (!selectedActivity) return;

    verifyActivity(
      selectedActivity.id,
      decisionStatus,
      remarks || (decisionStatus === 'FACULTY_RECOMMENDED' || decisionStatus === 'VERIFIED' ? 'Verified event participation & certificates.' : 'Evidence insufficient.'),
      creditDays
    );

    setDecisionSuccess(`✓ Activity #${selectedActivity.id} decision recorded as ${decisionStatus}. Forwarded to HOD.`);
    setSelectedActivity(null);
    setRemarks('');
    setTimeout(() => setDecisionSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🎖️</span> CO-CURRICULAR &amp; ON-DUTY (OD) VERIFICATION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Student Activity &amp; OD Recommendation Queue
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Review hackathons, technical symposiums, sports, and certifications submitted by students for OD credit days.
          </p>
        </div>
      </div>

      {decisionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {decisionSuccess}
        </div>
      )}

      {/* Activity Cards List */}
      <div className="space-y-4">
        {activities.map((act) => {
          const isPending = act.status === 'SUBMITTED';
          const isVerified = act.status === 'FACULTY_RECOMMENDED' || act.status === 'VERIFIED';
          const isHodApproved = act.status === 'HOD_APPROVED';

          return (
            <div
              key={act.id}
              className={`card p-6 bg-white border transition space-y-4 ${
                isPending ? 'border-amber-300 bg-amber-50/20' : 'border-[var(--rule)]'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3 border-b border-[var(--rule)] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2.5 py-0.5 rounded border border-[var(--brass)]">
                      {act.studentName} ({act.reg || 'BCS23CA001'})
                    </span>
                    <Badge variant={act.category === 'Hackathon' ? 'ink' : 'pass'}>{act.category}</Badge>
                    {act.od && (
                      <span className="bg-amber-100 text-amber-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                        ⚡ OD Claim: {act.attendanceCreditDays || 2} Days
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {act.title}
                  </h4>
                  <p className="text-xs font-mono text-[var(--slate)] mt-0.5">
                    Organized by: <strong className="text-[var(--ink)]">{act.org}</strong> • Date: {act.date}
                  </p>
                </div>

                <div className="text-right">
                  <Badge variant={isHodApproved ? 'pass' : isVerified ? 'amber' : isPending ? 'ink' : 'fail'}>
                    {isHodApproved ? 'HOD APPROVED ✓' : isVerified ? 'FACULTY RECOMMENDED' : isPending ? 'PENDING FACULTY REVIEW' : act.status}
                  </Badge>
                  <div className="text-[10px] font-mono text-[var(--slate)] mt-1">ID: #{act.id}</div>
                </div>
              </div>

              <div className="space-y-2 font-sans text-xs">
                <div>
                  <strong className="font-mono text-[11px] text-[var(--slate)] uppercase block">Summary &amp; Role:</strong>
                  <p className="text-[var(--ink)] leading-relaxed">{act.description}</p>
                </div>

                {act.learningOutcome && (
                  <div>
                    <strong className="font-mono text-[11px] text-[var(--slate)] uppercase block">Learning Outcome:</strong>
                    <p className="text-[var(--ink)] italic">&ldquo;{act.learningOutcome}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Evidence & Remarks */}
              <div className="pt-2 border-t border-[var(--rule)] flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--slate)]">Evidence File:</span>
                  <span className="bg-[var(--parchment-2)] px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--ink)] font-bold">
                    📄 {act.evidenceFiles?.[0] || 'Certificate_Evidence.pdf'}
                  </span>
                </div>

                {isPending ? (
                  <button
                    onClick={() => {
                      setSelectedActivity(act);
                      setCreditDays(act.attendanceCreditDays || 2);
                      setRemarks('');
                    }}
                    className="btn-brass px-4 py-1.5 rounded font-bold shadow-2xs cursor-pointer"
                  >
                    Verify &amp; Recommend →
                  </button>
                ) : (
                  <div className="text-[11px] text-[var(--slate)]">
                    Faculty Remarks: <strong className="text-emerald-800">{act.facultyRemarks || 'Approved'}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Modal */}
      {selectedActivity && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedActivity(null)}
          title="Verify Co-Curricular &amp; OD Claim"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{selectedActivity.studentName}</strong></div>
              <div>Event: <strong>{selectedActivity.title}</strong></div>
              <div>Organizer: <strong>{selectedActivity.org}</strong></div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Recommended OD Credit Days:</label>
              <input
                type="number"
                min="0"
                max="5"
                value={creditDays}
                onChange={(e) => setCreditDays(Number(e.target.value))}
                className="field-input text-xs font-mono font-bold w-24"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Mentor / Faculty Verification Remarks *:</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Verified student presented research paper. Recommending 2 days OD attendance credit."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision('FACULTY_REJECTED')}
                className="px-4 py-2 bg-red-700 text-white rounded font-bold cursor-pointer"
              >
                Reject ✗
              </button>
              <button
                type="button"
                onClick={() => handleDecision('FACULTY_RECOMMENDED')}
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Recommend to HOD ✓
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
