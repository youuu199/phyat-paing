import { useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from '../i18n/useTranslation';
import './BillUploader.css';

interface BillUploaderProps {
  onUploadSuccess: () => void;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'classifying';

const STAGE_KEYS: Record<UploadStage, string> = {
  idle: 'uploader.upload',
  uploading: 'uploader.stageUploading',
  processing: 'uploader.stageProcessing',
  classifying: 'uploader.stageClassifying',
};

export default function BillUploader({ onUploadSuccess }: BillUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { apiFetch } = useAuth();
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t('uploader.selectFirst'));
      return;
    }

    setStage('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate stage progression (actual stages happen server-side)
      const stageTimer1 = setTimeout(() => setStage('processing'), 2000);
      const stageTimer2 = setTimeout(() => setStage('classifying'), 8000);

      const res = await apiFetch('/api/bills', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (!res.ok) {
        const text = await res.text();
        let message = `Upload failed (${res.status})`;
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          // non-JSON response — use status message
        }
        throw new Error(message);
      }

      const bill = await res.json();
      console.log('✓ Upload complete:', bill.title, '|', bill.amount, 'MMK |', bill.category);

      // Reset form
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';

      // Tell parent to refresh
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploader.uploadFailed'));
    } finally {
      setStage('idle');
    }
  };

  // Drag-and-drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false when leaving the uploader, not entering a child
    if (e.currentTarget === e.target) {
      setDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setError(null);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!dropped.type.startsWith('image/')) {
      setError(t('uploader.dropImage'));
      return;
    }

    setFile(dropped);

    // Update the hidden file input so it stays in sync
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      inputRef.current.files = dt.files;
    }
  }, []);

  const isUploading = stage !== 'idle';

  return (
    <div
      className={`bill-uploader${dragOver ? ' bill-uploader--dragover' : ''}${file && !isUploading ? ' bill-uploader--has-file' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="region"
      aria-label="Bill upload area"
    >
      <span className="bill-uploader__icon" aria-hidden="true">
        {isUploading ? '⏳' : file ? '📄' : '📤'}
      </span>

      <h2>{isUploading ? t('uploader.processing') : t('uploader.title')}</h2>

      {!isUploading && (
        <p className="bill-uploader__hint">
          {t('uploader.hint')}
        </p>
      )}

      {isUploading && (
        <p className="bill-uploader__stage">
          {t(STAGE_KEYS[stage])}
        </p>
      )}

      <div className="bill-uploader__controls">
        <input
          ref={inputRef}
          className="bill-uploader__file-input"
          id="bill-file-input"
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label
          className="bill-uploader__file-label"
          htmlFor="bill-file-input"
        >
          📁 {t('uploader.chooseFile')}
        </label>

        <button
          className={`bill-uploader__button${isUploading ? ' bill-uploader__button--uploading' : ''}`}
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? t(STAGE_KEYS[stage]) : `🚀 ${t('uploader.upload')}`}
        </button>
      </div>

      {file && !isUploading && (
        <p className="bill-uploader__selected">
          <span className="bill-uploader__selected-pill">
            ✅ {file.name}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </p>
      )}

      {dragOver && (
        <p className="bill-uploader__drop-hint">{t('uploader.dropHere')}</p>
      )}

      {error && (
        <p className="bill-uploader__error" role="alert">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
