import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        'bg-[var(--background-secondary)]',
        '[&_tr]:border-b [&_tr]:border-[var(--border)]',
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr]:border-b [&_tr]:border-[var(--border-light)]',
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-[var(--border)] bg-[var(--background-secondary)]',
        'font-medium',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[var(--border-light)] transition-colors',
        hover && 'cursor-pointer hover:bg-[var(--background-secondary)]',
        'data-[state=selected]:bg-[var(--primary-50)]',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}>(
  ({ className, sortable, sorted, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle',
        'text-xs font-semibold uppercase tracking-wider',
        'text-[var(--foreground-muted)]',
        '[&:has([role=checkbox])]:pr-0',
        sortable && 'cursor-pointer select-none hover:text-[var(--foreground)]',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="text-[var(--foreground-subtle)]">
            {sorted === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : sorted === 'desc' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-40" />
            )}
          </span>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle',
        'text-sm text-[var(--foreground)]',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-[var(--foreground-muted)]', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

// Empty State Component
interface TableEmptyProps {
  columns: number;
  message?: string;
  icon?: React.ReactNode;
}

function TableEmpty({ columns, message = 'No data available', icon }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={columns} className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          {icon || (
            <div className="h-12 w-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
              <svg className="h-6 w-6 text-[var(--foreground-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          )}
          <p className="text-[var(--foreground-muted)]">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// Loading Skeleton Row
function TableSkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-[var(--border-light)]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 w-3/4 rounded bg-[var(--background-secondary)] animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, TableEmpty, TableSkeletonRow };
