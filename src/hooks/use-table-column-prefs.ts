"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  isCustomized,
  reconcilePrefs,
  visibilityFromHidden,
  type ColumnPrefs,
} from "@/lib/table-column-prefs";

const STORAGE_PREFIX = "flexedu.table.layout.";

export type TableColumnPrefs = {
  /** Data-column ids in display order (actions column excluded). */
  order: string[];
  /** Data-column ids the user has hidden. */
  hidden: string[];
  /** VisibilityState derived from `hidden` (each hidden id → false). */
  visibility: ReturnType<typeof visibilityFromHidden>;
  /** True when order/visibility differ from the declared default. */
  customized: boolean;
  /** Replace the column order (from the reorder picker). */
  setOrder: (order: string[]) => void;
  /** Toggle a column's visibility. Refuses to hide the last visible column. */
  toggle: (id: string) => void;
  /** Un-hide every column (order unchanged). */
  showAll: () => void;
  /** Restore declared order and full visibility. */
  reset: () => void;
};

const EMPTY: ColumnPrefs = { order: [], hidden: [] };

function read(storageKey: string): ColumnPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ColumnPrefs>;
    return {
      order: Array.isArray(parsed.order) ? parsed.order : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Column display preferences (order + visibility) for one table.
 *
 * Persisted to localStorage under the table's `storageKey` so a user's layout
 * survives navigation and reloads; tables without a key keep theirs for the
 * session only. Stored values are reconciled against the live column set on
 * every render, so a column that was renamed or removed in a release doesn't
 * strand the user with a layout referencing ids that no longer exist.
 *
 * Reads are deferred to an effect rather than done during render: the first
 * client render has to match the server's HTML, and localStorage isn't there.
 */
export function useTableColumnPrefs({
  storageKey,
  allIds,
}: {
  storageKey?: string;
  allIds: string[];
}): TableColumnPrefs {
  const [raw, setRaw] = useState<ColumnPrefs>(EMPTY);

  useEffect(() => {
    if (!storageKey) return;
    setRaw(read(storageKey));
  }, [storageKey]);

  const allIdsSig = allIds.join("|");
  const prefs = useMemo(
    () => reconcilePrefs(raw, allIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [raw, allIdsSig]
  );
  const visibility = useMemo(
    () => visibilityFromHidden(prefs.hidden),
    [prefs.hidden]
  );
  const customized = useMemo(
    () => isCustomized(prefs, allIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs, allIdsSig]
  );

  // Persist only genuinely-customized layouts; a revert-to-default drops the
  // entry, so stale keys don't accumulate and a later change to the declared
  // column set isn't fought by a stored copy of the old default.
  const write = useCallback(
    (patch: Partial<ColumnPrefs>) => {
      const next: ColumnPrefs = {
        order: patch.order ?? prefs.order,
        hidden: patch.hidden ?? prefs.hidden,
      };
      setRaw(next);
      if (!storageKey) return;
      try {
        if (isCustomized(next, allIds)) {
          window.localStorage.setItem(
            STORAGE_PREFIX + storageKey,
            JSON.stringify(next)
          );
        } else {
          window.localStorage.removeItem(STORAGE_PREFIX + storageKey);
        }
      } catch {
        // Private mode / storage disabled — the layout just won't outlive the session.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey, allIdsSig, prefs.order, prefs.hidden]
  );

  const setOrder = useCallback((order: string[]) => write({ order }), [write]);

  const toggle = useCallback(
    (id: string) => {
      const isHidden = prefs.hidden.includes(id);
      if (!isHidden) {
        const visibleCount = allIds.length - prefs.hidden.length;
        if (visibleCount <= 1) return; // floor: never hide the last visible column
        write({ hidden: [...prefs.hidden, id] });
      } else {
        write({ hidden: prefs.hidden.filter((x) => x !== id) });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [write, prefs.hidden, allIdsSig]
  );

  const showAll = useCallback(() => write({ hidden: [] }), [write]);

  const reset = useCallback(() => {
    setRaw(EMPTY);
    if (!storageKey) return;
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + storageKey);
    } catch {
      // ignored — see write()
    }
  }, [storageKey]);

  return {
    order: prefs.order,
    hidden: prefs.hidden,
    visibility,
    customized,
    setOrder,
    toggle,
    showAll,
    reset,
  };
}
