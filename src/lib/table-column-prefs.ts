import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

/** Id of the sticky row-actions column — always kept last and never reordered/hidden. */
export const ACTIONS_COLUMN_ID = "actions";

/** Id of the row-selection checkbox column — always kept first and never reordered/hidden. */
export const SELECT_COLUMN_ID = "select";

/** Id of the expand/collapse chevron column — pinned ahead of everything else. */
export const EXPANDER_COLUMN_ID = "expander";

/** Columns the user never orders or hides: they're structural, not data. */
export function isReservedColumnId(id: string | undefined): boolean {
  return (
    id === ACTIONS_COLUMN_ID ||
    id === SELECT_COLUMN_ID ||
    id === EXPANDER_COLUMN_ID
  );
}

/**
 * A table's user column preferences: the display order of the data columns and
 * which of them are hidden. Persisted per table and shared between the compact
 * table and its full-view dialog. The sticky actions column is excluded from
 * both lists (it's pinned last and always visible).
 */
export type ColumnPrefs = {
  order: string[];
  hidden: string[];
};

/**
 * The id TanStack will resolve a column to: its explicit `id`, else its
 * `accessorKey`. Hand-written `ColumnDef`s often set only `accessorKey`, and
 * reading `id` alone would treat those columns as unidentified — which
 * `applyColumnOrder` would then shunt to the end of the table, and auto-fit
 * would leave out of its width budget entirely.
 */
export function columnIdOf<TData>(
  column: ColumnDef<TData, unknown>
): string | undefined {
  if (column.id) return column.id;
  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;
  return typeof accessorKey === "string" ? accessorKey : undefined;
}

/** Data-column ids of a column set, in declared order, excluding reserved columns. */
export function dataColumnIdsOf<TData>(
  columns: ColumnDef<TData, unknown>[]
): string[] {
  return columns
    .map(columnIdOf)
    .filter((id): id is string => !!id && !isReservedColumnId(id));
}

/**
 * Reorder a column set by `order` (a list of data-column ids). The expander and
 * selection columns, if present, are always first; ids in `order` follow;
 * any columns not named in `order` (e.g. newly added) keep their declared order
 * after them; the actions column, if present, is always last. Unknown ids in
 * `order` are ignored.
 */
export function applyColumnOrder<TData>(
  columns: ColumnDef<TData, unknown>[],
  order: string[]
): ColumnDef<TData, unknown>[] {
  const byId = new Map(columns.map((c) => [columnIdOf(c), c]));
  const seen = new Set<string>();
  const out: ColumnDef<TData, unknown>[] = [];
  for (const reserved of [EXPANDER_COLUMN_ID, SELECT_COLUMN_ID]) {
    const col = columns.find((c) => columnIdOf(c) === reserved);
    if (col) out.push(col);
  }
  for (const id of order) {
    if (isReservedColumnId(id) || seen.has(id)) continue;
    const col = byId.get(id);
    if (col) {
      out.push(col);
      seen.add(id);
    }
  }
  for (const col of columns) {
    const id = columnIdOf(col);
    if (isReservedColumnId(id) || (id && seen.has(id))) continue;
    out.push(col);
    if (id) seen.add(id);
  }
  const actions = columns.find((c) => columnIdOf(c) === ACTIONS_COLUMN_ID);
  if (actions) out.push(actions);
  return out;
}

/**
 * Decide which of `orderedIds` fit in `available` px, given measured column
 * widths, and return a VisibilityState hiding the rest.
 *
 * The visible set is always a **contiguous prefix**: the first column that
 * doesn't fit ends the run, and everything after it is hidden even if it would
 * individually fit the leftover space. Packing the row instead would break the
 * contract that declaration order is priority, and would make the rendered
 * columns disagree with the order shown in the column picker.
 *
 * `actionsWidth` is reserved up front for the sticky row-actions column, which
 * is never hidden. At least one data column is always kept, even if it alone
 * overflows — an empty table is worse than a clipped one.
 */
export function computeAutoFitVisibility(
  orderedIds: string[],
  widths: Map<string, number>,
  available: number,
  actionsWidth = 0
): VisibilityState {
  let used = actionsWidth;
  let shown = 0;
  let cutOff = false;
  const hidden: VisibilityState = {};
  for (const id of orderedIds) {
    const width = widths.get(id) ?? 0;
    if (!cutOff && (shown === 0 || used + width <= available)) {
      used += width;
      shown += 1;
    } else {
      cutOff = true;
      hidden[id] = false;
    }
  }
  return hidden;
}

/** VisibilityState marking each id in `hidden` as `false` (all others visible). */
export function visibilityFromHidden(hidden: string[]): VisibilityState {
  return Object.fromEntries(hidden.map((id) => [id, false]));
}

/**
 * Move `dragId` to just before / just after `targetId` (pure). Returns the
 * original array unchanged when the ids are equal or `targetId` isn't present.
 */
export function moveColumnTo(
  order: string[],
  dragId: string,
  targetId: string,
  position: "before" | "after"
): string[] {
  if (dragId === targetId) return order;
  const without = order.filter((id) => id !== dragId);
  let idx = without.indexOf(targetId);
  if (idx === -1) return order;
  if (position === "after") idx += 1;
  return [...without.slice(0, idx), dragId, ...without.slice(idx)];
}

/** Whether prefs differ from the declared default — drives the "Reset" affordance. */
export function isCustomized(
  prefs: ColumnPrefs,
  declaredOrder: string[]
): boolean {
  if (prefs.hidden.length > 0) return true;
  if (prefs.order.length !== declaredOrder.length) return true;
  return prefs.order.some((id, i) => id !== declaredOrder[i]);
}

/**
 * Reconcile stored prefs against the current column set: drop ids that no longer
 * exist, append newly added columns (visible, at the end), and keep only valid
 * hidden ids. Guarantees `order` is exactly the current data-column id set.
 */
export function reconcilePrefs(
  stored: ColumnPrefs,
  declaredOrder: string[]
): ColumnPrefs {
  const valid = new Set(declaredOrder);
  const order = stored.order.filter((id) => valid.has(id));
  const inOrder = new Set(order);
  for (const id of declaredOrder) if (!inOrder.has(id)) order.push(id);
  const hidden = stored.hidden.filter((id) => valid.has(id));
  return { order, hidden };
}
