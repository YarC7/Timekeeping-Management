export type ExportFormat = "csv" | "json";

export function downloadBlob(
  content: BlobPart,
  filename: string,
  type: string,
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function toCSV<T extends Record<string, any>>(rows: T[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    const s = String(val ?? "");
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export function exportData<T extends Record<string, any>>(
  rows: T[],
  filename: string,
  format: ExportFormat,
) {
  if (format === "json") {
    return downloadBlob(
      JSON.stringify(rows, null, 2),
      `${filename}.json`,
      "application/json",
    );
  }
  const csv = toCSV(rows);
  return downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}
