"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Columns3, EyeOff, GripVertical, RotateCcw, Search } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moveColumnTo } from "@/lib/table-column-prefs";

export type ColumnManifest = { key: string; label: string };

type ColumnManagerProps = {
  /** Label list for every data column (order-independent — the picker orders by `order`). */
  manifest: ColumnManifest[];
  /** Current data-column order (ids). */
  order: string[];
  /** Currently hidden data-column ids. */
  hidden: string[];
  /**
   * Ids the user has kept ON, but which auto-fit is currently dropping because
   * they don't fit the available width. Rendered as a muted eye-off marker, so
   * "checked" doesn't imply "on screen". Omit where auto-fit doesn't apply
   * (e.g. the full-view dialog, which shows every chosen column).
   */
  autoHidden?: string[];
  /** True when prefs differ from the declared default (enables "Reset"). */
  customized: boolean;
  onReorder: (order: string[]) => void;
  onToggle: (id: string) => void;
  onShowAll: () => void;
  onReset: () => void;
  /** Portal target — pass the enclosing dialog's content node when used in a modal. */
  container?: HTMLElement | null;
};

/**
 * "Columns" control: a popover for choosing which columns show and in what
 * order. Toggling a checkbox shows/hides a column; dragging the grip handle
 * reorders. A search box filters long column lists (reordering is disabled while
 * filtered, since dragging a partial list is ambiguous). Shared by the compact
 * `DataTable` toolbar and the full-view dialog, both driven by the same prefs.
 */
export function ColumnManager({
  manifest,
  order,
  hidden,
  autoHidden,
  customized,
  onReorder,
  onToggle,
  onShowAll,
  onReset,
  container,
}: ColumnManagerProps) {
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // Which edge of the hovered row the drop line sits on (from the cursor's
  // position within that row): true = insert above, false = insert below.
  const [overBefore, setOverBefore] = useState(true);

  const labelById = useMemo(
    () => new Map(manifest.map((c) => [c.key, c.label])),
    [manifest]
  );
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);
  const visibleCount =
    manifest.length - manifest.filter((c) => hiddenSet.has(c.key)).length;
  // Kept on by the user but dropped by auto-fit — "checked" is not the same as
  // "on screen", and without this the picker can't explain the discrepancy.
  const autoHiddenSet = useMemo(
    () => new Set((autoHidden ?? []).filter((id) => !hiddenSet.has(id))),
    [autoHidden, hiddenSet]
  );

  const orderedKeys = order.filter((id) => labelById.has(id));
  const q = query.trim().toLowerCase();
  const reorderable = q === "";
  const rows = reorderable
    ? orderedKeys
    : orderedKeys.filter((id) =>
        (labelById.get(id) ?? "").toLowerCase().includes(q)
      );

  // ─── Auto-scroll while dragging ─────────────────────────────────────────────
  // Native HTML5 drag doesn't scroll a container when the pointer reaches its
  // edge, which makes reordering into an off-screen position impossible.
  const listRef = useRef<HTMLDivElement>(null);
  const scrollSpeedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const EDGE_PX = 40;
  const MAX_SPEED = 14;

  function stopAutoScroll() {
    scrollSpeedRef.current = 0;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function runAutoScroll() {
    const el = listRef.current;
    if (el && scrollSpeedRef.current !== 0) el.scrollTop += scrollSpeedRef.current;
    rafRef.current = requestAnimationFrame(runAutoScroll);
  }

  // Keyed off pointer position, not scroll state, so a stationary pointer parked
  // in the hot zone keeps scrolling until it reaches the end.
  function updateAutoScroll(clientY: number) {
    const el = listRef.current;
    if (!el) return;
    const { top, bottom } = el.getBoundingClientRect();
    const fromTop = clientY - top;
    const fromBottom = bottom - clientY;

    if (fromTop < EDGE_PX) {
      scrollSpeedRef.current = -Math.ceil(
        MAX_SPEED * (1 - Math.max(fromTop, 0) / EDGE_PX)
      );
    } else if (fromBottom < EDGE_PX) {
      scrollSpeedRef.current = Math.ceil(
        MAX_SPEED * (1 - Math.max(fromBottom, 0) / EDGE_PX)
      );
    } else {
      scrollSpeedRef.current = 0;
    }

    if (scrollSpeedRef.current !== 0 && rafRef.current == null) {
      rafRef.current = requestAnimationFrame(runAutoScroll);
    }
  }

  // Guard against a drag ending outside the list (dragend can be missed if the
  // pointer leaves the window) leaving the loop running.
  useEffect(() => stopAutoScroll, []);

  function clearDrag() {
    setDragId(null);
    setOverId(null);
    stopAutoScroll();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary-gray"
          size="icon-md"
          aria-label="Columns"
          title={`Columns · ${visibleCount}/${manifest.length}`}
        >
          <Columns3 />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" container={container} className="w-72 p-0">
        <div className="border-b border-gray-200 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search columns"
              className="h-8 w-full rounded-lg border border-gray-300 pl-8 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-2 py-1.5">
          <button
            type="button"
            onClick={onShowAll}
            className="cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
          >
            Show all
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!customized}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
              customized
                ? "cursor-pointer text-gray-600 hover:bg-gray-50"
                : "cursor-not-allowed text-gray-300"
            )}
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div
          ref={listRef}
          onDragOver={(e) => {
            if (!reorderable || !dragId) return;
            // Rows also handle dragover (for the drop indicator); this fires via
            // bubbling and only drives the edge scroll.
            e.preventDefault();
            updateAutoScroll(e.clientY);
          }}
          onDragLeave={(e) => {
            // `dragleave` bubbles from the rows, and scrolling moves rows under a
            // stationary pointer — so only stop when the pointer genuinely exits.
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            stopAutoScroll();
          }}
          onDrop={stopAutoScroll}
          className="max-h-72 overflow-y-auto p-1"
        >
          {rows.map((id) => {
            const checked = !hiddenSet.has(id);
            const isLastVisible = checked && visibleCount <= 1;
            const isDragging = dragId === id;
            const isTarget =
              reorderable && dragId != null && overId === id && !isDragging;
            return (
              <div
                key={id}
                draggable={reorderable}
                onDragStart={(e) => {
                  if (!reorderable) return;
                  setDragId(id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={clearDrag}
                onDragOver={(e) => {
                  if (!reorderable || !dragId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  const before = e.clientY < rect.top + rect.height / 2;
                  if (overId !== id || overBefore !== before) {
                    setOverId(id);
                    setOverBefore(before);
                  }
                }}
                onDrop={(e) => {
                  if (!reorderable || !dragId) return;
                  e.preventDefault();
                  if (dragId !== id) {
                    onReorder(
                      moveColumnTo(order, dragId, id, overBefore ? "before" : "after")
                    );
                  }
                  clearDrag();
                }}
                className={cn(
                  "relative flex items-stretch gap-1.5 rounded-md py-2 pl-2 text-sm text-gray-700 transition-colors",
                  reorderable && "cursor-grab hover:bg-gray-50 active:cursor-grabbing",
                  isDragging && "opacity-40"
                )}
              >
                {isTarget && (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-purple-500",
                      "before:absolute before:top-1/2 before:left-0 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-purple-500 before:content-['']",
                      overBefore ? "-top-px" : "-bottom-px"
                    )}
                  />
                )}
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isLastVisible}
                    onChange={() => onToggle(id)}
                    className="size-4 cursor-pointer rounded border-2 border-gray-300 accent-purple-500 disabled:cursor-not-allowed"
                  />
                  <span className="line-clamp-1">{labelById.get(id)}</span>
                </label>
                {/* Status marker, not a control — the checkbox owns visibility. */}
                {autoHiddenSet.has(id) && (
                  <span
                    title="On, but doesn't fit at this width — open Expand to see it"
                    className="flex shrink-0 items-center text-gray-300"
                  >
                    <EyeOff aria-hidden className="size-3.5" />
                    <span className="sr-only">Not shown at this width</span>
                  </span>
                )}
                {/* Keyboard path for reordering — native HTML5 drag is mouse-only,
                    so the handle doubles as a focusable control. */}
                <span
                  role={reorderable ? "button" : undefined}
                  tabIndex={reorderable ? 0 : -1}
                  aria-label={
                    reorderable
                      ? `Reorder ${labelById.get(id)}. Press the up or down arrow key to move it.`
                      : undefined
                  }
                  aria-disabled={!reorderable}
                  onKeyDown={(e) => {
                    if (!reorderable) return;
                    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                    e.preventDefault();
                    const pos = order.indexOf(id);
                    const target = e.key === "ArrowUp" ? pos - 1 : pos + 1;
                    if (pos === -1 || target < 0 || target >= order.length) return;
                    onReorder(
                      moveColumnTo(
                        order,
                        id,
                        order[target],
                        e.key === "ArrowUp" ? "before" : "after"
                      )
                    );
                    // Keep focus on the moved row's handle so repeated presses
                    // continue to move the same column.
                    requestAnimationFrame(() => {
                      listRef.current
                        ?.querySelector<HTMLElement>(
                          `[data-grip-id="${CSS.escape(id)}"]`
                        )
                        ?.focus();
                    });
                  }}
                  data-grip-id={id}
                  className={cn(
                    "ml-1 flex shrink-0 items-center self-stretch border-l border-gray-100 px-1.5 transition-colors outline-none",
                    reorderable
                      ? "cursor-grab text-gray-300 hover:bg-gray-100 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset active:cursor-grabbing"
                      : "text-gray-200"
                  )}
                >
                  <GripVertical aria-hidden className="size-3.5" />
                </span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-gray-400">
              No columns match “{query}”.
            </div>
          )}
        </div>

        {!reorderable && (
          <div className="border-t border-gray-200 px-3 py-1.5 text-xs text-gray-400">
            Clear the search to reorder columns.
          </div>
        )}

        {autoHiddenSet.size > 0 && (
          <div className="flex items-start gap-1.5 border-t border-gray-200 px-3 py-2 text-xs text-gray-400">
            <EyeOff aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {`${autoHiddenSet.size} column${autoHiddenSet.size === 1 ? "" : "s"} won’t fit at this width. Reorder to prioritise, or use Expand.`}
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
