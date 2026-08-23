import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';

export const FacultyProfilePage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();

  const courses = activeWorkspace?.courses || [];
  const facultyId = user?.id || 'FAC02';
  const myCourses = courses.filter(
    c => c.facultyId === facultyId || c.code === 'BCA302' || c.code === 'BCA305L'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>👤</span> FACULTY IDENTIFIER &amp; ACADEMIC PROFILE
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Faculty Profile &amp; Departmental Allocation
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Official university credentials, teaching allocations, office hours, and committee responsibilities.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6 bg-white space-y-6">
        <div className="flex items-start gap-5 flex-wrap pb-6 border-b border-[var(--rule)]">
          <div className="w-20 h-20 rounded-full bg-[var(--ink)] text-white flex items-center justify-center font-display font-bold text-2xl border-4 border-[var(--brass-soft)] shadow-sm">
            KR
          </div>

          <div className="space-y-1 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl text-[var(--ink)]">
                Prof. K. Rao
              </h3>
              <Badge variant="pass">ACTIVE FACULTY</Badge>
            </div>
            <p className="text-xs font-mono text-[var(--brass-2)] font-bold">
              Associate Professor • Department of Computer Applications
            </p>
            <p className="text-xs font-mono text-[var(--slate)]">
              Faculty ID: <strong>FAC-2018-092</strong> • Employee Code: <strong>EMP-0844</strong>
            </p>
          </div>
        </div>

        {/* 2-Column Details */}
        <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Contact & Cabin */}
          <div className="space-y-3 p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
            <h4 className="font-bold text-[var(--ink)] uppercase tracking-wider text-xs border-b border-[var(--rule)] pb-1.5">
              Contact &amp; Office Details
            </h4>
            <div className="space-y-2 text-[var(--slate)]">
              <div className="flex justify-between">
                <span>Official Email:</span>
                <strong className="text-[var(--ink)]">rao@bcafly.edu</strong>
              </div>
              <div className="flex justify-between">
                <span>Campus Intercom:</span>
                <strong className="text-[var(--ink)]">+91 (080) 4567 8902 (Ext 302)</strong>
              </div>
              <div className="flex justify-between">
                <span>Faculty Cabin:</span>
                <strong className="text-[var(--ink)]">Room 304, Block B, CS Wing</strong>
              </div>
              <div className="flex justify-between">
                <span>Student Consultation:</span>
                <strong className="text-[var(--ink)]">Mon–Thu (03:30 PM – 04:30 PM)</strong>
              </div>
            </div>
          </div>

          {/* Academic Specialization */}
          <div className="space-y-3 p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
            <h4 className="font-bold text-[var(--ink)] uppercase tracking-wider text-xs border-b border-[var(--rule)] pb-1.5">
              Qualifications &amp; Research Areas
            </h4>
            <div className="space-y-2 text-[var(--slate)]">
              <div className="flex justify-between">
                <span>Highest Degree:</span>
                <strong className="text-[var(--ink)]">M.Tech (Computer Science), Ph.D (Pursuing)</strong>
              </div>
              <div className="flex justify-between">
                <span>Specialization:</span>
                <strong className="text-[var(--ink)]">Distributed Systems &amp; OOP Architectures</strong>
              </div>
              <div className="flex justify-between">
                <span>Experience:</span>
                <strong className="text-[var(--ink)]">11 Years Teaching &amp; Research</strong>
              </div>
              <div className="flex justify-between">
                <span>Committee Role:</span>
                <strong className="text-[var(--ink)]">Convener — Lab Infrastructure &amp; SIH Mentorship</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Courses Ledger */}
        <div className="space-y-3 pt-2">
          <h4 className="font-display font-bold text-sm text-[var(--ink)]">
            Allocated Teaching Courses — Semester {activeSemester} (2025–26 ODD)
          </h4>

          <div className="grid sm:grid-cols-2 gap-4">
            {myCourses.map(c => (
              <div key={c.code} className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg space-y-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[var(--brass-2)]">{c.code}</span>
                  <Badge variant={c.type?.includes('Lab') ? 'ink' : 'pass'}>{c.type}</Badge>
                </div>
                <h5 className="font-bold text-xs text-[var(--ink)]">{c.name || c.title}</h5>
                <div className="text-[11px] font-mono text-[var(--slate)] flex justify-between pt-1">
                  <span>Credits: {c.credits}</span>
                  <span>Room: {c.room || 'Room 302'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
