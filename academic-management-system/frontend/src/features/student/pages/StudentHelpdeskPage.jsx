import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

const CATEGORIES = [
  'Attendance correction',
  'Marks correction',
  'Fee issue',
  'Course enrolment issue',
  'Timetable issue',
  'Technical issue',
  'OD/activity issue',
  'Certificate/document request',
  'General query'
];

export const StudentHelpdeskPage = () => {
  const { helpdeskTickets, createHelpdeskTicket, replyHelpdeskTicket, updateTicketStatus } = useAcademic();
  const { user } = useAuth();

  const [newTicketModal, setNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Ticket Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [attachments, setAttachments] = useState([]);
  const [ticketCreatedSuccess, setTicketCreatedSuccess] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');

  const currentStudentId = user?.id || 'student-s3-001';
  const currentStudentName = user?.name || 'Rahul Kumar';
  const currentStudentReg = user?.usn || 'BCS23CA001';

  const myTickets = helpdeskTickets.filter(
    t => t.studentName?.toLowerCase() === currentStudentName.toLowerCase() || t.studentId === currentStudentId
  );

  const filteredTickets = myTickets.filter(t => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const created = createHelpdeskTicket({
      category,
      subject,
      description,
      priority,
      attachments: attachments.length > 0 ? attachments : [],
      studentId: currentStudentId,
      studentName: currentStudentName,
      reg: currentStudentReg
    });

    setTicketCreatedSuccess(true);
    setTimeout(() => {
      setNewTicketModal(false);
      setSubject('');
      setDescription('');
      setAttachments([]);
      setTicketCreatedSuccess(false);
      setSelectedTicket(created);
    }, 1200);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    replyHelpdeskTicket(selectedTicket.id, {
      message: replyText,
      author: currentStudentName,
      role: 'STUDENT'
    });

    setReplyText('');
    // refresh selected ticket
    const updated = helpdeskTickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>💬</span> STUDENT GRIEVANCE &amp; SUPPORT SERVICES
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Helpdesk &amp; Support Ticketing System
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Raise official academic, attendance, marks, fee, or technical inquiries and track resolution threads with staff.
          </p>
        </div>

        <button
          onClick={() => setNewTicketModal(true)}
          className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>➕</span> Raise Support Ticket
        </button>
      </div>

      {/* Filter and Summary Bar */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--slate)] font-bold">CATEGORY:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--slate)] font-bold">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field-input py-1.5 text-xs w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <span className="text-[var(--slate)] font-semibold">
          {filteredTickets.length} Support Tickets Found
        </span>
      </div>

      {/* 2-Column Helpdesk Layout: Tickets List & Active Discussion Thread */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Ledger */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="card p-12 text-center text-xs font-mono text-[var(--slate)] bg-white">
              No support tickets filed under this criteria.
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`card p-4 cursor-pointer transition border ${
                    isSelected ? 'border-[var(--brass)] bg-[var(--parchment)] shadow-sm' : 'border-[var(--rule)] bg-white hover:border-[var(--slate-light)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)]">
                      #{ticket.id}
                    </span>
                    <Badge variant={ticket.status === 'RESOLVED' ? 'pass' : ticket.status === 'IN_PROGRESS' ? 'amber' : 'ink'}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-[var(--ink)] mb-1">{ticket.subject}</h4>
                  <div className="text-[11px] font-mono text-[var(--slate)] mb-2">
                    Category: <strong className="text-[var(--brass-2)]">{ticket.category}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--slate)] pt-2 border-t border-[var(--rule)]/60">
                    <span>Replies: {ticket.replies?.length || 1}</span>
                    <span>Deadline: {new Date(ticket.resolutionDeadline).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Detail & Message Thread */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="card p-6 bg-white space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--rule)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)]">#{selectedTicket.id}</span>
                    <span className="font-mono text-xs text-[var(--slate)]">• {selectedTicket.category}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--ink)]">{selectedTicket.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={selectedTicket.status === 'RESOLVED' ? 'pass' : 'amber'}>
                    {selectedTicket.status}
                  </Badge>
                  {selectedTicket.status === 'RESOLVED' && (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'REOPENED')}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded font-mono text-[11px] font-bold cursor-pointer"
                    >
                      Reopen Ticket 🔄
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {selectedTicket.replies?.map((rep, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                      rep.role === 'STUDENT'
                        ? 'bg-[var(--parchment-2)] border-[var(--rule)] ml-4'
                        : 'bg-amber-50/70 border-amber-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                      <span className="font-bold text-[var(--ink)]">
                        {rep.role === 'STUDENT' ? `👤 ${rep.author} (You)` : `👨‍🏫 ${rep.author} (${rep.role})`}
                      </span>
                      <span className="text-[var(--slate)]">
                        {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[var(--ink)] font-sans">{rep.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[var(--rule)] space-y-2">
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the support staff..."
                  className="field-input text-xs font-sans"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-ink px-4 py-2 rounded font-mono text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Send Reply →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-12 text-center font-mono text-xs text-[var(--slate)] bg-white">
              Select a ticket on the left to view the official conversation thread or create a new support ticket above.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {newTicketModal && (
        <Modal
          isOpen={true}
          onClose={() => setNewTicketModal(false)}
          title="Raise New Helpdesk Support Ticket"
        >
          {ticketCreatedSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs text-center">
              ✓ Ticket created and assigned to Department Academic Coordinator!
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Issue Category *:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field-input text-xs"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Subject / Summary *:</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Attendance reconciliation for OS lecture on Aug 22"
                  className="field-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-[var(--ink)] mb-1">Priority Level:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="field-input text-xs"
                  >
                    <option value="LOW">Low (General Query)</option>
                    <option value="MEDIUM">Medium (Academic)</option>
                    <option value="HIGH">High (Immediate Action)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono font-bold text-[var(--ink)] mb-1">Attach Supporting Proof:</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachments([e.target.files[0].name]);
                      }
                    }}
                    className="field-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-[var(--ink)] mb-1">Detailed Description *:</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete context, affected course codes, dates, and what resolution is required..."
                  className="field-input text-xs font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModal(false)}
                  className="px-3 py-2 rounded font-mono text-xs text-[var(--slate)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass px-4 py-2 rounded font-mono text-xs font-bold shadow-xs cursor-pointer"
                >
                  Submit Ticket →
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
