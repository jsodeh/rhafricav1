import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  useKeyboardNavigation, 
  useScreenReader,
  useFocusManagement,
  KEYBOARD_CODES 
} from '@/lib/accessibility';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
  accessor?: string;
  description?: string;
}

interface TableRow {
  id: string | number;
  [key: string]: any;
}

interface AccessibleTableProps {
  columns: TableColumn[];
  data: TableRow[];
  caption?: string;
  summary?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowSelect?: (row: TableRow) => void;
  onRowAction?: (row: TableRow, action: string) => void;
  selectedRows?: (string | number)[];
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  caption,
  summary,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onRowSelect,
  onRowAction,
  selectedRows = [],
  striped = true,
  hoverable = true,
  bordered = true,
  compact = false,
  loading = false,
  emptyMessage = 'No data available',
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}) => {
  const { announce } = useScreenReader();
  const { setFocus } = useFocusManagement();
  
  const tableRef = useRef<HTMLTableElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [announcementText, setAnnouncementText] = useState('');

  // Handle sorting
  const handleSort = useCallback((column: TableColumn) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = sortBy === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
    
    announce(
      `Table sorted by ${column.header}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`,
      'polite'
    );
  }, [sortBy, sortDirection, onSort, announce]);

  // Handle row selection
  const handleRowSelect = useCallback((row: TableRow) => {
    if (!onRowSelect) return;
    
    onRowSelect(row);
    const isSelected = selectedRows.includes(row.id);
    announce(
      `Row ${isSelected ? 'deselected' : 'selected'}`,
      'polite'
    );
  }, [onRowSelect, selectedRows, announce]);

  // Keyboard navigation for table cells
  const { handleKeyDown: handleTableKeyDown } = useKeyboardNavigation(
    () => {
      // Enter - select row or activate cell
      if (focusedCell && data[focusedCell.row]) {
        const row = data[focusedCell.row];
        if (onRowSelect) {
          handleRowSelect(row);
        } else if (onRowAction) {
          onRowAction(row, 'activate');
        }
      }
    },
    () => {
      // Space - select row
      if (focusedCell && data[focusedCell.row] && onRowSelect) {
        handleRowSelect(data[focusedCell.row]);
      }
    },
    undefined,
    (direction) => {
      // Arrow key navigation
      if (!focusedCell) {
        setFocusedCell({ row: 0, col: 0 });
        return;
      }

      let newRow = focusedCell.row;
      let newCol = focusedCell.col;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, focusedCell.row - 1);
          break;
        case 'down':
          newRow = Math.min(data.length - 1, focusedCell.row + 1);
          break;
        case 'left':
          newCol = Math.max(0, focusedCell.col - 1);
          break;
        case 'right':
          newCol = Math.min(columns.length - 1, focusedCell.col + 1);
          break;
      }

      if (newRow !== focusedCell.row || newCol !== focusedCell.col) {
        setFocusedCell({ row: newRow, col: newCol });
        
        // Announce cell content
        const column = columns[newCol];
        const row = data[newRow];
        const cellValue = column.accessor ? row[column.accessor] : row[column.key];
        
        setAnnouncementText(
          `${column.header}: ${cellValue}, row ${newRow + 1} of ${data.length}, column ${newCol + 1} of ${columns.length}`
        );
      }
    }
  );

  // Handle table focus
  const handleTableFocus = () => {
    if (!focusedCell && data.length > 0) {
      setFocusedCell({ row: 0, col: 0 });
    }
  };

  // Handle cell click
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setFocusedCell({ row: rowIndex, col: colIndex });
  };

  // Render sort indicator
  const renderSortIcon = (column: TableColumn) => {
    if (!column.sortable) return null;

    const isActive = sortBy === column.key;
    
    if (isActive) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4 inline ml-1" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-4 w-4 inline ml-1" aria-hidden="true" />
      );
    }
    
    return <ChevronsUpDown className="h-4 w-4 inline ml-1 text-gray-400" aria-hidden="true" />;
  };

  // Get cell value
  const getCellValue = (row: TableRow, column: TableColumn) => {
    const value = column.accessor ? row[column.accessor] : row[column.key];
    return column.render ? column.render(value, row, data.indexOf(row)) : value;
  };

  // Generate table classes
  const tableClasses = cn(
    'w-full border-collapse',
    bordered && 'border border-gray-200',
    className
  );

  const rowClasses = (index: number, isHeader = false) => cn(
    !isHeader && striped && index % 2 === 0 && 'bg-gray-50',
    !isHeader && hoverable && 'hover:bg-gray-100',
    !isHeader && selectedRows.includes(data[index]?.id) && 'bg-blue-50 border-blue-200',
    !isHeader && focusedCell?.row === index && 'ring-2 ring-blue-500 ring-inset'
  );

  const cellClasses = (column: TableColumn, rowIndex?: number, colIndex?: number) => cn(
    compact ? 'px-3 py-2' : 'px-6 py-4',
    'text-sm',
    column.align === 'center' && 'text-center',
    column.align === 'right' && 'text-right',
    bordered && 'border-b border-gray-200',
    focusedCell?.row === rowIndex && focusedCell?.col === colIndex && 'ring-2 ring-blue-500 ring-inset'
  );

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
        aria-label="Loading table data"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" aria-hidden="true"></div>
        <span className="sr-only">Loading table data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="text-center py-12 text-gray-500"
        role="status"
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Live region for announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcementText}
      </div>

      <table
        ref={tableRef}
        className={tableClasses}
        role="table"
        aria-label={ariaLabel || caption || 'Data table'}
        aria-describedby={ariaDescribedby}
        aria-rowcount={data.length + 1}
        aria-colcount={columns.length}
        tabIndex={0}
        onFocus={handleTableFocus}
        onKeyDown={handleTableKeyDown}
      >
        {caption && (
          <caption className="text-left text-lg font-semibold text-gray-900 pb-4">
            {caption}
          </caption>
        )}
        
        {summary && (
          <caption className="sr-only">
            {summary}
          </caption>
        )}

        <thead className="bg-gray-50">
          <tr role="row" aria-rowindex={1}>
            {columns.map((column, index) => (
              <th
                key={column.key}
                role="columnheader"
                aria-colindex={index + 1}
                aria-sort={
                  column.sortable && sortBy === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : column.sortable
                    ? 'none'
                    : undefined
                }
                className={cn(
                  cellClasses(column),
                  'font-semibold text-gray-900 text-left',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100',
                  column.width && `w-${column.width}`
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={column.sortable ? () => handleSort(column) : undefined}
                onKeyDown={column.sortable ? (e) => {
                  if (e.key === KEYBOARD_CODES.ENTER || e.key === KEYBOARD_CODES.SPACE) {
                    e.preventDefault();
                    handleSort(column);
                  }
                } : undefined}
                tabIndex={column.sortable ? 0 : -1}
                aria-describedby={column.description ? `${column.key}-desc` : undefined}
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column)}
                </div>
                
                {column.description && (
                  <span id={`${column.key}-desc`} className="sr-only">
                    {column.description}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id}
              role="row"
              aria-rowindex={rowIndex + 2}
              aria-selected={selectedRows.includes(row.id)}
              className={rowClasses(rowIndex)}
              onClick={onRowSelect ? () => handleRowSelect(row) : undefined}
              style={{ cursor: onRowSelect ? 'pointer' : 'default' }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={`${row.id}-${column.key}`}
                  role="gridcell"
                  aria-colindex={colIndex + 1}
                  className={cellClasses(column, rowIndex, colIndex)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(rowIndex, colIndex);
                  }}
                  tabIndex={focusedCell?.row === rowIndex && focusedCell?.col === colIndex ? 0 : -1}
                >
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table instructions */}
      <div className="sr-only" id="table-instructions">
        Use arrow keys to navigate through table cells. 
        Press Enter to select a row or activate a cell. 
        Press Space to select a row.
        {columns.some(col => col.sortable) && ' Click or press Enter on column headers to sort.'}
      </div>
    </div>
  );
};

export default AccessibleTable;
