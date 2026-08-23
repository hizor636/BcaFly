import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminTimetablePage = () => {
  const { activeSemester, timetable } = useAcademic();

  const days = timetable[activeSemester] || [
    { day: 'Monday', slot1: 'Core Theory', slot2: 'Core Theory', slot3: 'Allied Theory', slot4: 'Lab Session', slot5: 'Lab Session' },
    { day: 'Tuesday', slot1: 'Core Theory', slot2: 'Elective', slot3: 'Core Theory', slot4: 'Library / Seminar', slot5: 'Mentoring' },
    { day: 'Wednesday', slot1: 'Elective', slot2: 'Core Theory', slot3: 'Allied Theory', slot4: 'Core Theory', slot5: 'Sports' },
    { day: 'Thursday', slot1: 'Allied Theory', slot2: 'Core Theory', slot3: 'Core Theory', slot4: 'Lab Session', slot5: 'Lab Session' },
    { day: 'Friday', slot1: 'Core Theory', slot2: 'Elective', slot3: 'Allied Theory', slot4: 'Club Activity', slot5: 'Placement Training' }
  ];

  const headers = ['Day / Period', 'Period 1 (09:00 - 10:00)', 'Period 2 (10:00 - 11:00)', 'Period 3 (11:15 - 12:15)', 'Period 4 (01:00 - 02:00)', 'Period 5 (02:00 - 03:00)'];
  const rows = days.map(d => [d.day, d.slot1, d.slot2, d.slot3, d.slot4, d.slot5]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Timetable Matrix
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Master weekly lecture &amp; laboratory timetable for Semester {activeSemester}.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_timetable`}
          title={`Semester ${activeSemester} Master Timetable`}
          subtitle="Department of Computer Applications — Room Matrix"
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-[var(--ink)]">WEEKLY SCHEDULE MATRIX</span>
          <span className="ws-tag text-[9px]">ROOM ASSIGNMENTS VERIFIED</span>
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
                  <td className="font-mono font-bold text-[var(--ink)] bg-[var(--parchment)]/40">{d.day}</td>
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
    </div>
  );
};
