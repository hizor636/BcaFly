import React, { useRef, useState } from 'react';

export const IngestionZone = ({
  title = 'IMPORT ACADEMIC SPECIFICATIONS',
  description = 'Upload official spreadsheets or PDFs for automated ingestion into this semester workspace.',
  acceptedFormats = ['.CSV', '.XLSX', '.PDF'],
  onFileSelect,
  icon = '📂'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e, val) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(val);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (onFileSelect) onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (onFileSelect) onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`card p-4 mb-6 ingestion-dropzone cursor-pointer ${isDragOver ? 'dragover' : ''}`}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv, .xlsx, .xls, .pdf"
        onChange={handleInputChange}
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] flex items-center justify-center font-bold text-lg">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs text-[var(--ink)]">{title}</span>
              {acceptedFormats.map((fmt, i) => (
                <span key={i} className={`badge ${fmt.includes('PDF') ? 'b-ink' : fmt.includes('XLS') ? 'b-pass' : 'b-amber'}`}>
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--slate)] mt-0.5 max-w-xl">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--slate)] hidden sm:inline">Drag &amp; Drop or</span>
          <button type="button" className="btn-brass px-3 py-1.5 rounded text-xs font-mono font-bold">
            Select Document 📂
          </button>
        </div>
      </div>
    </div>
  );
};
