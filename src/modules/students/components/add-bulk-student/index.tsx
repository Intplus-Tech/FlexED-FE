"use client";

import { ClassItem } from "@/@types/class";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useDowloadStudentCSVFormatMutation,
  useUploadBulkStudentMutation,
} from "@/redux/api/student";
import { showsuccess } from "@/utils/toast";
import type React from "react";
import { useState, useRef, useEffect } from "react";

interface StudentDataModalProps {
  isbulkModalOpen: boolean;
  setIsBulkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  classItems: ClassItem[];
  isClassLoading: boolean;
}

export default function AddBulkStudentModal({
  isbulkModalOpen,
  setIsBulkModalOpen,
  isClassLoading,
  classItems,
}: StudentDataModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classId, setClassId] = useState("");
  const [downloadData, setdownloadData] = useState<Blob | null>(null);
  const [dowloadStudentCSVFormat, { isLoading, isSuccess }] =
    useDowloadStudentCSVFormatMutation();

  const [uploadBulkStudent, { isLoading: isUploading }] =
    useUploadBulkStudentMutation();

  useEffect(() => {
    if (isSuccess && downloadData) {
      const url = window.URL.createObjectURL(downloadData);

      const link = document.createElement("a");

      link.href = url;

      link.download = "bulk-upload-template.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    }
  }, [isSuccess, downloadData]);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (
        droppedFile.type === "text/csv" ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      data.push(row);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    console.log(file, "file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadBulkStudent({ classId, file: formData }).unwrap();
      showsuccess(res.message)
      setIsBulkModalOpen(false)
    } catch (error) {
      console.log(error);
    }

  };

  const handleClear = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDowloadCsVFormat = async () => {
    try {
      const res = await dowloadStudentCSVFormat().unwrap();
      setdownloadData(res);
      console.log(res, "downloaded");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={isbulkModalOpen} onOpenChange={setIsBulkModalOpen}>
      <DialogContent className="max-w-3xl! w-[90%] max-h-[95vh] overflow-y-auto border-none">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Import Student Data
            </h2>
            <p className="text-muted-foreground mt-1">
              Follow these steps to upload bulk your student roster.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Download template here</span>
                <button
                  onClick={handleDowloadCsVFormat}
                  className="ml-4 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm font-medium"
                >
                  {isLoading ? "Downloading..." : "Download Excel Template"}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">
                  Populate your student&apos;s information
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Save As and select CSV</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30">
                <span className="text-sm font-semibold">4</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Upload the file and Save</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              Upload your file Below
            </h3>

            <div className="my-4">
              <label className="block mb-1 font-medium">Class</label>
              {isClassLoading ? (
                <div className="h-10 w-full bg-gray-200 animate-pulse"></div>
              ) : (
                <select
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-2 border border-purple-200 rounded outline-none focus:border-purple-400"
                >
                  {classItems?.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${isDragging
                ? "border-primary bg-primary/5"
                : "border-purple-300 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-950/10"
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-2">
                <div className="text-3xl text-purple-400">+</div>
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Click to browse or drag your .CSV file here
                </button>
                <p className="text-sm text-muted-foreground italic">
                  (File format restricted to .CSV)
                </p>
                {file && (
                  <p className="text-sm text-foreground font-medium mt-3">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleUpload}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex-1 sm:flex-none"
            >
              Upload & Save
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2.5 bg-transparent hover:bg-muted text-foreground rounded-lg transition-colors font-medium border border-border"
            >
              Clear
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
