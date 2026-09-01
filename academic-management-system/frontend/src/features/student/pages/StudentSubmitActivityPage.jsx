import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const StudentSubmitActivityPage = () => {
  const { activeSemester, activities, submitActivity } = useAcademic();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    org: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'Hackathon',
    od: true,
    attendanceCreditDays: 1,
    description: '',
    learningOutcome: '',
    skills: '',
    evidenceFiles: []
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.org) return;

    submitActivity({
      ...formData,
      sem: activeSemester,
      studentId: user?.id || 'stu-unknown',
      studentName: user?.name || 'Student',
      reg: user?.usn || user?.reg || 'Unassigned',
      evidenceFiles: formData.evidenceFiles
    });

    setSubmittedSuccess(true);
    setFormData({
      title: '',
      org: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: 'Hackathon',
      od: true,
      attendanceCreditDays: 1,
      description: '',
      learningOutcome: '',
      skills: '',
      evidenceFiles: []
    });
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const myActivities = activities.filter(
    a => (user?.name && a.studentName?.toLowerCase() === user.name.toLowerCase()) || (user?.id && a.studentId === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🎖️</span> CO-CURRICULAR PORTFOLIO &amp; ON-DUTY (OD) WORKFLOW
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Submit Activity &amp; Request On-Duty Attendance Credit
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Upload certificates from Hackathons, Workshops, Certifications, NSS, Sports, and track Faculty &amp; HOD approval workflow.
          </p>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono flex items-center gap-2 shadow-2xs">
          <span className="text-base">✓</span> Activity submitted successfully! Assigned for Faculty Mentor verification and HOD OD approval.
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Submission Form */}
        <div className="lg:col-span-6 card p-6 bg-white space-y-4">
          <div className="font-display font-bold text-base text-[var(--ink)] border-b border-[var(--rule)] pb-2.5 flex items-center justify-between">
            <span>New Activity Portfolio &amp; OD Claim</span>
            <span className="font-mono text-xs text-[var(--slate)]">Semester {activeSemester}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Event / Activity Title *:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Smart India Hackathon 2026 / AWS Cloud Summit"
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Organizing Body / Institute *:</label>
                <input
                  type="text"
                  required
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="e.g. IIT Madras / IEEE / AWS"
                  className="field-input text-xs"
                />
              </div>
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Event Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Chennai / Virtual"
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Start Date *:</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, endDate: e.target.value })}
                  className="field-input text-xs"
                />
              </div>
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">End Date:</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Category Type *:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="field-input text-xs"
                >
                  <option value="Hackathon">Hackathon / Coding</option>
                  <option value="Workshop">Hands-on Workshop</option>
                  <option value="Seminar">Technical Seminar</option>
                  <option value="Certification">Industry Certification</option>
                  <option value="Internship">Internship / Project</option>
                  <option value="Sports">Sports Tournament</option>
                  <option value="NSS">NSS / Community Service</option>
                  <option value="Industrial Visit">Industrial Visit</option>
                  <option value="Cultural">Cultural Event</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Skills Demonstrated:</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Spring Boot, AI"
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Description &amp; Contribution:</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe your role, problem statement solved, or project prototype built..."
                className="field-input text-xs"
              />
            </div>

            {/* On-Duty (OD) Attendance Credit Section */}
            <div className="p-3.5 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="od-check"
                  checked={formData.od}
                  onChange={(e) => setFormData({ ...formData, od: e.target.checked })}
                  className="w-4 h-4 text-[var(--brass)] focus:ring-[var(--brass)] rounded cursor-pointer"
                />
                <label htmlFor="od-check" className="font-mono font-bold text-[var(--ink)] cursor-pointer text-xs">
                  Request Official On-Duty (OD) Attendance Credit
                </label>
              </div>

              {formData.od && (
                <div className="flex items-center gap-2 pt-1.5 text-xs font-mono text-[var(--slate)]">
                  <span>Number of OD Days Requested:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.attendanceCreditDays}
                    onChange={(e) => setFormData({ ...formData, attendanceCreditDays: Number(e.target.value) })}
                    className="w-16 p-1 border border-[var(--rule)] bg-white rounded font-bold text-center"
                  />
                  <span>Day(s)</span>
                </div>
              )}
            </div>

            {/* Certificate / Evidence Attachment */}
            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Attach Certificate / Proof (PDF, JPG, PNG):</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, evidenceFiles: [e.target.files[0].name] });
                  }
                }}
                className="field-input text-xs font-mono"
              />
              {formData.evidenceFiles.length > 0 && (
                <span className="text-[11px] font-mono text-emerald-800 mt-1 block">
                  📎 Attached: {formData.evidenceFiles.join(', ')}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-brass w-full py-2.5 rounded text-xs font-mono font-bold shadow-xs cursor-pointer"
            >
              Submit for Department Verification &amp; OD Approval →
            </button>
          </form>
        </div>

        {/* History and Multi-Tier Approval Tracker */}
        <div className="lg:col-span-6 card p-6 bg-white space-y-4">
          <div className="font-display font-bold text-base text-[var(--ink)] border-b border-[var(--rule)] pb-2.5 flex items-center justify-between">
            <span>Portfolio History &amp; Approval Queue</span>
            <span className="font-mono text-xs text-[var(--slate)]">{myActivities.length} Submissions</span>
          </div>

          <LedgerTable
            emptyMessage="No activity portfolio records found. Submit your first co-curricular event on the left!"
            columns={[
              {
                header: 'Activity Details',
                accessor: 'title',
                render: (a) => (
                  <div>
                    <div className="font-bold text-xs text-[var(--ink)]">{a.title}</div>
                    <div className="text-[10px] font-mono text-[var(--slate)]">
                      {a.category} • {a.org} ({a.date})
                    </div>
                  </div>
                )
              },
              {
                header: 'OD Credit',
                accessor: 'od',
                render: (a) => (
                  <span className="font-mono text-xs">
                    {a.od ? (
                      <strong className="text-amber-800">{a.attendanceCreditDays || 1} Day(s) ⚡</strong>
                    ) : (
                      'None'
                    )}
                  </span>
                )
              },
              {
                header: 'Workflow Status',
                accessor: 'status',
                render: (a) => {
                  const isHodApproved = a.status === 'HOD_APPROVED' || a.status === 'VERIFIED';
                  const isFacultyApproved = a.status === 'FACULTY_APPROVED';
                  const isRejected = a.status === 'REJECTED';

                  return (
                    <Badge variant={isHodApproved ? 'pass' : isRejected ? 'fail' : 'amber'}>
                      {isHodApproved ? 'HOD APPROVED ✓' : isFacultyApproved ? 'FACULTY APPROVED' : isRejected ? 'REJECTED' : 'SUBMITTED'}
                    </Badge>
                  );
                }
              },
              {
                header: 'Details',
                accessor: 'id',
                render: (a) => (
                  <button
                    onClick={() => setSelectedActivityDetail(a)}
                    className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] cursor-pointer"
                  >
                    View
                  </button>
                )
              }
            ]}
            data={myActivities}
          />
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivityDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedActivityDetail(null)}
          title={`Activity Record — ${selectedActivityDetail.title}`}
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2 font-mono">
              <span className="font-bold text-[var(--brass-2)]">{selectedActivityDetail.category}</span>
              <Badge variant={selectedActivityDetail.status === 'HOD_APPROVED' ? 'pass' : selectedActivityDetail.status === 'REJECTED' ? 'fail' : 'amber'}>
                {selectedActivityDetail.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div>Organizer: <strong>{selectedActivityDetail.org}</strong></div>
                <div>Location: <strong>{selectedActivityDetail.location || 'Campus'}</strong></div>
                <div>Date: <strong>{selectedActivityDetail.date}</strong></div>
                <div>OD Credit Days: <strong>{selectedActivityDetail.attendanceCreditDays || 0} Day(s)</strong></div>
              </div>

              {selectedActivityDetail.skills && (
                <div className="text-[11px] font-mono text-[var(--slate)]">
                  Skills: <span className="text-[var(--ink)] font-semibold">{selectedActivityDetail.skills}</span>
                </div>
              )}
            </div>

            {/* Multi-tier Approval Timeline */}
            <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg space-y-2 font-mono text-[11px]">
              <strong className="text-[var(--brass-2)] block uppercase tracking-wider text-[10px]">
                Multi-Tier Approval Trail:
              </strong>
              <div className="space-y-1 text-[var(--slate)]">
                <div>
                  1. Submission: <strong className="text-emerald-800">Recorded on {selectedActivityDetail.date}</strong>
                </div>
                <div>
                  2. Faculty Mentor Verification: <strong className="text-[var(--ink)]">{selectedActivityDetail.facultyRemarks || 'Verified Certificate authenticity'}</strong>
                </div>
                <div>
                  3. HOD Decision: <strong className="text-[var(--ink)]">{selectedActivityDetail.hodRemarks || 'Approved attendance credit adjustment'}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedActivityDetail(null)}
                className="px-4 py-1.5 bg-[var(--ink)] text-white rounded font-mono font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
