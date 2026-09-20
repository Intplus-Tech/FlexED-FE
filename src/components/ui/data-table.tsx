"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type OnChangeFn,
  type VisibilityState,
} from "@tanstack/react-table";
import { Info } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TableErrorState } from "@/components/ui/table-error-state";
import { TableCardHeader } from "@/components/ui/table-card-header";
import { ColumnManager } from "@/components/ui/column-manager";
import {
  TableFullViewDialog,
  type TableFullViewConfig,
} from "@/components/ui/table-full-view-dialog";
import { useTableColumnPrefs } from "@/hooks/use-table-column-prefs";
import { normalizeError } from "@/lib/api-error";
import {
  ACTIONS_COLUMN_ID,
  EXPANDER_COLUMN_ID,
  SELECT_COLUMN_ID,
  applyColumnOrder,
  computeAutoFitVisibility,
  dataColumnIdsOf,
  isReservedColumnId,
  visibilityFromHidden,
} from "@/lib/table-column-prefs";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Checkbox / chevron columns are furniture, not data: they shrink to their
// content and sit tight against each other at the row's leading edge. Given the
// standard `px-6` they read as full columns and push the first real column an
// inch off the left margin.
const RESERVED_CELL_CLASS = "w-px px-1 first:pl-6";

// Stable empty visibility map — referenced during a measure pass so the table
// renders every column (each <th> present to be measured) without allocating a
// fresh object each render.
const EMPTY_VISIBILITY: VisibilityState = {};

// useLayoutEffect that degrades to useEffect on the server. Auto-fit must
// measure and trim before paint (so the untrimmed pass is never visible), but
// useLayoutEffect warns during SSR.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Two VisibilityState maps are equal for our purposes when they hide the same
// set of columns — only `false` entries matter; a missing key means "visible".
// Used to skip redundant setState on every ResizeObserver tick.
function visibilityEqual(a: VisibilityState, b: VisibilityState): boolean {
  const aHidden = Object.keys(a).filter((k) => a[k] === false);
  const bHidden = Object.keys(b).filter((k) => b[k] === false);
  if (aHidden.length !== bHidden.length) return false;
  const bSet = new Set(bHidden);
  return aHidden.every((k) => bSet.has(k));
}

/**
 * Placeholder bar width for a cell, as a percentage of its column.
 *
 * Derived from the cell's coordinates rather than `Math.random()` so a row keeps
 * the same silhouette across re-renders — a random width reshuffles on every
 * parent render and turns the pulse into a flicker.
 */
function skeletonBarWidth(row: number, col: number): string {
  const hash = (row * 31 + col * 17) % 11;
  return `${45 + hash * 5}%`;
}

/**
 * Loading rows for the table body, shaped from the *live* column model: same
 * count, same configured widths, same row height and cell padding — so the card
 * is already the right size when the real rows replace them and nothing reflows.
 */
function TableSkeletonRows({
  columns,
  rowCount,
  rowHeightClass,
  cellPaddingClass,
}: {
  columns: {
    id: string;
    columnDef: { size?: number; minSize?: number; maxSize?: number };
  }[];
  rowCount: number;
  rowHeightClass: string;
  cellPaddingClass: string;
}) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <TableRow
      key={rowIndex}
      className={cn("border-b border-gray-200", rowHeightClass)}
    >
      {columns.map((column, colIndex) => (
        <TableCell
          key={column.id}
          style={columnWidthStyle(column.columnDef)}
          className={cn(
            cellPaddingClass,
            column.id === ACTIONS_COLUMN_ID && "px-2 text-center"
          )}
        >
          <Skeleton
            aria-hidden
            className={cn(
              "h-4",
              column.id === ACTIONS_COLUMN_ID && "mx-auto w-4"
            )}
            style={
              column.id === ACTIONS_COLUMN_ID
                ? undefined
                : { width: skeletonBarWidth(rowIndex, colIndex) }
            }
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

/**
 * Inline width style for a column, derived from `size`/`minSize`/`maxSize` on
 * its ColumnDef. Only applied when `size` was explicitly set — columns without
 * a configured width keep natural, content-driven sizing.
 */
function columnWidthStyle(columnDef: {
  size?: number;
  minSize?: number;
  maxSize?: number;
}): React.CSSProperties | undefined {
  if (columnDef.size == null) return undefined;
  return {
    width: columnDef.size,
    minWidth: columnDef.minSize ?? columnDef.size,
    maxWidth: columnDef.maxSize ?? columnDef.size,
  };
}

export type ServerPagination = {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  /** When provided, the page-size selector is rendered for server-paginated tables. */
  onPageSizeChange?: (pageSize: number) => void;
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  title?: string;
  action?: React.ReactNode;
  pageSize?: number;
  /** Options for the page-size selector. Defaults to [10, 25, 50, 100]. Pass `false` to hide. */
  pageSizeOptions?: number[] | false;
  /**
   * Empty-state content. Omit for the standard illustrated `TableEmptyState`.
   * A **string** is rendered as that empty state's headline.
   */
  empty?: React.ReactNode;
  onRefresh?: () => void;
  onSearch?: (term: string) => void;
  showHeader?: boolean;
  showRefresh?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Page-owned filter controls rendered in the toolbar (e.g. a status select). */
  filterControl?: React.ReactNode;
  serverPagination?: ServerPagination;
  isLoading?: boolean;
  isRefetching?: boolean;
  /**
   * The list query failed. Renders `TableErrorState` in place of the empty
   * state, so a broken endpoint never reads as "No records found". Pass the
   * query's `isError`; `error` supplies the reason.
   */
  isError?: boolean;
  error?: unknown;
  /** Hide the pagination footer when every row fits on one page. */
  hidePaginationWhenSinglePage?: boolean;
  /**
   * When provided, clicking (or pressing Enter on) a row invokes this with the
   * row's data. Clicks inside the sticky actions column never reach this —
   * they're isolated so row menus keep working on their own.
   */
  onRowClick?: (row: TData) => void;
  /** Controlled column visibility, passed straight to TanStack Table. */
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  /** Controlled column order (data-column ids). Used by the full-view dialog. */
  columnOrder?: string[];
  /** Freeze the first visible data column to the left edge while scrolling. */
  pinFirstColumn?: boolean;
  /** Row density. `comfortable` (default) matches the design spec; `compact` fits more rows. */
  density?: "comfortable" | "compact";
  /**
   * Master/detail tables: when `renderExpandedRow` is set, each row whose id is
   * in `expandedRowIds` is followed by a full-width row containing that content.
   * Expansion state stays with the caller — the toggle lives in its own
   * `EXPANDER_COLUMN_ID` cell, so the table doesn't have to guess what opens it.
   */
  renderExpandedRow?: (row: TData) => React.ReactNode;
  expandedRowIds?: string[];
  getRowId?: (row: TData) => string;
  /**
   * Opt into the "full view" + column-management pattern:
   *
   * 1. A "Columns" control appears in the toolbar — users choose which columns
   *    show and drag to reorder them, persisted per table via `fullView.tableId`.
   * 2. The compact table **auto-fits**: from the chosen/ordered columns it shows
   *    only as many as fit without horizontal scroll and hides the overflow
   *    (still reachable in full view). Order is the priority — earliest columns
   *    are kept longest. The actions column is never hidden; ≥1 always shows.
   * 3. An "Expand" icon opens a `TableFullViewDialog` — the same rows and column
   *    prefs on a maximized surface with a frozen first column.
   *
   * Pass the *full* column set as both `columns` and `fullView.columns`. Column
   * management is skipped when the caller controls `columnVisibility`.
   */
  fullView?: TableFullViewConfig<TData>;
  className?: string;
};

export function DataTable<TData extends object>({
  columns,
  data,
  title,
  action,
  pageSize = 10,
  pageSizeOptions,
  empty,
  onRefresh,
  onSearch,
  showHeader,
  showRefresh,
  showSearch,
  searchPlaceholder,
  filterControl,
  serverPagination,
  isLoading = false,
  isRefetching = false,
  isError = false,
  error,
  hidePaginationWhenSinglePage = false,
  onRowClick,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  pinFirstColumn = false,
  density = "comfortable",
  renderExpandedRow,
  expandedRowIds,
  getRowId,
  fullView,
  className,
}: DataTableProps<TData>) {
  // TanStack Table returns functions the React Compiler cannot memoize safely —
  // compiling this component silently freezes the table's row model.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  ("use no memo");
  const [pageIndex, setPageIndex] = useState(0);
  const [clientPageSize, setClientPageSize] = useState(pageSize);
  const [hasRightOverflow, setHasRightOverflow] = useState(false);
  const [hasLeftShadow, setHasLeftShadow] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // ─── Column management (order + visibility) ─────────────────────────────────
  // Enabled when `fullView` is set and the caller isn't controlling visibility.
  // (The full-view dialog's inner table is controlled — it receives order and
  // visibility as props and opts out of managing its own.)
  const managesColumns = !!fullView && columnVisibility == null;
  const allDataIds = useMemo(() => dataColumnIdsOf(columns), [columns]);
  const prefs = useTableColumnPrefs({
    storageKey: fullView?.tableId,
    allIds: allDataIds,
  });

  // Effective column order: a controlled prop wins; else the managed prefs; else
  // declared order. Applied by physically reordering the set (actions last).
  const effectiveOrder = columnOrder ?? (managesColumns ? prefs.order : undefined);
  const orderedColumns = useMemo(
    () => (effectiveOrder ? applyColumnOrder(columns, effectiveOrder) : columns),
    [columns, effectiveOrder]
  );

  // ─── Auto-fit ───────────────────────────────────────────────────────────────
  // The managed compact table shows only as many of the *chosen, ordered*
  // columns as fit; user-hidden columns are removed first, then the width-based
  // cutoff trims the overflow (still reachable in full view).
  const autoFit = managesColumns;
  const [autoVisibility, setAutoVisibility] = useState<VisibilityState>({});
  const colWidthsRef = useRef<Map<string, number>>(new Map());
  const measuredKeyRef = useRef<string | null>(null);

  // Chosen, ordered data columns (user-hidden and actions excluded) — this order
  // is the cutoff priority: earliest is kept longest as the table narrows.
  const autoFitIds = useMemo(
    () =>
      managesColumns
        ? prefs.order.filter((id) => !prefs.hidden.includes(id))
        : [],
    [managesColumns, prefs.order, prefs.hidden]
  );
  const hiddenVisibility = useMemo(
    () => (managesColumns ? visibilityFromHidden(prefs.hidden) : undefined),
    [managesColumns, prefs.hidden]
  );

  // Cache key that invalidates the measured widths: the chosen/ordered set plus
  // the row count (a "content may have changed" proxy).
  const measureKey = autoFit ? `${autoFitIds.join("|")}#${data.length}` : "";
  const needsMeasure = autoFit && measuredKeyRef.current !== measureKey;

  // While a fresh measurement is pending, render every *chosen* column so each
  // <th> is in the DOM to be measured; the layout effect trims before paint, so
  // the untrimmed pass never becomes visible. Once measured, add the cutoff.
  const managedVisibility =
    !autoFit || needsMeasure
      ? hiddenVisibility ?? EMPTY_VISIBILITY
      : { ...(hiddenVisibility ?? {}), ...autoVisibility };
  const effectiveVisibility =
    columnVisibility ?? (managesColumns ? managedVisibility : undefined);

  // Track whether the table has horizontal content beyond the visible viewport
  // (and the user hasn't scrolled to the rightmost end). Drives the sticky
  // action column's left-edge shadow.
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;
    const scrollEl = wrapper.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    );
    if (!scrollEl) return;

    const update = () => {
      const max = scrollEl.scrollWidth - scrollEl.clientWidth;
      setHasRightOverflow(max > 1 && scrollEl.scrollLeft < max - 1);
      setHasLeftShadow(scrollEl.scrollLeft > 1);
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    if (scrollEl.firstElementChild) ro.observe(scrollEl.firstElementChild);

    return () => {
      scrollEl.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [data.length]);

  // Auto-fit measurement. Full remeasure on mount / column-set change / row-count
  // change (`measureKey`); cache-only recompute on resize. Runs in a layout
  // effect so any untrimmed pass is corrected before paint.
  useIsomorphicLayoutEffect(() => {
    if (!autoFit) return;
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;
    const scrollEl = wrapper.querySelector<HTMLElement>(
      '[data-slot="table-container"]'
    );
    if (!scrollEl) return;

    // Read every header's intrinsic (content) width into the cache. While the
    // full set overflows, auto table-layout already puts each column at its
    // intrinsic width, so headers are read as-is. If the set currently fits,
    // briefly drop the `min-w-full` stretch so the table collapses to its
    // content width and the readings stay intrinsic.
    const measure = () => {
      const tableEl = scrollEl.querySelector<HTMLElement>('[data-slot="table"]');
      if (!tableEl) return;
      const read = () =>
        scrollEl
          .querySelectorAll<HTMLElement>("th[data-col-id]")
          .forEach((th) => {
            const id = th.getAttribute("data-col-id");
            if (id) colWidthsRef.current.set(id, th.getBoundingClientRect().width);
          });
      if (tableEl.scrollWidth > scrollEl.clientWidth + 1) {
        read();
      } else {
        const prevMinWidth = tableEl.style.minWidth;
        tableEl.style.minWidth = "0px";
        read();
        tableEl.style.minWidth = prevMinWidth;
      }
    };

    // Keep the widest leading run of columns that fits the available width,
    // reserving room for the always-visible actions column.
    const recompute = () => {
      const widths = colWidthsRef.current;
      if (widths.size === 0) return;
      const available = scrollEl.clientWidth;
      if (available === 0) return;
      const next = computeAutoFitVisibility(
        autoFitIds,
        widths,
        available,
        // Both reserved columns are always rendered, so their width is spent
        // before any data column gets a look-in.
        (widths.get(ACTIONS_COLUMN_ID) ?? 0) +
          (widths.get(SELECT_COLUMN_ID) ?? 0) +
          (widths.get(EXPANDER_COLUMN_ID) ?? 0)
      );
      setAutoVisibility((prev) => (visibilityEqual(prev, next) ? prev : next));
    };

    const remeasure = () => {
      measure();
      recompute();
    };

    if (measuredKeyRef.current !== measureKey) {
      measure();
      measuredKeyRef.current = measureKey;
    }
    recompute();

    // Re-check once layout has settled and web fonts have swapped in. Both shift
    // intrinsic column widths and the container width after this first
    // synchronous pass, and neither reliably fires the ResizeObserver.
    const raf = requestAnimationFrame(remeasure);
    let cancelled = false;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (fonts && fonts.status !== "loaded") {
      fonts.ready.then(() => {
        if (!cancelled) remeasure();
      });
    }

    const ro = new ResizeObserver(recompute);
    ro.observe(scrollEl);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measureKey, autoFit]);

  const table = useReactTable({
    data,
    columns: orderedColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(effectiveVisibility
      ? { state: { columnVisibility: effectiveVisibility } }
      : {}),
    ...(onColumnVisibilityChange ? { onColumnVisibilityChange } : {}),
  });

  // First visible data column — frozen to the left edge when `pinFirstColumn`.
  const pinnedColumnId = pinFirstColumn
    ? table.getVisibleLeafColumns().find((c) => !isReservedColumnId(c.id))?.id
    : undefined;

  // Columns the user kept on that auto-fit is currently dropping for want of
  // width. Surfaced in the picker so a ticked checkbox never implies "on screen".
  const autoHiddenIds = useMemo(
    () => Object.keys(autoVisibility).filter((id) => autoVisibility[id] === false),
    [autoVisibility]
  );

  const rowHeightClass = density === "compact" ? "h-10" : "h-14";
  const cellPaddingClass = density === "compact" ? "px-6 py-2.5" : "px-6 py-4";

  // "Showing N of M columns" hint — surfaced when auto-fit is hiding some of the
  // chosen columns. Denominator is the *chosen* count so it matches the Columns
  // button and the full view.
  const shownDataColumns = table
    .getVisibleLeafColumns()
    .filter((c) => !isReservedColumnId(c.id)).length;
  const chosenDataColumns = autoFitIds.length;
  const columnsHint =
    managesColumns && chosenDataColumns > 0 && shownDataColumns < chosenDataColumns
      ? `Showing ${shownDataColumns} of ${chosenDataColumns} columns`
      : undefined;

  const allRows = table.getCoreRowModel().rows;

  const activePageIndex = serverPagination ? serverPagination.pageIndex : pageIndex;
  const activePageSize = serverPagination ? serverPagination.pageSize : clientPageSize;
  const totalRows = serverPagination ? serverPagination.totalCount : allRows.length;
  const totalPages = Math.ceil(totalRows / activePageSize);
  const paginatedRows = serverPagination
    ? allRows
    : allRows.slice(
        activePageIndex * activePageSize,
        (activePageIndex + 1) * activePageSize
      );

  const from = totalRows === 0 ? 0 : activePageIndex * activePageSize + 1;
  const to = Math.min((activePageIndex + 1) * activePageSize, totalRows);

  function handlePageChange(newIndex: number) {
    if (serverPagination) serverPagination.onPageChange(newIndex);
    else setPageIndex(newIndex);
  }

  function handlePageSizeChange(newSize: number) {
    if (serverPagination) {
      serverPagination.onPageSizeChange?.(newSize);
    } else {
      setClientPageSize(newSize);
      setPageIndex(0);
    }
  }

  const sizeOptions =
    pageSizeOptions === false
      ? null
      : pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const pageSizeSelectorVisible =
    sizeOptions != null &&
    sizeOptions.length > 0 &&
    (!serverPagination || serverPagination.onPageSizeChange != null);

  // Page numbers with ellipses, centred on the current page.
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    const current = activePageIndex + 1;
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [activePageIndex, totalPages]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white",
        className
      )}
    >
      <TableCardHeader
        title={title}
        action={action}
        onRefresh={onRefresh}
        onSearch={onSearch}
        showHeader={showHeader}
        showRefresh={showRefresh}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        filterControl={filterControl}
        showFullView={!!fullView}
        onOpenFullView={() => setFullViewOpen(true)}
        leadingInfo={
          columnsHint ? (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              {columnsHint}
              <span
                title="Columns that don't fit the current width are hidden automatically to avoid horizontal scrolling. Use “Columns” to choose or reorder them, or “Expand” to see them all."
                className="flex cursor-help items-center text-gray-400 transition-colors hover:text-gray-600"
              >
                <Info className="size-3.5" />
              </span>
            </span>
          ) : undefined
        }
        columnsControl={
          managesColumns && fullView ? (
            <ColumnManager
              manifest={fullView.manifest}
              order={prefs.order}
              hidden={prefs.hidden}
              autoHidden={autoHiddenIds}
              customized={prefs.customized}
              onReorder={prefs.setOrder}
              onToggle={prefs.toggle}
              onShowAll={prefs.showAll}
              onReset={prefs.reset}
            />
          ) : undefined
        }
      />

      <div ref={tableWrapperRef} className="relative">
        {isRefetching && !isLoading && (
          <div className="absolute top-0 right-0 left-0 z-10 h-0.5 overflow-hidden">
            <div className="h-full w-[35%] animate-pulse bg-purple-500" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-b border-gray-200 bg-gray-50"
              >
                {hg.headers.map((header) => {
                  const isAction = header.column.id === ACTIONS_COLUMN_ID;
                  const isSelect =
                    header.column.id === SELECT_COLUMN_ID ||
                    header.column.id === EXPANDER_COLUMN_ID;
                  const isPinned = header.column.id === pinnedColumnId;
                  return (
                    <TableHead
                      key={header.id}
                      data-col-id={header.column.id}
                      style={columnWidthStyle(header.column.columnDef)}
                      className={cn(
                        "h-11 px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase",
                        isSelect && RESERVED_CELL_CLASS,
                        isAction &&
                          "sticky right-0 z-10 border-l border-gray-200 bg-gray-50 px-2 text-center before:pointer-events-none before:absolute before:top-0 before:right-full before:bottom-0 before:w-4 before:bg-linear-to-l before:from-gray-900/8 before:to-transparent before:transition-opacity before:duration-200 before:content-['']",
                        isAction &&
                          (hasRightOverflow ? "before:opacity-100" : "before:opacity-0"),
                        isPinned &&
                          "sticky left-0 z-10 bg-gray-50 after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:left-full after:w-4 after:bg-linear-to-r after:from-gray-900/8 after:to-transparent after:transition-opacity after:duration-200 after:content-['']",
                        isPinned &&
                          (hasLeftShadow ? "after:opacity-100" : "after:opacity-0")
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows
                columns={table.getVisibleLeafColumns()}
                // Capped: a 100-row page size shouldn't paint 100 placeholders,
                // and a screenful is all the shape anyone reads.
                rowCount={Math.min(activePageSize, 12)}
                rowHeightClass={rowHeightClass}
                cellPaddingClass={cellPaddingClass}
              />
            ) : paginatedRows.length ? (
              paginatedRows.map((row) => {
                const rowId = getRowId?.(row.original);
                const isExpanded =
                  !!renderExpandedRow &&
                  rowId != null &&
                  !!expandedRowIds?.includes(rowId);
                return (
                  <Fragment key={row.id}>
                <TableRow
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    "group/row border-b border-gray-200 transition-colors hover:bg-gray-50",
                    rowHeightClass,
                    onRowClick &&
                      "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-600"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isAction = cell.column.id === ACTIONS_COLUMN_ID;
                    const isSelect =
                      cell.column.id === SELECT_COLUMN_ID ||
                      cell.column.id === EXPANDER_COLUMN_ID;
                    const isPinned = cell.column.id === pinnedColumnId;
                    return (
                      <TableCell
                        key={cell.id}
                        style={columnWidthStyle(cell.column.columnDef)}
                        // Ticking a checkbox or opening a row menu must not also
                        // fire the row's own click handler.
                        onClick={
                          isAction || isSelect
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                        className={cn(
                          cellPaddingClass,
                          "text-sm text-gray-700",
                          isSelect && RESERVED_CELL_CLASS,
                          isAction &&
                            "sticky right-0 z-10 border-l border-gray-200 bg-white px-2 text-center group-hover/row:bg-gray-50 before:pointer-events-none before:absolute before:top-0 before:right-full before:bottom-0 before:w-4 before:bg-linear-to-l before:from-gray-900/8 before:to-transparent before:transition-opacity before:duration-200 before:content-['']",
                          isAction &&
                            (hasRightOverflow
                              ? "before:opacity-100"
                              : "before:opacity-0"),
                          isPinned &&
                            "sticky left-0 z-10 bg-white group-hover/row:bg-gray-50 after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:left-full after:w-4 after:bg-linear-to-r after:from-gray-900/8 after:to-transparent after:transition-opacity after:duration-200 after:content-['']",
                          isPinned &&
                            (hasLeftShadow ? "after:opacity-100" : "after:opacity-0")
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-gray-50/60">
                        <TableCell
                          colSpan={table.getVisibleLeafColumns().length}
                          className="px-6 py-4 whitespace-normal"
                        >
                          {renderExpandedRow(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="p-0 text-center text-sm text-gray-500"
                >
                  {isError ? (
                    // Before the empty state, always: a failed load has no rows
                    // either, and the two are indistinguishable to the reader
                    // unless the error wins.
                    <TableErrorState
                      message={error ? normalizeError(error).message : undefined}
                      onRetry={onRefresh}
                    />
                  ) : typeof empty === "string" ? (
                    <TableEmptyState title={empty} description="" />
                  ) : (
                    empty ?? <TableEmptyState />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(isLoading || totalRows > 0) &&
        !(hidePaginationWhenSinglePage && !isLoading && totalPages <= 1) && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {isLoading ? (
                // The skeleton rows are aria-hidden, so this is what actually
                // announces the wait — keep the live region on it.
                <div
                  className="flex items-center gap-2 text-xs text-gray-400"
                  role="status"
                  aria-live="polite"
                >
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                  Loading...
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">{from}</span>–
                  <span className="font-semibold text-gray-700">{to}</span> of{" "}
                  <span className="font-semibold text-gray-700">{totalRows}</span>{" "}
                  {totalRows === 1 ? "result" : "results"}
                </p>
              )}
              {pageSizeSelectorVisible && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300" aria-hidden>
                    •
                  </span>
                  <label className="text-xs text-gray-500" htmlFor="rows-per-page">
                    Rows per page
                  </label>
                  <select
                    id="rows-per-page"
                    value={String(activePageSize)}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    disabled={isLoading}
                    className="h-8 cursor-pointer rounded-lg border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sizeOptions!.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary-gray"
                size="sm"
                onClick={() => handlePageChange(activePageIndex - 1)}
                disabled={isLoading || activePageIndex === 0}
              >
                Previous
              </Button>
              <div className="hidden items-center gap-1 sm:flex">
                {pageNumbers.map((page, i) =>
                  page === "..." ? (
                    <span key={`gap-${i}`} className="px-1.5 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      aria-current={
                        page === activePageIndex + 1 ? "page" : undefined
                      }
                      className={cn(
                        "size-9 cursor-pointer rounded-lg text-sm transition-colors",
                        page === activePageIndex + 1
                          ? "bg-purple-600 font-semibold text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <Button
                variant="secondary-gray"
                size="sm"
                onClick={() => handlePageChange(activePageIndex + 1)}
                disabled={isLoading || activePageIndex >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      {fullView && managesColumns && (
        <TableFullViewDialog
          open={fullViewOpen}
          onOpenChange={setFullViewOpen}
          data={data}
          config={fullView}
          serverPagination={serverPagination}
          onRowClick={onRowClick}
          onRefresh={onRefresh}
          isLoading={isLoading}
          isRefetching={isRefetching}
          isError={isError}
          error={error}
          prefs={prefs}
        />
      )}
    </div>
  );
}
