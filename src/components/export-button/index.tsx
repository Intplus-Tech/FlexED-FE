"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ExportIcon } from "@/icon/dashbaord";
import { exportToExcel, exportToCSV } from "@/utils/export";

interface ExportButtonProps {
  data: any[];
  filename: string;
  sheetName?: string;
  className?: string;
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  sheetName = "Sheet1",
  className = "",
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type: "excel" | "csv") => {
    if (type === "excel") {
      exportToExcel(data, filename, sheetName);
    } else {
      exportToCSV(data, filename);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ExportIcon />
        Export
        <span
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
          <button
            onClick={() => handleExport("excel")}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
