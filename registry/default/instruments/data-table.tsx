"use client";

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/registry/default/lib/utils";
import { Checkbox } from "@/registry/default/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  /** Unit shown once, in the header. Never repeat it in every cell. */
  unit?: string;
  cell: (row: T) => React.ReactNode;
  /** Provide to make the column sortable. Null and empty values sort last. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "start" | "end";
  /** Use tabular numerals. Turn on for counts and measurements. */
  numeric?: boolean;
  width?: string;
  /** Extra classes for both the header and body cells. */
  className?: string;
};

export type DataTableSort = {
  columnId: string;
  direction: "asc" | "desc";
};

export type DataTableProps<T> = Omit<
  React.ComponentProps<"div">,
  "children"
> & {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Accessible name for each row's checkbox. Defaults to the row id. */
  getRowLabel?: (row: T) => string;
  title?: React.ReactNode;
  /** Extra controls, placed at the end of the header. */
  toolbar?: React.ReactNode;
  label?: string;
  emptyLabel?: React.ReactNode;
  selectable?: boolean;
  /** Controlled selection. Omit to let the table manage it. */
  selectedIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** The row shown in a detail panel. */
  activeRowId?: string;
  onRowActivate?: (id: string, row: T) => void;
  defaultSort?: DataTableSort;
  maxHeight?: number | string;
};

function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  const aMissing = a === null || a === undefined || a === "";
  const bMissing = b === null || b === undefined || b === "";
  if (aMissing && bMissing) {
    return 0;
  }
  if (aMissing) {
    return 1;
  }
  if (bMissing) {
    return -1;
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  getRowLabel,
  title,
  toolbar,
  label,
  emptyLabel = "No rows.",
  selectable = false,
  selectedIds,
  onSelectionChange,
  activeRowId,
  onRowActivate,
  defaultSort,
  maxHeight,
  className,
  ...props
}: DataTableProps<T>): React.ReactElement {
  const [sort, setSort] = React.useState<DataTableSort | null>(
    defaultSort ?? null,
  );
  const [internalSelection, setInternalSelection] = React.useState<Set<string>>(
    new Set(),
  );
  const selected = selectedIds ?? internalSelection;

  const sortedRows = React.useMemo(() => {
    if (!sort) {
      return rows;
    }
    const column = columns.find((entry) => entry.id === sort.columnId);
    if (!column?.sortValue) {
      return rows;
    }
    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const aValue = column.sortValue?.(a.row);
        const bValue = column.sortValue?.(b.row);
        const aMissing =
          aValue === null || aValue === undefined || aValue === "";
        const bMissing =
          bValue === null || bValue === undefined || bValue === "";
        if (aMissing !== bMissing) {
          return aMissing ? 1 : -1;
        }
        const result = compareValues(aValue, bValue);
        return (
          (sort.direction === "asc" ? result : -result) || a.index - b.index
        );
      })
      .map((entry) => entry.row);
  }, [columns, rows, sort]);

  function setSelection(next: Set<string>) {
    if (onSelectionChange) {
      onSelectionChange(next);
    } else {
      setInternalSelection(next);
    }
  }

  function toggleRow(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelection(next);
  }

  const allSelected =
    sortedRows.length > 0 &&
    sortedRows.every((row) => selected.has(getRowId(row)));
  const someSelected =
    !allSelected && sortedRows.some((row) => selected.has(getRowId(row)));
  const columnCount = columns.length + (selectable ? 1 : 0);
  const accessibleLabel =
    label ?? (typeof title === "string" ? title : "Data table");

  function toggleAll(checked: boolean) {
    const next = new Set(selected);
    for (const row of sortedRows) {
      const id = getRowId(row);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    setSelection(next);
  }

  function toggleSort(column: DataTableColumn<T>) {
    setSort((current) => {
      if (current?.columnId !== column.id) {
        return { columnId: column.id, direction: "asc" };
      }
      return {
        columnId: column.id,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background",
        className,
      )}
      data-slot="data-table"
      {...props}
    >
      {title || toolbar ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
          <div className="me-auto min-w-0">
            {title ? <h3 className="font-medium text-sm">{title}</h3> : null}
            <p className="font-mono text-muted-foreground text-xs tabular-nums">
              {rows.length} {rows.length === 1 ? "row" : "rows"}
              {selectable && selected.size > 0
                ? ` · ${selected.size} selected`
                : null}
            </p>
          </div>
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-auto" style={{ maxHeight }}>
        <Table aria-label={accessibleLabel}>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-px">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => toggleAll(checked)}
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => {
                const active = sort?.columnId === column.id;
                return (
                  <TableHead
                    aria-sort={
                      active
                        ? sort?.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      column.align === "end" && "text-end",
                      column.numeric && "tabular-nums",
                      column.className,
                    )}
                    key={column.id}
                    scope="col"
                    style={{ width: column.width }}
                  >
                    {column.sortValue ? (
                      <button
                        aria-label={`Sort by ${
                          typeof column.header === "string"
                            ? column.header
                            : column.id
                        }`}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded-sm text-start outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                          column.align === "end" && "justify-end",
                        )}
                        onClick={() => toggleSort(column)}
                        type="button"
                      >
                        {column.header}
                        {column.unit ? (
                          <span className="font-normal">({column.unit})</span>
                        ) : null}
                        {active ? (
                          sort?.direction === "asc" ? (
                            <ArrowUpIcon
                              aria-hidden="true"
                              className="size-3"
                            />
                          ) : (
                            <ArrowDownIcon
                              aria-hidden="true"
                              className="size-3"
                            />
                          )
                        ) : (
                          <ChevronsUpDownIcon
                            aria-hidden="true"
                            className="size-3 opacity-48"
                          />
                        )}
                      </button>
                    ) : (
                      <>
                        {column.header}
                        {column.unit ? (
                          <span className="font-normal"> ({column.unit})</span>
                        ) : null}
                      </>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={columnCount}
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                const isActive = activeRowId === id;
                return (
                  <TableRow
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      onRowActivate &&
                        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      isActive && "bg-accent/32 hover:bg-accent/40",
                    )}
                    data-active={isActive ? "" : undefined}
                    data-state={isSelected ? "selected" : undefined}
                    key={id}
                    onClick={
                      onRowActivate
                        ? (event) => {
                            const target = event.target as HTMLElement;
                            if (
                              target.closest(
                                'button, a, input, select, textarea, [role="checkbox"]',
                              )
                            ) {
                              return;
                            }
                            onRowActivate(id, row);
                          }
                        : undefined
                    }
                    onKeyDown={
                      onRowActivate
                        ? (event) => {
                            const target = event.target as HTMLElement;
                            if (
                              target.closest(
                                'button, a, input, select, textarea, [role="checkbox"]',
                              )
                            ) {
                              return;
                            }
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowActivate(id, row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowActivate ? 0 : undefined}
                  >
                    {selectable ? (
                      <TableCell className="w-px">
                        <Checkbox
                          aria-label={`Select ${getRowLabel?.(row) ?? id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(id, checked)}
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell
                        className={cn(
                          column.align === "end" && "text-end",
                          column.numeric && "tabular-nums",
                          column.className,
                        )}
                        data-column={column.id}
                        key={column.id}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
