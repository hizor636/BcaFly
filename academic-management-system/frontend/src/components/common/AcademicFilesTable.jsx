import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../hooks/useAuth';
import { LedgerTable } from './LedgerTable';
import { Badge } from '../ui/Badge';

export const AcademicFilesTable = ({ files = [], recordTypeFilter, onUploadClick, emptyText }) => {
  const { deleteAcademicFile, activeSemester } = useAcademic();
  const { user } = useAuth();

  const isStudent = user?.role === 'STUDENT';
  const isAdminOrHOD = user?.role === 'ADMIN' || user?.role === 'HOD';

  const filteredFiles = files.filter(f => {
    if (recordTypeFilter && f.recordType !== recordTypeFilter) return false;
    if (isStudent && f.studentId && f.studentId !== user?.id) return false;
    return true;
  });

  const handleDownload = (file) => {
    // Generate simulated download or link
    const blob = new Blob([`BcaFly Academic Document: ${file.title}\nOriginal File: ${file.fileName}\nSemester: ${file.sem}\nUploaded By: ${file.uploadedBy}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleView = (file) => {
    alert(`File Record Details:\n\nTitle: ${file.title}\nFilename: ${file.fileName}\nCategory: ${file.recordType}\nCourse/Student: ${file.courseCode !== 'ALL' ? file.courseCode : file.studentName}\nSize: ${file.size}\nUploaded: ${file.uploadedAt} by ${file.uploadedBy}\nDescription: ${file.description || 'None'}`);
  };

  return (
    <div className="card overflow-hidden mt-6">
      <div className="p-4 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🗂️</span>
          <span className="font-mono text-xs font-bold text-[var(--ink)]">
            {recordTypeFilter ? `${recordTypeFilter} Supporting Evidence & Files` : 'All Semester Academic Files'}
          </span>
          <span className="badge b-ink">{filteredFiles.length} File(s)</span>
        </div>

        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="btn-brass px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>📤</span> Upload Document
          </button>
        )}
      </div>

      <LedgerTable
        emptyMessage={emptyText || `No files have been uploaded for this section in Semester ${activeSemester}.`}
        columns={[
          {
            header: 'File & Title',
            accessor: 'fileName',
            render: (f) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <span>📄</span> {f.title || f.fileName}
                </div>
                <div className="text-[10px] text-[var(--slate)]">
                  {f.fileName} • <span className="font-bold text-[var(--brass-2)]">{f.ext}</span> ({f.size})
                </div>
              </div>
            )
          },
          {
            header: 'Record Type',
            accessor: 'recordType',
            render: (f) => (
              <Badge variant={f.recordType === 'Attendance' ? 'pass' : f.recordType === 'Assessment' ? 'amber' : f.recordType === 'Result' ? 'ink' : 'pub'}>
                {f.recordType}
              </Badge>
            )
          },
          {
            header: 'Student / Course',
            accessor: 'courseCode',
            render: (f) => (
              <div className="font-mono text-xs">
                <div className="font-bold text-[var(--ink)]">{f.courseCode !== 'ALL' ? f.courseCode : f.studentName}</div>
                <div className="text-[10px] text-[var(--slate)]">{f.courseCode !== 'ALL' ? f.studentName : 'Semester ' + f.sem}</div>
              </div>
            )
          },
          {
            header: 'Uploaded By',
            accessor: 'uploadedBy',
            render: (f) => (
              <div className="font-mono text-xs">
                <div>{f.uploadedBy}</div>
                <div className="text-[10px] text-[var(--slate)]">{f.uploadedAt}</div>
              </div>
            )
          },
          {
            header: 'Actions',
            accessor: 'id',
            render: (f) => (
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => handleView(f)}
                  className="text-[var(--brass-2)] hover:underline font-bold"
                  title="View metadata"
                >
                  View
                </button>
                <span className="text-[var(--rule)]">·</span>
                <button
                  onClick={() => handleDownload(f)}
                  className="text-[var(--ink)] hover:underline font-bold"
                  title="Download file"
                >
                  Download
                </button>
                {isAdminOrHOD && (
                  <>
                    <span className="text-[var(--rule)]">·</span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete file "${f.fileName}"?`)) {
                          deleteAcademicFile(f.id);
                        }
                      }}
                      className="text-red-700 hover:underline font-bold"
                      title="Delete record"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )
          }
        ]}
        data={filteredFiles}
      />
    </div>
  );
};
