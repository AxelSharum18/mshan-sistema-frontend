import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onCustomAction,
  customActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
  pageSize = 12,
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever data changes (e.g. after filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(safeData.length / pageSize));
  const startIdx   = (currentPage - 1) * pageSize;
  const pageData   = safeData.slice(startIdx, startIdx + pageSize);

  const goTo = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {col.header}
                </th>
              ))}
              {(onCustomAction || onSecondaryAction || onEdit || onDelete) && (
                <th className="text-end" style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 120 }}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onCustomAction || onSecondaryAction || onEdit || onDelete ? 1 : 0)}
                  className="text-center py-5"
                  style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                >
                  <div>📭</div>
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onCustomAction || onSecondaryAction || onEdit || onDelete) && (
                    <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                      {onCustomAction && (
                        <button
                          className="btn btn-sm btn-outline-dark me-1"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => onCustomAction(row)}
                        >
                          {customActionLabel || 'Acción'}
                        </button>
                      )}
                      {onSecondaryAction && (
                        <button
                          className="btn btn-sm btn-outline-secondary me-1"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => onSecondaryAction(row)}
                        >
                          {secondaryActionLabel || 'Secundaria'}
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => onEdit(row)}
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => onDelete(row)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {safeData.length > pageSize && (
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Mostrando {startIdx + 1}–{Math.min(startIdx + pageSize, safeData.length)} de {safeData.length} registros
          </span>

          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link rounded" onClick={() => goTo(currentPage - 1)} style={{ border: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <ChevronLeft size={14} />
                </button>
              </li>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <li key={`dot-${i}`} className="page-item disabled">
                    <span className="page-link" style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}>…</span>
                  </li>
                ) : (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button
                      className="page-link rounded"
                      onClick={() => goTo(page)}
                      style={{
                        border: 'none',
                        background: page === currentPage ? '#111' : 'var(--bg-primary)',
                        color: page === currentPage ? '#fff' : 'var(--text-primary)',
                        fontWeight: page === currentPage ? 700 : 400,
                        minWidth: 32,
                      }}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link rounded" onClick={() => goTo(currentPage + 1)} style={{ border: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <ChevronRight size={14} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DataTable;
