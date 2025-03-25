import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string;
  fixed?: boolean;
  cell?: (item: T) => ReactNode;
  className?: string;
}

export interface ScrollableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T | ((item: T) => string);
  className?: string;
  fixedColumnWidth?: string;
  scrollableMinWidth?: string;
}

export function ScrollableTable<T>({
  data,
  columns,
  keyField,
  className,
  fixedColumnWidth = '150px',
  scrollableMinWidth = '400px',
}: ScrollableTableProps<T>) {
  const fixedColumns = columns.filter(col => col.fixed);
  const scrollableColumns = columns.filter(col => !col.fixed);
  
  // Function to generate a key for each row
  const getRowKey = (item: T): string => {
    if (typeof keyField === 'function') {
      return keyField(item);
    }
    return String(item[keyField]);
  };
  
  // Function to render a cell
  const renderCell = (item: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell(item);
    }
    
    // Handle nested paths (e.g., "user.name")
    const path = String(column.accessorKey).split('.');
    let value: any = item;
    for (const key of path) {
      value = value?.[key];
    }
    
    return value;
  };
  
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop view - Hidden on mobile */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={String(column.accessorKey)} 
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={getRowKey(item)}>
                {columns.map((column) => (
                  <TableCell 
                    key={`${getRowKey(item)}-${String(column.accessorKey)}`}
                    className={column.className}
                  >
                    {renderCell(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile view - Shown only on mobile with horizontal scrolling and fixed columns */}
      <div className="md:hidden relative overflow-hidden">
        <div className="flex flex-row">
          {/* Fixed columns */}
          {fixedColumns.length > 0 && (
            <div className="sticky left-0 z-10 bg-background shadow-md">
              <table className={cn("border-collapse", { [`min-w-[${fixedColumnWidth}]`]: fixedColumnWidth })}>
                <thead>
                  <tr>
                    {fixedColumns.map((column) => (
                      <th 
                        key={String(column.accessorKey)} 
                        className={cn(
                          "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
                          column.className
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={`fixed-${getRowKey(item)}`}>
                      {fixedColumns.map((column) => (
                        <td 
                          key={`fixed-${getRowKey(item)}-${String(column.accessorKey)}`}
                          className={cn(
                            "p-2 align-middle border-b whitespace-nowrap",
                            column.className
                          )}
                        >
                          {renderCell(item, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Scrollable columns */}
          <div className="overflow-x-auto touch-pan-x">
            <table className={cn("border-collapse", { [`min-w-[${scrollableMinWidth}]`]: scrollableMinWidth })}>
              <thead>
                <tr>
                  {scrollableColumns.map((column) => (
                    <th 
                      key={String(column.accessorKey)} 
                      className={cn(
                        "h-10 px-4 align-middle font-medium text-muted-foreground",
                        column.className
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={`scroll-${getRowKey(item)}`}>
                    {scrollableColumns.map((column) => (
                      <td 
                        key={`scroll-${getRowKey(item)}-${String(column.accessorKey)}`}
                        className={cn(
                          "p-2 px-4 align-middle border-b",
                          column.className
                        )}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
} 