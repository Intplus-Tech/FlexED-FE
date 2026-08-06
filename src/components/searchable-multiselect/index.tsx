"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableMultiSelectProps {
  options: SearchableMultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  isLoading = false,
  disabled = false,
  emptyMessage = "No options found",
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      option.subLabel?.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  );

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full min-h-[46px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50",
        )}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-sm text-gray-400 px-1">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md"
              >
                {option.label}
                <X
                  size={13}
                  className="hover:text-purple-900 cursor-pointer"
                  onClick={(e) => removeValue(option.value, e)}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-gray-400 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = selected.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleValue(option.value)}
                      className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer accent-purple-500"
                    />
                    <span className="text-sm text-gray-900 truncate">
                      {option.label}
                      {option.subLabel && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          &middot; {option.subLabel}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
