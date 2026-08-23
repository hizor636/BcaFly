import React from 'react';

export const LedgerTable = ({
  columns = [],
  data = [],
  renderRow,
  emptyMessage = 'No records found in this semester workspace.',
  searchPlaceholder,
  searchValue,
  onSearchChange,
  extraToolbar
}) => {
  const filteredData = searchValue
    ? data.filter(item => {
        const str = JSON.stringify(item).toLowerCase();
        return str.includes(searchValue.toLowerCase());
      })
    : data;

  return (
    <div className="card overflow-hidden">
      {(searchPlaceholder || extraToolbar) && (
        <div className="p-4 border-b border-[var(--rule)] bg-[var(--parchment-2)] flex items-center justify-between flex-wrap gap-3">
          {searchPlaceholder ? (
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="field-input text-xs pl-8 pr-3 py-1.5"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--slate)]">🔍</span>
            </div>
          ) : <div />}

          {extraToolbar && <div>{extraToolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="ledger w-full text-xs">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-[var(--slate)] font-mono">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) =>
                renderRow ? (
                  renderRow(item, idx)
                ) : (
                  <tr key={idx}>
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                      >
                        {col.render ? col.render(item, idx) : item[col.accessor]}
                      </td>
                    ))}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
