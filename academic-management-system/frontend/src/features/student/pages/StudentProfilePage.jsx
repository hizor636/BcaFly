import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { LedgerTable } from '../../../components/common/LedgerTable';

export const StudentProfilePage = () => {
  const { activeSemester, documentRequests, requestDocument } = useAcademic();
  const { user } = useAuth();

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [docPurpose, setDocPurpose] = useState('');
  const [docRequestSuccess, setDocRequestSuccess] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  const student = {
    name: user?.name || 'Enrolled Student',
    reg: user?.usn || user?.reg || 'Unassigned',
    usn: user?.usn || user?.reg || 'Unassigned',
    dob: user?.dob || '—',
    bloodGroup: user?.bloodGroup || '—',
    email: user?.email || '—',
    phone: user?.phone || '—',
    emergencyContact: user?.emergencyContact || '—',
    fatherName: user?.fatherName || '—',
    motherName: user?.motherName || '—',
    address: user?.address || '—',
    semester: activeSemester,
    section: user?.section || 'A',
    batch: user?.batch || '2026–2029',
    program: 'Bachelor of Computer Applications (BCA)',
    institution: 'BcaFly Institute of Computer Applications'
  };

  const feeReceipts = user?.feeReceipts || [];

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (!docPurpose.trim()) return;

    requestDocument({
      type: docType,
      purpose: docPurpose,
      studentId: user?.id || 'stu-unknown',
      studentName: student.name
    });

    setDocRequestSuccess(true);
    setTimeout(() => {
      setDocModalOpen(false);
      setDocPurpose('');
      setDocRequestSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>👤</span> STUDENT IDENTITY &amp; OFFICIAL CREDENTIALS
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Student Profile &amp; Document Registry
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Digital Identity Card, contact records, parent details, certificate requisition, and official fee ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIdCardModalOpen(true)}
            className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🪪</span> Digital Student ID Card
          </button>
          <button
            onClick={() => setDocModalOpen(true)}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📄</span> Request Bonafide / Transcript
          </button>
        </div>
      </div>

      {/* 2-Column Profile Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Profile Information */}
        <div className="lg:col-span-4 card p-6 bg-white space-y-5 text-center">
          <div className="relative inline-block mx-auto">
            <div className="w-28 h-28 rounded-full bg-[var(--ink-dark)] text-white border-4 border-[var(--brass)] flex items-center justify-center font-brand font-bold text-4xl shadow-md mx-auto">
              {student.name.charAt(0)}
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active Student Status"></span>
          </div>

          <div>
            <h4 className="font-display font-bold text-xl text-[var(--ink)]">{student.name}</h4>
            <p className="text-xs font-mono text-[var(--slate)] mt-0.5">Register No: <strong>{student.reg}</strong></p>
            <div className="mt-2 inline-block">
              <Badge variant="pass">ENROLLED STUDENT • ACTIVE</Badge>
            </div>
          </div>

          <div className="text-left text-xs font-mono space-y-2 pt-4 border-t border-[var(--rule)] text-[var(--slate)]">
            <div className="flex justify-between">
              <span>Program:</span>
              <strong className="text-[var(--ink)]">{student.program}</strong>
            </div>
            <div className="flex justify-between">
              <span>Semester / Sec:</span>
              <strong className="text-[var(--ink)]">Sem {student.semester} - Sec {student.section}</strong>
            </div>
            <div className="flex justify-between">
              <span>Academic Batch:</span>
              <strong className="text-[var(--ink)]">{student.batch}</strong>
            </div>
            <div className="flex justify-between">
              <span>Blood Group:</span>
              <strong className="text-[var(--ink)]">{student.bloodGroup}</strong>
            </div>
          </div>

          <button
            onClick={() => setIdCardModalOpen(true)}
            className="w-full py-2 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] text-[var(--ink)] hover:text-[var(--brass-2)] font-mono text-xs font-bold rounded border border-[var(--rule)] transition cursor-pointer"
          >
            🪪 View &amp; Print Student ID Card
          </button>
        </div>

        {/* Right: Contact & Parent Records */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card p-6 bg-white space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--ink)] border-b border-[var(--rule)] pb-2.5">
              Personal &amp; Guardian Contact Details
            </h4>

            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                <span className="text-[var(--slate)] block text-[10px]">STUDENT EMAIL ADDRESS:</span>
                <span className="font-bold text-[var(--ink)]">{student.email}</span>
              </div>

              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                <span className="text-[var(--slate)] block text-[10px]">STUDENT PHONE NUMBER:</span>
                <span className="font-bold text-[var(--ink)]">{student.phone}</span>
              </div>

              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                <span className="text-[var(--slate)] block text-[10px]">FATHER / GUARDIAN NAME:</span>
                <span className="font-bold text-[var(--ink)]">{student.fatherName}</span>
              </div>

              <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                <span className="text-[var(--slate)] block text-[10px]">EMERGENCY CONTACT PHONE:</span>
                <span className="font-bold text-emerald-800">{student.emergencyContact}</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                <span className="text-[var(--slate)] block text-[10px]">PERMANENT RESIDENTIAL ADDRESS:</span>
                <span className="font-bold text-[var(--ink)]">{student.address}</span>
              </div>
            </div>
          </div>

          {/* Document Requests History */}
          <div className="card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <h4 className="font-display font-bold text-base text-[var(--ink)]">
                Document Requests &amp; Certificate Issuance
              </h4>
              <button
                onClick={() => setDocModalOpen(true)}
                className="text-xs font-mono text-[var(--brass-2)] font-bold hover:underline cursor-pointer"
              >
                + New Request
              </button>
            </div>

            <LedgerTable
              columns={[
                {
                  header: 'Document Type',
                  accessor: 'type',
                  render: (d) => <span className="font-bold text-xs text-[var(--ink)]">{d.type}</span>
                },
                {
                  header: 'Purpose',
                  accessor: 'purpose',
                  render: (d) => <span className="text-xs text-[var(--slate)] font-sans">{d.purpose}</span>
                },
                {
                  header: 'Requested Date',
                  accessor: 'requestedAt',
                  render: (d) => <span className="font-mono text-xs">{d.requestedAt}</span>
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (d) => (
                    <Badge variant={d.status === 'ISSUED' ? 'pass' : 'amber'}>
                      {d.status === 'ISSUED' ? 'ISSUED ✓' : d.status}
                    </Badge>
                  )
                },
                {
                  header: 'Action',
                  accessor: 'id',
                  render: (d) => (
                    <button
                      onClick={() => alert(`Downloading verified digital ${d.type}`)}
                      className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] cursor-pointer"
                    >
                      {d.status === 'ISSUED' ? 'Download PDF 📥' : 'In Progress ⏳'}
                    </button>
                  )
                }
              ]}
              data={documentRequests}
            />
          </div>

          {/* Fee Receipts History */}
          <div className="card p-6 bg-white space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--ink)] border-b border-[var(--rule)] pb-2.5">
              Semester Fee Payment Receipts
            </h4>

            <LedgerTable
              columns={[
                {
                  header: 'Receipt ID',
                  accessor: 'id',
                  render: (f) => <span className="font-mono font-bold text-xs text-[var(--brass-2)]">{f.id}</span>
                },
                {
                  header: 'Term & Description',
                  accessor: 'term',
                  render: (f) => <span className="font-bold text-xs text-[var(--ink)]">{f.term}</span>
                },
                {
                  header: 'Amount Paid',
                  accessor: 'amount',
                  render: (f) => <span className="font-mono font-bold text-xs text-emerald-800">{f.amount}</span>
                },
                {
                  header: 'Payment Date',
                  accessor: 'date',
                  render: (f) => <span className="font-mono text-xs">{f.date}</span>
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: () => <Badge variant="pass">PAID (CLEARED) ✓</Badge>
                },
                {
                  header: 'Receipt',
                  accessor: 'id',
                  render: (f) => (
                    <button
                      onClick={() => alert(`Downloading official fee receipt: ${f.id}`)}
                      className="px-2.5 py-1 bg-[var(--parchment-2)] hover:bg-[var(--brass-soft)] rounded font-mono text-[11px] font-bold border border-[var(--rule)] cursor-pointer"
                    >
                      Receipt 📥
                    </button>
                  )
                }
              ]}
              data={feeReceipts}
            />
          </div>
        </div>
      </div>

      {/* Digital Student ID Card Modal */}
      {idCardModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIdCardModalOpen(false)}
          title="Digital Student Identity Card"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="max-w-md mx-auto bg-gradient-to-br from-[#101B31] to-[#1B2A4A] text-white p-6 rounded-xl border-2 border-[var(--brass)] shadow-xl relative overflow-hidden">
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brass)]/10 rounded-full blur-2xl"></div>

              {/* ID Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F5E8C9] text-[#B8892D] flex items-center justify-center font-brand font-bold text-lg">
                    B
                  </div>
                  <div>
                    <div className="font-brand font-bold text-sm text-white">BcaFly Institute</div>
                    <div className="text-[9px] font-mono tracking-widest text-[var(--brass)] uppercase">Student Identity Card</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-[var(--brass)] font-bold">
                  2024–2027
                </span>
              </div>

              {/* ID Body */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-24 rounded-lg bg-white/10 border border-[var(--brass)] flex items-center justify-center font-brand font-bold text-3xl text-[var(--brass)] shrink-0">
                  {student.name.charAt(0)}
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <h3 className="font-bold text-sm text-white">{student.name}</h3>
                  <div className="text-[var(--brass)]">USN: <strong>{student.reg}</strong></div>
                  <div className="text-white/80">Program: BCA (Sem {student.semester})</div>
                  <div className="text-white/80">Section: {student.section} • Blood: {student.bloodGroup}</div>
                </div>
              </div>

              {/* ID Footer */}
              <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono text-white/60">
                <span>Emergency: {student.emergencyContact}</span>
                <span className="text-[var(--brass)] font-bold">AUTHORIZED STUDENT</span>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center font-mono">
              <button
                onClick={() => alert('Printing Digital Student ID Card...')}
                className="btn-brass px-4 py-2 rounded text-xs font-bold shadow-xs cursor-pointer"
              >
                🖨️ Print / Save ID Card
              </button>
              <button
                onClick={() => setIdCardModalOpen(false)}
                className="px-4 py-1.5 bg-[var(--ink)] text-white rounded text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Request Modal */}
      {docModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setDocModalOpen(false)}
          title="Request Official Academic Document / Certificate"
        >
          {docRequestSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Document request submitted to College Administration! You will receive a notification upon digital signature.
            </div>
          ) : (
            <form onSubmit={handleDocSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Select Document Type *:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="field-input text-xs"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Official Transcript (Sem 1 & 2)">Official Transcript (Consolidated)</option>
                  <option value="Medium of Instruction Certificate">Medium of Instruction (English) Certificate</option>
                  <option value="Fee Estimation Certificate">Fee Estimation Letter (For Bank Loan)</option>
                  <option value="Character & Conduct Certificate">Character &amp; Conduct Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Purpose / Organization Name *:</label>
                <textarea
                  rows={3}
                  required
                  value={docPurpose}
                  onChange={(e) => setDocPurpose(e.target.value)}
                  placeholder="e.g. National Scholarship Portal verification / Education Loan submission at SBI"
                  className="field-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-3 py-2 rounded text-xs text-[var(--slate)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass px-4 py-2 rounded text-xs font-bold shadow-xs cursor-pointer"
                >
                  Submit Document Request →
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
