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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full ${maxWidth} bg-white rounded-lg shadow-2xl border border-[var(--rule)] overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[var(--parchment-2)] border-b border-[var(--rule)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg text-[var(--ink)]">{title}</h3>
            {tag && <span className="ws-tag text-[9px]">{tag}</span>}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--slate)] hover:text-[var(--ink)] text-lg font-mono leading-none p-1 rounded hover:bg-[var(--parchment)]"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
