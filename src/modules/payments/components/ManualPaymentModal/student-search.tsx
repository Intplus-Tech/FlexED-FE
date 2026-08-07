"use client";

import { useEffect, useRef, useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { Student } from "@/@types/student";

interface StudentSearchProps {
  students: Student[];
  isLoading: boolean;
  selectedStudentId: string | null;
  getClassName: (classId: string) => string;
  onSelect: (studentId: string) => void;
}

export function StudentSearch({
  students,
  isLoading,
  selectedStudentId,
  getClassName,
  onSelect,
}: StudentSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = query
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : students.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Student"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading students...
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <button
                key={student._id}
                type="button"
                onClick={() => {
                  onSelect(student._id);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-0 border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.admissionNumber} • {getClassName(student.class)}
                    </p>
                  </div>
                </div>
                {selectedStudentId === student._id && (
                  <CheckCircle2 className="size-5 text-purple-600" />
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No students found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
