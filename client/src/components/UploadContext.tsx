import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './Toast';

type UploadStage = 'idle' | 'uploading' | 'ocr' | 'ai' | 'done' | 'error';

interface UploadJob {
  id: string;
  fileName: string;
  preview: string;
  stage: UploadStage;
  error: string;
  billId?: string;
}

interface UploadContextValue {
  jobs: UploadJob[];
  upload: (file: File) => void;
  clearDone: () => void;
  removeJob: (id: string) => void;
  lastUploadTime: number;
}

// Global event for bill list refresh after upload
let billRefreshListeners: Array<() => void> = [];
export function onBillUpload(callback: () => void) {
  billRefreshListeners.push(callback);
  return () => {
    billRefreshListeners = billRefreshListeners.filter((fn) => fn !== callback);
  };
}
function notifyBillUpload() {
  billRefreshListeners.forEach((fn) => fn());
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}

let nextJobId = 0;

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [lastUploadTime, setLastUploadTime] = useState(0);
  // Use ref to track jobs so background callbacks can read latest state
  const jobsRef = useRef<UploadJob[]>([]);
  jobsRef.current = jobs;

  const updateJob = useCallback((id: string, updates: Partial<UploadJob>) => {
    setJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
      jobsRef.current = next;
      return next;
    });
  }, []);

  const upload = useCallback(
    async (file: File) => {
      const id = `upload-${nextJobId++}`;
      const preview = URL.createObjectURL(file);

      const job: UploadJob = {
        id,
        fileName: file.name,
        preview,
        stage: 'uploading',
        error: '',
      };

      setJobs((prev) => {
        const next = [...prev, job];
        jobsRef.current = next;
        return next;
      });

      // Fire-and-forget — runs independently of any component
      (async () => {
        try {
          const formData = new FormData();
          formData.append('image', file);

          const res = await apiFetch('/api/v1/bills', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Upload failed');
          }

          const bill = await res.json();
          updateJob(id, { stage: 'ocr', billId: bill._id || bill.billId });

          // Backend does full pipeline (upload → OCR → AI → save) in one request
          // Show intermediate stages for UX
          await new Promise((r) => setTimeout(r, 800));
          updateJob(id, { stage: 'ai' });
          await new Promise((r) => setTimeout(r, 800));
          updateJob(id, { stage: 'done' });
          setLastUploadTime(Date.now());
          notifyBillUpload();

          toast(`✓ ${file.name} uploaded successfully`, 'success');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          updateJob(id, { stage: 'error', error: msg });
          toast(`✗ ${file.name}: ${msg}`, 'error');
        }
      })();
    },
    [apiFetch, toast, updateJob]
  );

  const clearDone = useCallback(() => {
    setJobs((prev) => {
      const next = prev.filter((j) => j.stage !== 'done' && j.stage !== 'error');
      jobsRef.current = next;
      return next;
    });
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      jobsRef.current = next;
      return next;
    });
  }, []);

  return (
    <UploadContext.Provider value={{ jobs, upload, clearDone, removeJob, lastUploadTime }}>
      {children}
    </UploadContext.Provider>
  );
}
