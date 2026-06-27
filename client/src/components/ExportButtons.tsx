import { useCallback, useState } from 'react';
import { FileDown, FileText } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './Toast';

export default function ExportButtons() {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleCSV = useCallback(async () => {
    setExporting(true);
    try {
      const res = await apiFetch('/api/bills/export?format=csv');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bills-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('CSV exported successfully', 'success');
    } catch {
      toast('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  }, [apiFetch, toast]);

  const handlePDF = useCallback(async () => {
    setExporting(true);
    try {
      // Fetch bills from the API instead of DOM screenshot
      const res = await apiFetch('/api/bills?limit=200');
      if (!res.ok) throw new Error('Failed to fetch bills');
      const data = await res.json();
      const bills = data.bills || data;

      if (!bills.length) {
        toast('No bills to export', 'error');
        setExporting(false);
        return;
      }

      // Group bills by year-month (newest first)
      const grouped = new Map<string, any[]>();
      bills.forEach((bill: any) => {
        const d = bill.createdAt ? new Date(bill.createdAt) : new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "2026-06"
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(bill);
      });

      const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];

      const { default: jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 15;

      // Title
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Phyat Paing (ဖြတ်ပိုင်း) — Export', 14, y);
      y += 8;

      // Overall date
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Exported: ${new Date().toLocaleDateString()}`, 14, y);
      y += 10;

      // Iterate months (sorted newest first)
      const sortedKeys = [...grouped.keys()].sort().reverse();
      const headers = ['Title', 'Amount', 'Category', 'Date', 'Paid'];
      const colWidths = [60, 28, 30, 35, 22];
      const startX = 14;

      for (const key of sortedKeys) {
        const monthBills = grouped.get(key)!;
        const [yearStr, monthStr] = key.split('-');
        const monthLabel = `${MONTHS[parseInt(monthStr) - 1]} ${yearStr}`;
        const monthTotal = monthBills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);

        // Page break if not enough room (header + subtitle + table header + 3 rows)
        if (y > 245) {
          pdf.addPage();
          y = 15;
        }

        // Month section header
        pdf.setFillColor(241, 245, 249);
        pdf.rect(startX, y - 1, pageWidth - 28, 8, 'F');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        pdf.text(monthLabel, startX + 2, y + 4);
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${monthBills.length} bill${monthBills.length !== 1 ? 's' : ''} · ${monthTotal.toLocaleString()} MMK`, startX + 2 + pdf.getTextWidth(monthLabel) + 4, y + 4);
        y += 10;

        // Table header
        pdf.setFontSize(8);
        pdf.setFillColor(99, 102, 241);
        pdf.setTextColor(255, 255, 255);
        pdf.rect(startX, y, pageWidth - 28, 6, 'F');
        let hx = startX;
        headers.forEach((h, i) => {
          pdf.text(h, hx + 1, y + 4);
          hx += colWidths[i];
        });
        y += 8;

        // Rows for this month
        pdf.setTextColor(30, 41, 59);
        monthBills.forEach((bill: any, idx: number) => {
          if (y > 280) {
            pdf.addPage();
            y = 15;
          }

          if (idx % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(startX, y - 1, pageWidth - 28, 6, 'F');
          }

          hx = startX;
          const row = [
            bill.title?.substring(0, 35) || '-',
            bill.amount?.toLocaleString() || '0',
            bill.category || '-',
            bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-',
            bill.isPaid ? 'Yes' : 'No',
          ];
          row.forEach((cell, i) => {
            pdf.text(cell, hx + 1, y + 4);
            hx += colWidths[i];
          });
          y += 6;
        });

        y += 4; // gap between months
      }

      pdf.save('bills-export.pdf');
      toast('PDF exported successfully', 'success');
    } catch {
      toast('Failed to export PDF', 'error');
    } finally {
      setExporting(false);
    }
  }, [apiFetch, toast]);

  return (
    <div className="export-buttons">
      <button
        className="export-buttons__btn"
        onClick={handleCSV}
        disabled={exporting}
        aria-label="Export bills as CSV"
      >
        <FileText size={14} strokeWidth={1.75} />
        {exporting ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        className="export-buttons__btn"
        onClick={handlePDF}
        disabled={exporting}
        aria-label="Export bills as PDF"
      >
        <FileDown size={14} strokeWidth={1.75} />
        {exporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
}
