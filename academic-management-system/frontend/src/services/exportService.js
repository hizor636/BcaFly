import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Universal export utilities for BcaFly
 * Handles CSV, Excel (.xlsx), PDF tables, and print views.
 */

export function exportToCSV(filename, headers, rows) {
  const cleanStr = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const headerLine = headers.map(cleanStr).join(',');
  const rowLines = rows.map(r => r.map(cleanStr).join(','));
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headerLine, ...rowLines].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename, sheetName, headers, rows) {
  try {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Academic Ledger');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (err) {
    console.error('Failed to export Excel:', err);
    // Fallback to CSV
    exportToCSV(filename, headers, rows);
  }
}

export function exportToPDF(title, subtitle, headers, rows, filename = 'academic_report') {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    // Header styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(27, 42, 74); // ink color
    doc.text('BcaFly — BCA Academic Workspaces', 14, 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(184, 134, 59); // brass color
    doc.text(title, 14, 23);
    
    if (subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(91, 100, 120);
      doc.text(subtitle, 14, 29);
    }
    
    // Autotable
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: subtitle ? 33 : 27,
      theme: 'grid',
      headStyles: {
        fillColor: [27, 42, 74],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [27, 42, 74],
        lineColor: [217, 210, 190]
      },
      alternateRowStyles: {
        fillColor: [247, 244, 236]
      },
      margin: { left: 14, right: 14 }
    });
    
    doc.save(`${filename}.pdf`);
  } catch (err) {
    console.error('Failed to export PDF:', err);
  }
}

export function printElement() {
  window.print();
}
