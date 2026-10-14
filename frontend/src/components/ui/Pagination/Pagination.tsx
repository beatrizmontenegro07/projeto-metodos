import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Gera lista de páginas para exibir com elipses
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.info}>
        Mostrando <span className={styles.bold}>{startItem}–{endItem}</span> de{' '}
        <span className={styles.bold}>{totalItems}</span> pacientes
      </div>

      <nav className={styles.pagination} aria-label="Navegação entre páginas">
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        <div className={styles.pagesList}>
          {pages.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                  ...
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                className={`${styles.pageButton} ${isCurrent ? styles.active : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.navButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

