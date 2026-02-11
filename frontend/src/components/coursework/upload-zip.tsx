'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ZipUploadPage() {
  const [status, setStatus] = useState('Idle');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setStatus('Uploading ZIP...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-zip`,
        {
          method: 'POST',
          headers: {},
          body: formData,
        }
      );

      if (!result.ok) {
        throw new Error(await result.text());
      }
      setStatus('Upload complete. Files committed.');
    } catch (err) {
      console.error(err);
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="mt-6">
      <div
        {...getRootProps()}
        className={`
          w-full
          p-4
          outline
          outline-offset-4
          rounded-lg
          outline-dashed
          cursor-pointer
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium text-center">
          {isDragActive
            ? 'Drop the ZIP file here'
            : 'Drop ZIP file here or click to upload'}
        </p>
        <p className="text-sm text-center text-gray-500 mt-1">
          Only .zip files are accepted
        </p>
      </div>

      <p className="mt-3 text-sm text-center text-gray-600">{status === "Idle" ? "" : "File uploaded!"}</p>
    </div>
  );
}

