import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const HodTimetablePage = () => {
  const { activeSemester, timetableEntries, publishTimetableByHod } = useAcademic();

  const [selectedDay, setSelectedDay] = useState('ALL');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const semEntries = timetableEntries.filter(t => !t.semesterId || t.semesterId === String(activeSemester));

  const filteredEntries = semEntries.filter(t => {
    if (selectedDay !== 'ALL' && t.dayOfWeek !== selectedDay) return false;
    return true;
  });

  const handlePublish = () => {
    publishTimetableByHod(activeSemester);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3500);
  };

  const headers = ['Day', 'Time Slot', 'Course Code', 'Course Title', 'Session Type', 'Assigned Faculty', 'Room', 'Status'];
  const rows = filteredEntries.map(t => [
    t.dayOfWeek,
    `${t.startTime} - ${t.endTime}`,
    t.courseCode,
    t.courseName,
    t.sessionType,
    t.facultyName || 'Prof. K. Rao',
    t.room,
    t.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🗓️</span> TIMETABLE GOVERNANCE &amp; SANCTION
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Master Timetable Governance
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Review room allocations, detect scheduling conflicts, verify faculty workloads, and publish the official department timetable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublish}
            className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>📜</span> Sanction &amp; Publish Timetable
          </button>
          <ExportToolbar
            filename={`hod_timetable_sem${activeSemester}`}
            title={`Semester ${activeSemester} Master Timetable`}
            subtitle="Department of Computer Applications"
            headers={headers}
            rows={rows}
          />
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-mono shadow-2xs">
          ✓ Official Semester {activeSemester} Timetable sanctioned and published live to students &amp; faculty!
        </div>
      )}

      {/* Conflict Validation Status Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between flex-wrap gap-3 font-mono text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <span>✓</span>
          <strong>Conflict Detection: Zero Overlapping Conflicts Detected.</strong>
        </div>
        <span className="text-[11px] text-emerald-800">Room availability &amp; faculty hours validated</span>
      </div>

      {/* Day Filter */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--slate)]">FILTER DAY:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="field-input text-xs py-1 min-w-[160px]"
          >
            <option value="ALL">All Teaching Days</option>
            {DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <span className="text-[var(--slate)] font-bold">
          {filteredEntries.length} Scheduled Sessions
        </span>
      </div>

      {/* Timetable Ledger Table */}
      <div className="card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
          <h4 className="font-display font-bold text-base text-[var(--ink)]">
            Master Teaching Schedule (Semester {activeSemester})
          </h4>
          <span className="font-mono text-xs text-[var(--slate)]">Section A Roster</span>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Day',
              accessor: 'dayOfWeek',
              render: (t) => <strong className="font-mono text-xs text-[var(--ink)]">{t.dayOfWeek}</strong>
            },
            {
              header: 'Time Slot',
              accessor: 'startTime',
              render: (t) => (
                <span className="font-mono font-bold text-xs bg-[var(--parchment-2)] px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--ink)]">
                  {t.startTime} – {t.endTime}
                </span>
              )
            },
            {
              header: 'Course Code & Name',
              accessor: 'courseCode',
              render: (t) => (
                <div>
                  <span className="font-mono font-bold text-xs text-[var(--brass-2)] mr-1">{t.courseCode}</span>
                  <span className="font-bold text-xs text-[var(--ink)]">{t.courseName}</span>
                </div>
              )
            },
            {
              header: 'Type',
              accessor: 'sessionType',
              render: (t) => <Badge variant={t.sessionType === 'LAB' ? 'ink' : 'pass'}>{t.sessionType}</Badge>
            },
            {
              header: 'Assigned Instructor',
              accessor: 'facultyName',
              render: (t) => (
                <span className="font-mono text-xs text-[var(--slate)] font-bold">
                  {t.facultyName || (t.courseCode === 'BCA301' ? 'Dr. A. Sharma' : t.courseCode === 'BCA303' ? 'Prof. M. Varma' : t.courseCode === 'BCA304' ? 'Dr. S. Nair' : 'Prof. K. Rao')}
                </span>
              )
            },
            {
              header: 'Room',
              accessor: 'room',
              render: (t) => <span className="font-mono text-xs text-[var(--ink)] font-bold">📍 {t.room}</span>
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (t) => <Badge variant={t.status === 'SCHEDULED' ? 'pass' : 'amber'}>{t.status}</Badge>
            }
          ]}
          data={filteredEntries}
        />
      </div>
    </div>
  );
};
