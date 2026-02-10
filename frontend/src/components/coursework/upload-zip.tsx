'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ZipUploadPage() {
  const [status, setStatus] = useState<string>('Idle');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFile: File) => {
    const file = acceptedFile;
    if (!file) return;

    setUploading(true);
    setStatus('Uploading ZIP...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload-zip', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setStatus('Upload complete. Files committed.');
    } catch (err) {
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="mt-6">
        <div
            {...getRootProps()}
            className="
            w-full
            p-4
            outline
            outline-offset-4
            rounded-lg
            outline-dashed
            "
        >
            <input {...getInputProps()} />
            <p className="text-lg font-medium text-center">
            Drop files here or click to upload
            </p>
        </div>
    </div>

  );
}
