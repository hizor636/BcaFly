import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, tag = 'ACTION', children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className={`w-full ${maxWidth} max-w-full bg-white rounded-xl shadow-2xl border border-[var(--rule)] overflow-hidden flex flex-col max-h-[92vh] my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-display font-bold text-base sm:text-lg text-[var(--ink)] truncate text-safe">{title}</h3>
            {tag && <span className="ws-tag text-[9px] shrink-0">{tag}</span>}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--slate)] hover:text-[var(--ink)] text-base font-mono p-2 -mr-1 rounded-md hover:bg-[var(--parchment)] min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer shrink-0"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
