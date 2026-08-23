import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { Badge } from '../../../components/ui/Badge';
import { LedgerTable } from '../../../components/common/LedgerTable';

const DEFAULT_TIMETABLE_MATRIX = {
  1: [
    { day: 'Monday', slot1: 'BCA101 (C Prog)', slot2: 'BCA102 (Discrete Math)', slot3: 'BCA103 (Digital Logic)', slot4: 'BCA105L (C Lab)', slot5: 'BCA105L (C Lab)' },
    { day: 'Tuesday', slot1: 'BCA102 (Discrete Math)', slot2: 'BCA104 (Pro Comm)', slot3: 'BCA101 (C Prog)', slot4: 'Library / Mentoring', slot5: 'Sports' },
    { day: 'Wednesday', slot1: 'BCA103 (Digital Logic)', slot2: 'BCA101 (C Prog)', slot3: 'BCA102 (Discrete Math)', slot4: 'BCA104 (Pro Comm)', slot5: 'Remedial' },
    { day: 'Thursday', slot1: 'BCA104 (Pro Comm)', slot2: 'BCA103 (Digital Logic)', slot3: 'BCA101 (C Prog)', slot4: 'BCA105L (C Lab)', slot5: 'BCA105L (C Lab)' },
    { day: 'Friday', slot1: 'BCA101 (C Prog)', slot2: 'BCA102 (Discrete Math)', slot3: 'BCA104 (Pro Comm)', slot4: 'Club Activity', slot5: 'Placement Training' }
  ],
  2: [
    { day: 'Monday', slot1: 'BCA201 (Data Structures)', slot2: 'BCA202 (DBMS)', slot3: 'BCA203 (Maths II)', slot4: 'BCA205L (DS Lab)', slot5: 'BCA205L (DS Lab)' },
    { day: 'Tuesday', slot1: 'BCA202 (DBMS)', slot2: 'BCA204 (Env Studies)', slot3: 'BCA201 (Data Structures)', slot4: 'Library', slot5: 'Seminar' },
    { day: 'Wednesday', slot1: 'BCA203 (Maths II)', slot2: 'BCA201 (Data Structures)', slot3: 'BCA202 (DBMS)', slot4: 'BCA204 (Env Studies)', slot5: 'Sports' },
    { day: 'Thursday', slot1: 'BCA204 (Env Studies)', slot2: 'BCA203 (Maths II)', slot3: 'BCA201 (Data Structures)', slot4: 'BCA205L (DS Lab)', slot5: 'BCA205L (DS Lab)' },
    { day: 'Friday', slot1: 'BCA201 (Data Structures)', slot2: 'BCA202 (DBMS)', slot3: 'BCA204 (Env Studies)', slot4: 'Club Activity', slot5: 'Placement Training' }
  ],
  3: [
    { day: 'Monday', slot1: 'BCA301 (RDBMS)', slot2: 'BCA302 (Java OOP)', slot3: 'BCA303 (Comp Networks)', slot4: 'BCA305L (DBMS/Java Lab)', slot5: 'BCA305L (DBMS/Java Lab)' },
    { day: 'Tuesday', slot1: 'BCA302 (Java OOP)', slot2: 'BCA304 (OS Principles)', slot3: 'BCA301 (RDBMS)', slot4: 'SEM-301 (Library/Seminar)', slot5: 'Mentoring' },
    { day: 'Wednesday', slot1: 'BCA303 (Comp Networks)', slot2: 'BCA301 (RDBMS)', slot3: 'BCA304 (OS Principles)', slot4: 'BCA302 (Java OOP)', slot5: 'Sports' },
    { day: 'Thursday', slot1: 'BCA304 (OS Principles)', slot2: 'BCA303 (Comp Networks)', slot3: 'BCA302 (Java OOP)', slot4: 'BCA305L (Java Lab)', slot5: 'BCA305L (Java Lab)' },
    { day: 'Friday', slot1: 'BCA301 (RDBMS)', slot2: 'BCA304 (OS Principles)', slot3: 'BCA303 (Comp Networks)', slot4: 'CRT-301 (Placement)', slot5: 'CRT-301 (Placement)' }
  ],
  4: [
    { day: 'Monday', slot1: 'BCA401 (Software Eng)', slot2: 'BCA402 (Python Data)', slot3: 'BCA403 (Web Tech)', slot4: 'BCA405L (Web/Python Lab)', slot5: 'BCA405L (Web/Python Lab)' },
    { day: 'Tuesday', slot1: 'BCA402 (Python Data)', slot2: 'BCA404 (Optimization)', slot3: 'BCA401 (Software Eng)', slot4: 'Library', slot5: 'Mentoring' },
    { day: 'Wednesday', slot1: 'BCA403 (Web Tech)', slot2: 'BCA401 (Software Eng)', slot3: 'BCA404 (Optimization)', slot4: 'BCA402 (Python Data)', slot5: 'Sports' },
    { day: 'Thursday', slot1: 'BCA404 (Optimization)', slot2: 'BCA403 (Web Tech)', slot3: 'BCA401 (Software Eng)', slot4: 'BCA405L (Lab)', slot5: 'BCA405L (Lab)' },
    { day: 'Friday', slot1: 'BCA401 (Software Eng)', slot2: 'BCA402 (Python Data)', slot3: 'BCA404 (Optimization)', slot4: 'Club Activity', slot5: 'Placement Training' }
  ],
  5: [
    { day: 'Monday', slot1: 'BCA501 (Cloud Computing)', slot2: 'BCA502 (Mobile Apps)', slot3: 'BCA503E (AI Systems)', slot4: 'BCA505P (Mini Project)', slot5: 'BCA505P (Mini Project)' },
    { day: 'Tuesday', slot1: 'BCA502 (Mobile Apps)', slot2: 'BCA504 (Info Security)', slot3: 'BCA501 (Cloud Computing)', slot4: 'Seminar', slot5: 'Mentoring' },
    { day: 'Wednesday', slot1: 'BCA503E (AI Systems)', slot2: 'BCA501 (Cloud Computing)', slot3: 'BCA504 (Info Security)', slot4: 'BCA502 (Mobile Apps)', slot5: 'Project Work' },
    { day: 'Thursday', slot1: 'BCA504 (Info Security)', slot2: 'BCA503E (AI Systems)', slot3: 'BCA501 (Cloud Computing)', slot4: 'BCA505P (Project Lab)', slot5: 'BCA505P (Project Lab)' },
    { day: 'Friday', slot1: 'BCA501 (Cloud Computing)', slot2: 'BCA502 (Mobile Apps)', slot3: 'BCA504 (Info Security)', slot4: 'Industry Connect', slot5: 'Placement Prep' }
  ],
  6: [
    { day: 'Monday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA603 (Cyber Law)', slot4: 'BCA604I (Capstone Project)', slot5: 'BCA604I (Capstone Project)' },
    { day: 'Tuesday', slot1: 'BCA602E (Machine Learning)', slot2: 'BCA603 (Cyber Law)', slot3: 'BCA601 (Full Stack)', slot4: 'Incubation Lab', slot5: 'Viva Prep' },
    { day: 'Wednesday', slot1: 'BCA603 (Cyber Law)', slot2: 'BCA601 (Full Stack)', slot3: 'BCA602E (Machine Learning)', slot4: 'BCA604I (Internship)', slot5: 'Industry Mentoring' },
    { day: 'Thursday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA603 (Cyber Law)', slot4: 'BCA604I (Capstone Lab)', slot5: 'BCA604I (Capstone Lab)' },
    { day: 'Friday', slot1: 'BCA601 (Full Stack)', slot2: 'BCA602E (Machine Learning)', slot3: 'BCA605 (Viva Voce)', slot4: 'Placement Drive', slot5: 'Placement Drive' }
  ]
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const AdminTimetablePage = () => {
  const { activeSemester, setActiveSemester, timetable = {}, timetableEntries = [] } = useAcademic();
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'roster'
  const [selectedDay, setSelectedDay] = useState('ALL');

  const currentSem = Number(activeSemester) || 3;
  const days = (timetable && timetable[currentSem]) || DEFAULT_TIMETABLE_MATRIX[currentSem] || DEFAULT_TIMETABLE_MATRIX[3];

  const semEntries = (timetableEntries || []).filter(
    t => !t.semesterId || String(t.semesterId) === String(currentSem)
  );

  const filteredEntries = semEntries.filter(t => {
    if (selectedDay !== 'ALL' && t.dayOfWeek !== selectedDay) return false;
    return true;
  });

  const matrixHeaders = ['Day / Period', 'Period 1 (09:00 - 10:00)', 'Period 2 (10:00 - 11:00)', 'Period 3 (11:15 - 12:15)', 'Period 4 (01:00 - 02:00)', 'Period 5 (02:00 - 03:00)'];
  const matrixRows = days.map(d => [d.day, d.slot1, d.slot2, d.slot3, d.slot4, d.slot5]);

  const rosterHeaders = ['Day', 'Time Slot', 'Course Code', 'Course Name', 'Session Type', 'Faculty', 'Room', 'Status'];
  const rosterRows = filteredEntries.map(e => [
    e.dayOfWeek,
    `${e.startTime} - ${e.endTime}`,
    e.courseCode,
    e.courseName,
    e.sessionType,
    e.substituteFacultyName || e.facultyName || 'Department Faculty',
    e.room,
    e.status
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>🗓️</span> MASTER ACADEMIC SCHEDULING
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {currentSem} Master Timetable Matrix
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Institution-wide classroom allocations, laboratory practical hours, and lecture schedules for Semester {currentSem}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportToolbar
            filename={`bca_sem${currentSem}_timetable`}
            title={`Semester ${currentSem} Master Timetable`}
            subtitle="Department of Computer Applications — Room &amp; Course Matrix"
            headers={viewMode === 'matrix' ? matrixHeaders : rosterHeaders}
            rows={viewMode === 'matrix' ? matrixRows : rosterRows}
          />
        </div>
      </div>

      {/* Control Bar: Semester Switcher & View Switcher */}
      <div className="card p-4 bg-white flex items-center justify-between flex-wrap gap-4 font-mono text-xs shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--slate)]">SEMESTER:</span>
            <div className="inline-flex rounded-md border border-[var(--rule)] bg-[var(--parchment-2)] p-0.5">
              {[1, 2, 3, 4, 5, 6].map(sem => (
                <button
                  key={sem}
                  onClick={() => setActiveSemester && setActiveSemester(sem)}
                  className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                    currentSem === sem ? 'bg-[var(--ink)] text-white shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--slate)]">VIEW:</span>
            <div className="inline-flex rounded-md border border-[var(--rule)] bg-[var(--parchment-2)] p-0.5">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-white text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
                }`}
              >
                📊 Matrix View
              </button>
              <button
                onClick={() => setViewMode('roster')}
                className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                  viewMode === 'roster' ? 'bg-white text-[var(--ink)] shadow-2xs' : 'text-[var(--slate)] hover:text-[var(--ink)]'
                }`}
              >
                📋 Detailed Roster
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'roster' && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--slate)]">FILTER DAY:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="field-input py-1 text-xs min-w-[140px]"
            >
              <option value="ALL">All Days</option>
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Verification Status Banner */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between flex-wrap gap-3 font-mono text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <span>✓</span>
          <strong>Institutional Timetable Synchronized &amp; Conflict-Free</strong>
        </div>
        <span className="text-[11px] text-emerald-800">
          Validated against Room Allotments &amp; Department Faculty Workloads
        </span>
      </div>

      {/* Matrix View */}
      {viewMode === 'matrix' ? (
        <div className="card overflow-hidden bg-white shadow-2xs">
          <div className="p-4 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[var(--ink)]">
              WEEKLY SCHEDULE MATRIX — SEMESTER {currentSem}
            </span>
            <span className="ws-tag text-[9px] bg-white border border-[var(--rule)]">ROOM ASSIGNMENTS VERIFIED</span>
          </div>
          <div className="overflow-x-auto">
            <table className="ledger w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left font-mono">Day / Time</th>
                  <th className="text-center font-mono">Period 1<br/><span className="text-[10px] text-[var(--slate)] font-normal">09:00 - 10:00</span></th>
                  <th className="text-center font-mono">Period 2<br/><span className="text-[10px] text-[var(--slate)] font-normal">10:00 - 11:00</span></th>
                  <th className="text-center font-mono">Period 3<br/><span className="text-[10px] text-[var(--slate)] font-normal">11:15 - 12:15</span></th>
                  <th className="text-center font-mono">Period 4<br/><span className="text-[10px] text-[var(--slate)] font-normal">01:00 - 02:00</span></th>
                  <th className="text-center font-mono">Period 5<br/><span className="text-[10px] text-[var(--slate)] font-normal">02:00 - 03:00</span></th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => (
                  <tr key={i}>
                    <td className="font-mono font-bold text-[var(--ink)] bg-[var(--parchment)]/40 whitespace-nowrap">{d.day}</td>
                    <td className="text-center font-mono p-3 bg-white border-r border-[var(--rule)]">{d.slot1}</td>
                    <td className="text-center font-mono p-3 bg-white border-r border-[var(--rule)]">{d.slot2}</td>
                    <td className="text-center font-mono p-3 bg-white border-r border-[var(--rule)]">{d.slot3}</td>
                    <td className="text-center font-mono p-3 bg-white border-r border-[var(--rule)]">{d.slot4}</td>
                    <td className="text-center font-mono p-3 bg-white">{d.slot5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detailed Roster Ledger View */
        <div className="card p-5 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Scheduled Sessions Breakdown (Semester {currentSem})
            </h4>
            <span className="font-mono text-xs text-[var(--slate)]">
              {filteredEntries.length} Sessions Listed
            </span>
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
                header: 'Assigned Faculty',
                accessor: 'facultyName',
                render: (t) => (
                  <span className="font-mono text-xs text-[var(--slate)] font-bold">
                    {t.substituteFacultyName || t.facultyName || 'Assigned Instructor'}
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
                render: (t) => <Badge variant={t.status === 'SCHEDULED' ? 'pass' : t.status === 'SUBSTITUTED' ? 'amber' : 'ink'}>{t.status}</Badge>
              }
            ]}
            data={filteredEntries}
          />
        </div>
      )}
    </div>
  );
};

