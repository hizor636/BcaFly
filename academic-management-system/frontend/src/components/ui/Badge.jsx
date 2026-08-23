import React from 'react';

export const Badge = ({ status, variant, children }) => {
  const norm = (status || '').toString().toLowerCase();

  let badgeClass = 'b-ink';
  if (variant) {
    badgeClass = `b-${variant}`;
  } else if (norm === 'pass' || norm === 'eligible' || norm === 'verified' || norm === 'published' || norm === 'present' || norm === 'active') {
    badgeClass = 'b-pass';
  } else if (norm === 'fail' || norm === 'debarred' || norm === 'rejected' || norm === 'arrear' || norm === 'absent') {
    badgeClass = 'b-fail';
  } else if (norm === 'amber' || norm === 'pending' || norm === 'condonation' || norm === 'late') {
    badgeClass = 'b-amber';
  } else if (norm === 'locked' || norm === 'draft') {
    badgeClass = 'b-lock';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {children || status}
    </span>
  );
};
