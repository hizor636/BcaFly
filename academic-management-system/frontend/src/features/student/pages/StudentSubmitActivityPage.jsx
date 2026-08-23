import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';

export const StudentSubmitActivityPage = () => {
  const { activeSemester, activities, submitActivity } = useAcademic();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    org: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Hackathon',
    od: true,
    skills: ''
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.org) return;

    submitActivity({
      ...formData,
      sem: activeSemester,
      studentId: user?.id || 'student-s3-001',
      studentName: user?.name || 'Rahul Kumar',
      reg: user?.usn || 'BCS23CA001'
    });

    setSubmittedSuccess(true);
    setFormData({
      title: '',
      org: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Hackathon',
      od: true,
      skills: ''
    });
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const myActivities = activities.filter(
    a => a.studentName?.toLowerCase() === (user?.name || 'rahul kumar').toLowerCase() || a.studentId === user?.id
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
          Submit Activity &amp; On-Duty (OD) Claim
        </h3>
        <p className="text-xs text-[var(--slate)]">
          Upload certificates, hackathon participations, seminars, and request official On-Duty attendance credit.
        </p>
      </div>

      {submittedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-mono mb-6 flex items-center gap-2">
          <span>✓</span> Activity portfolio submission sent to HOD &amp; Faculty for verification!
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-6 mb-8">
        {/* Submission Form */}
        <div className="md:col-span-6 card p-6">
          <div className="font-display font-bold text-base text-[var(--ink)] mb-4 border-b border-[var(--rule)] pb-2">
            New Portfolio Entry
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Event / Activity Title:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Smart India Hackathon 2025"
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Organizing Institute / Body:</label>
                <input
                  type="text"
                  required
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="e.g. IIT Bombay / AWS"
                  className="field-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Event Date:</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="field-input text-xs"
                >
                  <option value="Hackathon">Hackathon / Coding</option>
                  <option value="Certification">Industry Certification</option>
                  <option value="Symposium">Technical Symposium</option>
                  <option value="Workshop">Hands-on Workshop</option>
                  <option value="Publication">Paper / Project Presentation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Skills Demonstrated:</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Spring Boot, AI"
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-[var(--parchment-2)] border border-[var(--rule)] rounded flex items-center gap-3">
              <input
                type="checkbox"
                id="claim-od"
                checked={formData.od}
                onChange={(e) => setFormData({ ...formData, od: e.target.checked })}
                className="w-4 h-4 text-[var(--brass)] focus:ring-[var(--brass)] rounded border-[var(--rule)] cursor-pointer"
              />
              <label htmlFor="claim-od" className="text-xs font-mono font-bold text-[var(--ink)] cursor-pointer">
                Request On-Duty (OD) Attendance Credit for this date
              </label>
            </div>

            <button
              type="submit"
              className="btn-brass w-full py-2.5 rounded text-xs font-mono font-bold shadow-xs"
            >
              Submit for Department Verification →
            </button>
          </form>
        </div>

        {/* My Submission History */}
        <div className="md:col-span-6 card p-6">
          <div className="font-display font-bold text-base text-[var(--ink)] mb-4 border-b border-[var(--rule)] pb-2">
            My Submission History
          </div>

          <LedgerTable
            emptyMessage="No activity submissions yet. Submit your first co-curricular event on the left!"
            columns={[
              {
                header: 'Activity Details',
                accessor: 'title',
                render: (a) => (
                  <div>
                    <div className="font-bold text-[var(--ink)]">{a.title}</div>
                    <div className="text-[10px] font-mono text-[var(--slate)]">{a.org} • {a.date}</div>
                  </div>
                )
              },
              {
                header: 'Category & OD',
                accessor: 'category',
                render: (a) => (
                  <div className="flex flex-col gap-1 font-mono text-[10px]">
                    <span className="font-bold">{a.category}</span>
                    {a.od && <span className="text-amber-700 font-semibold">⚡ OD Claimed</span>}
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (a) => (
                  <Badge variant={a.status === 'VERIFIED' ? 'pass' : a.status === 'REJECTED' ? 'fail' : 'amber'}>
                    {a.status}
                  </Badge>
                )
              }
            ]}
            data={myActivities}
          />
        </div>
      </div>
    </div>
  );
};
