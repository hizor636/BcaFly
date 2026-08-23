import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/Badge';

export const HodProfilePage = () => {
  const { activeSemester, faculty } = useAcademic();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-1 font-bold">
            <span>👤</span> HOD ACADEMIC CREDENTIALS &amp; LEADERSHIP
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Head of Department Profile &amp; Departmental Portfolio
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Executive leadership profile, department accreditation standing, and academic council responsibilities.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6 bg-white space-y-6">
        <div className="flex items-start gap-5 flex-wrap pb-6 border-b border-[var(--rule)]">
          <div className="w-20 h-20 rounded-full bg-[var(--brass-2)] text-white flex items-center justify-center font-display font-bold text-2xl border-4 border-[var(--brass-soft)] shadow-sm">
            AS
          </div>

          <div className="space-y-1 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl text-[var(--ink)]">
                Dr. A. Sharma
              </h3>
              <Badge variant="pass">HEAD OF DEPARTMENT</Badge>
            </div>
            <p className="text-xs font-mono text-[var(--brass-2)] font-bold">
              Professor &amp; Head • Department of Computer Applications
            </p>
            <p className="text-xs font-mono text-[var(--slate)]">
              Employee Code: <strong>EMP-0101</strong> • Academic Council Member • Ph.D, SMIEEE
            </p>
          </div>
        </div>

        {/* 2-Column Details */}
        <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Contact & Cabin */}
          <div className="space-y-3 p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
            <h4 className="font-bold text-[var(--ink)] uppercase tracking-wider text-xs border-b border-[var(--rule)] pb-1.5">
              HOD Office &amp; Administration
            </h4>
            <div className="space-y-2 text-[var(--slate)]">
              <div className="flex justify-between">
                <span>Official Email:</span>
                <strong className="text-[var(--ink)]">sharma@bcafly.edu</strong>
              </div>
              <div className="flex justify-between">
                <span>Direct Intercom:</span>
                <strong className="text-[var(--ink)]">+91 (080) 4567 8900 (Ext 101)</strong>
              </div>
              <div className="flex justify-between">
                <span>HOD Secretariat:</span>
                <strong className="text-[var(--ink)]">Room 301, Block B (Dean Wing)</strong>
              </div>
              <div className="flex justify-between">
                <span>Department Staff:</span>
                <strong className="text-[var(--ink)]">{faculty.length} Faculty Members</strong>
              </div>
            </div>
          </div>

          {/* Academic Specialization & Committees */}
          <div className="space-y-3 p-4 bg-[var(--parchment)] border border-[var(--rule)] rounded-lg">
            <h4 className="font-bold text-[var(--ink)] uppercase tracking-wider text-xs border-b border-[var(--rule)] pb-1.5">
              Academic Governance &amp; Council Roles
            </h4>
            <div className="space-y-2 text-[var(--slate)]">
              <div className="flex justify-between">
                <span>Chairperson:</span>
                <strong className="text-[var(--ink)]">Board of Studies (Computer Applications)</strong>
              </div>
              <div className="flex justify-between">
                <span>Convener:</span>
                <strong className="text-[var(--ink)]">Department Academic Integrity Panel</strong>
              </div>
              <div className="flex justify-between">
                <span>Research Areas:</span>
                <strong className="text-[var(--ink)]">Database Systems, Query Optimization</strong>
              </div>
              <div className="flex justify-between">
                <span>Publications:</span>
                <strong className="text-[var(--ink)]">42 Peer-Reviewed Journal Papers</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
