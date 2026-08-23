import React from 'react';
import { exportToCSV, exportToExcel, exportToPDF, printElement } from '../../services/exportService';

export const ExportToolbar = ({
  filename = 'academic_report',
  title = 'BCA Academic Report',
  subtitle = '',
  headers = [],
  rows = [],
  showPrint = true,
  extraButtons = null
}) => {
  const handleCSV = () => exportToCSV(filename, headers, rows);
  const handleExcel = () => exportToExcel(filename, 'Academic Ledger', headers, rows);
  const handlePDF = () => exportToPDF(title, subtitle, headers, rows, filename);
  const handlePrint = () => printElement();

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs font-mono w-full sm:w-auto">
      {extraButtons}
      <button
        onClick={handleCSV}
        className="btn-ghost border border-[var(--rule)] px-3 py-2 rounded hover:border-[var(--brass)] flex items-center gap-1.5 min-h-[38px]"
        title="Export as CSV"
      >
        <span>📄</span> CSV
      </button>
      <button
        onClick={handleExcel}
        className="btn-ghost border border-[var(--rule)] px-3 py-2 rounded hover:border-[var(--brass)] flex items-center gap-1.5 min-h-[38px]"
        title="Export as Excel .XLSX"
      >
        <span>📊</span> EXCEL
      </button>
      <button
        onClick={handlePDF}
        className="btn-brass px-3 py-2 rounded flex items-center gap-1.5 font-bold min-h-[38px]"
        title="Export as PDF Document"
      >
        <span>📑</span> PDF
      </button>
      {showPrint && (
        <button
          onClick={handlePrint}
          className="btn-ghost border border-[var(--rule)] px-3 py-2 rounded hover:border-[var(--ink)] flex items-center gap-1.5 min-h-[38px]"
          title="Print View"
        >
          <span>🖨️</span> PRINT
        </button>
      )}
    </div>
  );
};
