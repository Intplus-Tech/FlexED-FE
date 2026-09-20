"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Minimize2, RotateCcw } from "lucide-react";

import { DataTable, type ServerPagination } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColumnManager, type ColumnManifest } from "@/components/ui/column-manager";
import type { TableColumnPrefs } from "@/hooks/use-table-column-prefs";

/**
 * Config for `DataTable`'s `fullView` prop. `columns` is the full column set
 * (a superset of what the compact table shows); `manifest` is the label list
 * the "Columns" picker renders from.
 */
export type TableFullViewConfig<TData> = {
  columns: ColumnDef<TData, unknown>[];
  manifest: ColumnManifest[];
  /** Dialog header title. Defaults to the table's own `title`. */
  title?: string;
  /**
   * Stable id for persisting column preferences (order + visibility) per user
   * in localStorage. Omit to keep prefs for the session only.
   */
  tableId?: string;
};

type TableFullViewDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TData[];
  config: TableFullViewConfig<TData>;
  serverPagination?: ServerPagination;
  onRowClick?: (row: TData) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefetching?: boolean;
  isError?: boolean;
  error?: unknown;
  /** Shared column preferences (order + visibility), owned by the compact table. */
  prefs: TableColumnPrefs;
};

/**
 * Maximized view of a table: the same rows as the compact `DataTable` it opens
 * from, but with a full-screen surface, its own toolbar, a frozen first column
 * for horizontal scrolling, and the *same* shared column preferences — reorder
 * or hide a column here and the compact table reflects it, and vice-versa. No
 * new data is fetched: `data`/`serverPagination` are the same values the compact
 * table holds, so paging here pages the same underlying query.
 */
export function TableFullViewDialog<TData extends object>({
  open,
  onOpenChange,
  data,
  config,
  serverPagination,
  onRowClick,
  onRefresh,
  isLoading,
  isRefetching,
  isError,
  error,
  prefs,
}: TableFullViewDialogProps<TData>) {
  // NB: the body is rendered unconditionally (no `{open && …}` gate). Radix
  // mounts the subtree only while open and runs its own close cleanup —
  // restoring <body> pointer-events and the scroll lock. Force-unmounting on
  // `open === false` skips that cleanup when the close comes from an external
  // state change, leaving the page non-interactive.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FullViewBody
        data={data}
        config={config}
        serverPagination={serverPagination}
        onRowClick={onRowClick}
        onRefresh={onRefresh}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isError={isError}
        error={error}
        prefs={prefs}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

function FullViewBody<TData extends object>({
  data,
  config,
  serverPagination,
  onRowClick,
  onRefresh,
  isLoading,
  isRefetching,
  isError,
  error,
  prefs,
  onClose,
}: Omit<TableFullViewDialogProps<TData>, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  // Portal target for the Columns popover — a node *inside* the dialog, so the
  // popover sits within the dialog's scroll-lock boundary and its list scrolls
  // (a body-portalled popover is blocked by the dialog's scroll lock).
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);

  return (
    <DialogContent
      className="flex h-[90vh] max-w-[95vw]! flex-col gap-0 overflow-hidden p-0"
      showCloseButton={false}
    >
      <div
        ref={(el) => setHeaderEl(el)}
        className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4"
      >
        <DialogTitle className="text-lg font-semibold text-gray-900">
          {config.title ?? "Full view"}
        </DialogTitle>
        {/* Radix requires a description (or explicit opt-out) on every dialog. */}
        <DialogDescription className="sr-only">
          Expanded, full-screen view of the {config.title ?? "table"} with all
          columns.
        </DialogDescription>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="secondary-gray"
              size="icon-md"
              onClick={onRefresh}
              aria-label="Refresh"
              title="Refresh"
            >
              <RotateCcw />
            </Button>
          )}
          <ColumnManager
            manifest={config.manifest}
            order={prefs.order}
            hidden={prefs.hidden}
            customized={prefs.customized}
            onReorder={prefs.setOrder}
            onToggle={prefs.toggle}
            onShowAll={prefs.showAll}
            onReset={prefs.reset}
            container={headerEl}
          />
          <Button
            variant="secondary-gray"
            size="icon-md"
            onClick={onClose}
            aria-label="Collapse"
            title="Collapse"
          >
            <Minimize2 />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable
          columns={config.columns}
          data={data}
          showHeader={false}
          serverPagination={serverPagination}
          columnVisibility={prefs.visibility}
          columnOrder={prefs.order}
          pinFirstColumn
          isLoading={isLoading}
          isRefetching={isRefetching}
          isError={isError}
          error={error}
          onRowClick={onRowClick}
          onRefresh={onRefresh}
          pageSize={25}
          className="rounded-none border-0"
        />
      </div>
    </DialogContent>
  );
}
