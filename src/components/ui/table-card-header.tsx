"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, RotateCcw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TableCardHeaderProps = {
  title?: string;
  action?: React.ReactNode;
  onRefresh?: () => void;
  onSearch?: (term: string) => void;
  /** Explicitly show/hide the header. Auto-derived when omitted. */
  showHeader?: boolean;
  /** Defaults to `!!onRefresh`. */
  showRefresh?: boolean;
  /** Defaults to `!!onSearch`. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  /**
   * Optional content for the left side of the header (under the title) —
   * `DataTable` uses it for the "Showing N of M columns" auto-fit hint.
   */
  leadingInfo?: React.ReactNode;
  /** When true, shows an "Expand" icon that calls `onOpenFullView`. */
  showFullView?: boolean;
  onOpenFullView?: () => void;
  /** Toolbar slot for the "Columns" manager. */
  columnsControl?: React.ReactNode;
  /** Toolbar slot for filter controls the page owns (e.g. a status select). */
  filterControl?: React.ReactNode;
};

/**
 * Shared card-header chrome — title, search, refresh, columns, expand — so
 * every table shell looks and behaves the same without each page rebuilding it.
 */
export function TableCardHeader({
  title,
  action,
  onRefresh,
  onSearch,
  showHeader,
  showRefresh,
  showSearch,
  searchPlaceholder = "Search...",
  leadingInfo,
  showFullView = false,
  onOpenFullView,
  columnsControl,
  filterControl,
}: TableCardHeaderProps) {
  const refreshVisible = showRefresh ?? onRefresh != null;
  const searchVisible = showSearch ?? onSearch != null;
  const headerHasContent =
    !!title ||
    !!action ||
    refreshVisible ||
    searchVisible ||
    showFullView ||
    columnsControl != null ||
    filterControl != null ||
    leadingInfo != null;
  const headerVisible = showHeader ?? headerHasContent;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The debounce is the lazy path: stop typing and the search runs on its own.
  // Enter is the deliberate one and must not wait — see submitSearch.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearchOpen) onSearch?.(searchValue);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  function openSearch() {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function submitSearch() {
    setIsSearchOpen(true);
    onSearch?.(searchValue);
  }

  function closeSearch() {
    setIsSearchOpen(false);
    if (searchValue) onSearch?.("");
    setSearchValue("");
  }

  if (!headerVisible) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
      {title || leadingInfo != null ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {leadingInfo}
        </div>
      ) : (
        <div />
      )}
      <div className="flex h-10 items-center gap-2">
        {action && <div>{action}</div>}
        {filterControl}
        {searchVisible && (
          <div
            className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xs transition-[width] duration-300 ease-in-out"
            style={{
              width: isSearchOpen ? "13rem" : "2.5rem",
              height: 40,
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
                if (e.key === "Enter") {
                  // The header can sit inside page-level forms; without this the
                  // key would submit the form instead of running the search.
                  e.preventDefault();
                  submitSearch();
                }
              }}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400",
                "transition-opacity duration-150",
                isSearchOpen ? "pl-3 opacity-100" : "pointer-events-none pl-0 opacity-0"
              )}
            />
            <button
              type="button"
              aria-label={isSearchOpen ? "Close search" : "Search"}
              className={cn(
                "flex h-full shrink-0 cursor-pointer items-center justify-center text-gray-700 transition-colors hover:bg-gray-50",
                isSearchOpen ? "w-10" : "w-full"
              )}
              onClick={() => (isSearchOpen ? closeSearch() : openSearch())}
            >
              {isSearchOpen ? <X size={15} /> : <Search size={15} />}
            </button>
          </div>
        )}
        {refreshVisible && (
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
        {columnsControl}
        {showFullView && (
          <Button
            variant="secondary-gray"
            size="icon-md"
            onClick={onOpenFullView}
            aria-label="Expand"
            title="Expand"
          >
            <Maximize2 />
          </Button>
        )}
      </div>
    </div>
  );
}
