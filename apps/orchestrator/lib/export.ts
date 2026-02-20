/**
 * Export Utilities — Excel (.xlsx) and PDF generation
 * Professional formatted exports for mining operations reports
 */
import * as XLSX from 'xlsx';

// ============================================
// EXCEL EXPORT — Properly formatted .xlsx
// ============================================

interface ExcelSheet {
  name: string;
  title?: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  summaryRow?: (string | number | null | undefined)[];
  columnWidths?: number[];
}

export function exportExcel(filename: string, sheets: ExcelSheet[]) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const wsData: (string | number | null | undefined)[][] = [];

    // Title row
    if (sheet.title) {
      wsData.push([sheet.title]);
      if (sheet.subtitle) {
        wsData.push([sheet.subtitle]);
      }
      wsData.push([]); // blank row separator
    }

    // Header row
    wsData.push(sheet.headers);

    // Data rows
    for (const row of sheet.rows) {
      wsData.push(row);
    }

    // Summary/totals row
    if (sheet.summaryRow) {
      wsData.push([]); // blank separator
      wsData.push(sheet.summaryRow);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Calculate column widths
    const colWidths = sheet.columnWidths || sheet.headers.map((h, ci) => {
      let maxLen = h.length;
      for (const row of sheet.rows) {
        const val = row[ci];
        const len = val == null ? 0 : String(val).length;
        if (len > maxLen) maxLen = len;
      }
      return Math.min(Math.max(maxLen + 3, 8), 45);
    });
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // Merge title cell across all columns
    if (sheet.title) {
      const lastCol = sheet.headers.length - 1;
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } });
      if (sheet.subtitle) {
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } });
      }
    }

    // Sanitize sheet name (Excel has a 31-char limit and disallows some chars)
    const safeName = sheet.name.replace(/[\\/*?[\]:]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }

  // Write the file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${filename}.xlsx`);
}

// Single-sheet convenience function
export function exportSimpleExcel(filename: string, sheetName: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  exportExcel(filename, [{ name: sheetName, headers, rows }]);
}

// ============================================
// PDF EXPORT (HTML-based, print dialog)
// ============================================

interface PDFSection {
  title?: string;
  subtitle?: string;
  table?: { headers: string[]; rows: (string | number)[][]; highlightCol?: number };
  text?: string;
  alert?: { type: 'danger' | 'warning' | 'info'; text: string };
  stats?: { label: string; value: string | number; color?: string }[];
}

export function exportPDF(filename: string, docTitle: string, docSubtitle: string, sections: PDFSection[]) {
  const statsHTML = (stats: NonNullable<PDFSection['stats']>) => `
    <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap">
      ${stats.map(s => `
        <div style="flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;border-top:3px solid ${s.color || '#3b82f6'}">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:4px">${s.label}</div>
          <div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.03em">${s.value}</div>
        </div>
      `).join('')}
    </div>`;

  const tableHTML = (t: NonNullable<PDFSection['table']>) => `
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin:12px 0">
      <thead>
        <tr>${t.headers.map(h => `<th style="background:#f1f5f9;padding:8px 10px;text-align:left;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#475569;border-bottom:2px solid #e2e8f0;white-space:nowrap">${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${t.rows.map((row, ri) => `<tr style="background:${ri % 2 === 0 ? '#fff' : '#f8fafc'}">
          ${row.map((cell, ci) => `<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;${ci === t.highlightCol ? 'font-weight:700;color:#0f172a' : 'color:#334155'}">${cell}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>`;

  const alertHTML = (a: NonNullable<PDFSection['alert']>) => {
    const colors = { danger: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '🚨' }, warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '⚠️' }, info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: 'ℹ️' } };
    const c = colors[a.type];
    return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:8px;padding:12px 16px;color:${c.text};font-size:12px;margin:10px 0;line-height:1.5">${c.icon} ${a.text}</div>`;
  };

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${docTitle}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; line-height: 1.6; padding: 40px; max-width: 1100px; margin: 0 auto; }
      @media print { body { padding: 20px; } @page { size: A4 landscape; margin: 15mm; } }
    </style>
  </head><body>
    <div style="border-bottom:3px solid #3b82f6;padding-bottom:16px;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#0f172a">${docTitle}</h1>
          <p style="font-size:13px;color:#64748b;margin-top:4px">${docSubtitle}</p>
        </div>
        <div style="text-align:right;font-size:11px;color:#94a3b8">
          <div>IS-001 · Los Bronces Línea 3</div>
          <div>Generado: ${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style="margin-top:4px;font-weight:600;color:#3b82f6">The Orchestrator v1.0</div>
        </div>
      </div>
    </div>
    ${sections.map(s => `
      <div style="margin-bottom:24px">
        ${s.title ? `<h2 style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #e2e8f0">${s.title}</h2>` : ''}
        ${s.subtitle ? `<p style="font-size:12px;color:#64748b;margin-bottom:10px">${s.subtitle}</p>` : ''}
        ${s.stats ? statsHTML(s.stats) : ''}
        ${s.table ? tableHTML(s.table) : ''}
        ${s.text ? `<p style="font-size:13px;color:#334155;line-height:1.7">${s.text}</p>` : ''}
        ${s.alert ? alertHTML(s.alert) : ''}
      </div>
    `).join('')}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between">
      <span>© ${new Date().getFullYear()} The Orchestrator — IS-001 Mining Expansion Project</span>
      <span>Commissioning: 01 Agosto 2026</span>
    </div>
    <script>window.onload=()=>window.print();</script>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    downloadBlob(blob, `${filename}.html`);
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ============================================
// HELPER
// ============================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// FORMAT HELPERS
// ============================================

export const fmt = {
  clp: (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n),
  millions: (n: number) => `$${(n / 1e6).toFixed(1)}M`,
  billions: (n: number) => `$${(n / 1e9).toFixed(2)}B`,
  pct: (n: number) => `${n.toFixed(1)}%`,
  num: (n: number) => new Intl.NumberFormat('es-CL').format(n),
};
