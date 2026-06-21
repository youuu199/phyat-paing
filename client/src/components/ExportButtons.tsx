import { useCallback, useState } from 'react';
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
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const dashboard = document.querySelector('.dashboard') as HTMLElement | null;
      if (!dashboard) throw new Error('Dashboard not found');

      const canvas = await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('bills-dashboard.pdf');
      toast('PDF exported successfully', 'success');
    } catch {
      toast('Failed to export PDF', 'error');
    } finally {
      setExporting(false);
    }
  }, [toast]);

  return (
    <div className="export-buttons">
      <button
        className="export-buttons__btn"
        onClick={handleCSV}
        disabled={exporting}
        aria-label="Export bills as CSV"
      >
        📄 {exporting ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        className="export-buttons__btn"
        onClick={handlePDF}
        disabled={exporting}
        aria-label="Export dashboard as PDF"
      >
        📑 {exporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
}
