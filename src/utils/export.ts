import * as XLSX from "xlsx";

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param sheetName Name of the worksheet (optional, default "Sheet1")
 */
export const exportToExcel = (
  data: any[],
  filename: string,
  sheetName: string = "Sheet1",
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Exports data to a CSV file (.csv)
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = ("" + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
