import * as XLSX from "xlsx";

export function downloadTemplate(headers: string[], sampleRow: (string | number)[], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Templat");
  XLSX.writeFile(wb, filename);
}

export function parseUploadedFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca fail"));
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        resolve(rows);
      } catch {
        reject(new Error("Format fail tidak sah"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export type BulkUploadResult = { success: number; errors: { row: number; message: string }[] };
