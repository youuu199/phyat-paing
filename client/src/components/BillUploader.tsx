import { useState, useRef } from 'react';

interface BillUploaderProps {
  onUploadSuccess: () => void;
}

export default function BillUploader({ onUploadSuccess }: BillUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image file first.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/bills', {
        method: 'POST',
        body: formData,
      });

      // Try to parse JSON error body, but handle non-JSON responses (e.g. HTML 404)
      if (!res.ok) {
        const text = await res.text();
        let message = `Upload failed (${res.status})`;
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }

      const bill = await res.json();
      console.log('✓ Upload complete:', bill.title, '|', bill.amount, 'MMK |', bill.category);

      // Reset form
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';

      // Tell parent to refresh the dashboard
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bill-uploader">
      <h2>📄 Upload a Bill</h2>
      <p className="bill-uploader__hint">
        Select a photo of your utility bill or receipt — we'll extract the data automatically.
      </p>

      <div className="bill-uploader__controls">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button
          className="bill-uploader__button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? '⏳ Processing...' : '🚀 Upload & Process'}
        </button>
      </div>

      {file && !uploading && (
        <p className="bill-uploader__selected">
          Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {error && <p className="bill-uploader__error">{error}</p>}
    </div>
  );
}
