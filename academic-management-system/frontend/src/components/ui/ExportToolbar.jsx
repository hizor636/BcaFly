import React, { useState, useRef, useEffect } from 'react';
import { exportToCSV, exportToExcel, exportToPDF, printElement } from '../../services/exportService';
import { ChevronDown, FileText, Table, FileCode, Printer } from 'lucide-react';

export const ExportToolbar = ({
  filename = 'academic_report',
  title = 'BCA Academic Report',
  subtitle = '',
  headers = [],
  rows = [],
  showPrint = true,
  extraButtons = null,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCSV = () => {
    setIsOpen(false);
    exportToCSV(filename, headers, rows);
  };

  const handleExcel = () => {
    setIsOpen(false);
    exportToExcel(filename, 'Academic Ledger', headers, rows);
  };

  const handlePDF = () => {
    setIsOpen(false);
    exportToPDF(title, subtitle, headers, rows, filename);
  };

  const handlePrint = () => {
    setIsOpen(false);
    printElement();
  };

  return (
    <div className="flex items-center gap-2 text-xs font-mono relative" ref={menuRef}>
      {extraButtons}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-1.5 rounded border border-[var(--rule)] bg-white hover:bg-[var(--parchment-2)] text-[var(--ink)] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Export Data"
        >
          <span>Export</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[var(--rule)] rounded-lg shadow-lg py-1.5 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={handleCSV}
              className="w-full px-3 py-2 text-left hover:bg-[var(--parchment-2)] text-[var(--ink)] flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Export as CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExcel}
              className="w-full px-3 py-2 text-left hover:bg-[var(--parchment-2)] text-[var(--ink)] flex items-center gap-2.5 cursor-pointer"
            >
              <Table className="w-4 h-4 text-blue-600" />
              <span>Export as Excel</span>
            </button>
            <button
              type="button"
              onClick={handlePDF}
              className="w-full px-3 py-2 text-left hover:bg-[var(--parchment-2)] text-[var(--ink)] flex items-center gap-2.5 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-red-600" />
              <span>Export as PDF</span>
            </button>
            {showPrint && (
              <>
                <div className="my-1 border-t border-[var(--rule)]" />
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full px-3 py-2 text-left hover:bg-[var(--parchment-2)] text-[var(--ink)] flex items-center gap-2.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[var(--slate)]" />
                  <span>Print</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
