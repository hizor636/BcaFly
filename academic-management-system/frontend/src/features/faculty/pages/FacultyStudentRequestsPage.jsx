import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export const FacultyStudentRequestsPage = () => {
  const { helpdeskTickets, resolveStudentRequest } = useAcademic();
  const { user } = useAuth();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [actionSuccess, setActionSuccess] = useState(null);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    resolveStudentRequest(selectedTicket.id, {
      replyMessage,
      status: resolutionStatus,
      facultyName: user?.name || 'Prof. K. Rao'
    });

    setActionSuccess(`✓ Reply submitted on ticket #${selectedTicket.id}. Status set to ${resolutionStatus}.`);
    setReplyMessage('');
    setSelectedTicket(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>💬</span> ACADEMIC GRIEVANCE &amp; QUERY RESOLUTION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Student Academic Inquiries &amp; Helpdesk Queue
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Resolve student course doubts, marks review requests, and assignment resubmission inquiries.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          {actionSuccess}
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {helpdeskTickets.map((ticket) => {
          const isOpen = ticket.status === 'OPEN';
          const isResolved = ticket.status === 'RESOLVED';

          return (
            <div
              key={ticket.id}
              className={`card p-6 bg-white border transition space-y-4 ${
                isOpen ? 'border-amber-300 bg-amber-50/15' : 'border-[var(--rule)]'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3 border-b border-[var(--rule)] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brass-2)] bg-[var(--brass-soft)] px-2.5 py-0.5 rounded border border-[var(--brass)]">
                      {ticket.studentName} ({ticket.reg})
                    </span>
                    <Badge variant={isOpen ? 'amber' : isResolved ? 'pass' : 'ink'}>
                      {ticket.category}
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    {ticket.subject}
                  </h4>
                  <p className="text-xs font-mono text-[var(--slate)] mt-0.5">
                    Ticket #{ticket.id} • Filed on {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="text-right">
                  <Badge variant={isOpen ? 'amber' : isResolved ? 'pass' : 'ink'}>
                    {ticket.status}
                  </Badge>
                  <div className="text-[10px] font-mono text-[var(--slate)] mt-1">Priority: {ticket.priority}</div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-2 font-sans text-xs">
                <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg space-y-1">
                  <div className="font-mono font-bold text-[var(--ink)] flex justify-between text-[11px]">
                    <span>{ticket.studentName} (Student)</span>
                    <span className="text-[var(--slate)]">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[var(--ink)] leading-relaxed">{ticket.description}</p>
                </div>

                {ticket.replies && ticket.replies.length > 1 && (
                  <div className="space-y-2 pl-4 border-l-2 border-[var(--brass)]">
                    {ticket.replies.slice(1).map((rep, idx) => (
                      <div key={idx} className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                        <div className="font-mono font-bold text-blue-950 flex justify-between text-[11px]">
                          <span>{rep.author} ({rep.role})</span>
                          <span className="text-blue-700">{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-blue-900 leading-relaxed">{rep.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[var(--rule)] flex justify-end">
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setReplyMessage('');
                    setResolutionStatus('RESOLVED');
                  }}
                  className="btn-brass px-4 py-1.5 rounded font-mono text-xs font-bold shadow-2xs cursor-pointer"
                >
                  💬 Reply &amp; Resolve Inquiry →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Reply to Query #${selectedTicket.id} — ${selectedTicket.studentName}`}
        >
          <form onSubmit={handleReplySubmit} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg font-mono space-y-1">
              <div>Student: <strong className="text-[var(--ink)]">{selectedTicket.studentName}</strong></div>
              <div>Subject: <strong>{selectedTicket.subject}</strong></div>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Set Inquiry Status:</label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="field-input text-xs font-mono font-bold"
              >
                <option value="RESOLVED">Resolved (Close Ticket)</option>
                <option value="IN_PROGRESS">In Progress (Waiting for student)</option>
                <option value="OPEN">Keep Open</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[var(--ink)] mb-1">Faculty Official Reply *:</label>
              <textarea
                rows={4}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your official academic explanation or resolution note..."
                className="field-input text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex justify-end gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-2 rounded text-xs text-[var(--slate)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-brass px-4 py-2 rounded font-bold shadow-xs cursor-pointer"
              >
                Submit Response →
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
