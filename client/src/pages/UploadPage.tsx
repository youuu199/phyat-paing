import { useCallback, useState } from 'react';
import {
  CloudUpload,
  FileImage,
  Upload,
  X,
} from 'lucide-react';
import { useUpload } from '../components/UploadContext';

export default function UploadPage() {
  const { upload, jobs, removeJob } = useUpload();
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      upload(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      files.forEach(handleFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const recentJobs = jobs.slice(-5).reverse();

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 gap-5 sm:gap-6">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
          Upload Bill
        </h1>
        <span className="text-[12px] sm:text-[13px] text-text-secondary">
          Upload a bill image and AI will extract the details — uploads continue in the background
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 flex-1">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`flex flex-col items-center justify-center flex-1 rounded-2xl border-2 border-dashed gap-3 sm:gap-4 cursor-pointer transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-primary-light bg-bg-card hover:bg-bg'
          } ${dragging ? 'py-12 sm:py-16' : 'py-10 sm:py-16'}`}
        >
          <CloudUpload className={`w-12 h-12 sm:w-14 sm:h-14 ${dragging ? 'text-primary' : 'text-primary-light'}`} />
          <span className="font-heading text-base sm:text-lg font-semibold text-text-primary text-center px-4">
            Drag & drop your bill images here
          </span>
          <span className="text-[12px] sm:text-[13px] text-text-secondary text-center px-4">
            Supports JPG, PNG, WebP · Max 10MB each · Upload multiple files
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-text-muted">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            Drag & drop anywhere above, or click "Browse Files" to select
          </span>
          <div className="flex items-center gap-2 h-10 sm:h-11 px-5 rounded-lg border border-primary bg-bg-card">
            <FileImage className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-medium text-primary">
              Browse Files
            </span>
          </div>
          <span className="text-[11px] text-text-muted">
            English & Myanmar (Burmese) text supported
          </span>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(handleFile);
              e.target.value = '';
            }}
          />
        </div>

        {/* Recent Uploads + Tips — stacks below on mobile */}
        <div className="w-full sm:w-[380px] lg:w-[420px] flex flex-col gap-4 sm:gap-5 shrink-0">
          <div className="bg-bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
            <span className="font-heading text-[14px] sm:text-[15px] font-semibold text-text-primary">
              Recent Uploads
            </span>
            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center py-6 sm:py-8 text-text-muted">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">No uploads yet</span>
                <span className="text-[11px] mt-1">Drop an image to get started</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-2.5">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-2.5 sm:p-3 bg-bg rounded-lg"
                  >
                    {job.preview ? (
                      <img
                        src={job.preview}
                        alt={job.fileName}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4 text-text-muted" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[12px] sm:text-[13px] font-medium text-text-primary truncate">
                        {job.fileName}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-text-secondary">
                        {job.stage === 'uploading' && 'Uploading...'}
                        {job.stage === 'ocr' && 'Extracting text...'}
                        {job.stage === 'ai' && 'Classifying...'}
                        {job.stage === 'done' && (
                          <span className="text-success">✓ Bill created</span>
                        )}
                        {job.stage === 'error' && (
                          <span className="text-danger">✗ {job.error}</span>
                        )}
                      </span>
                    </div>
                    {(job.stage === 'uploading' || job.stage === 'ocr' || job.stage === 'ai') && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    {job.stage === 'done' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <button
                      onClick={() => removeJob(job.id)}
                      className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-bg-card transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-3">
            <span className="font-heading text-[14px] sm:text-[15px] font-semibold text-text-primary">
              Tips
            </span>
            <div className="flex flex-col gap-2">
              {[
                'Upload multiple bills at once — they process in parallel',
                'Navigate away freely — uploads continue in the background',
                'You\'ll get a toast notification when each upload completes',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-[11px] sm:text-[12px] text-text-secondary">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
