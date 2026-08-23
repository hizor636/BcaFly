import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon, onClick, valueColor = 'text-[var(--ink)]' }) => {
  return (
    <div
      onClick={onClick}
      className={`card p-5 transition ${onClick ? 'cursor-pointer hover:border-[var(--brass)] hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold">{title}</div>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className={`stat-num ${valueColor}`}>{value}</div>
      {subtitle && (
        <div className="text-[10px] font-mono text-emerald-700 mt-2 font-medium flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};
