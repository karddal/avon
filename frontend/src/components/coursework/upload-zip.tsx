'use client';

import { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { Spinner } from "@/components/ui/spinner";
import { FolderSync } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadZip {
  uploadStatus: number;
  uploadSetStatus: (status: number) => void;
}

export default function ZipUploadPage({uploadStatus, uploadSetStatus} : UploadZip) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('Idle');
  const [uploading, setUploading] = useState(false);
  const [showOverwrite, setShowOverwrite] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setFile(selected);
    setStatus('File ready to upload.');
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('Uploading ZIP...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      uploadSetStatus(1);
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-zip`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!result.ok) {
        throw new Error(await result.text());
      }
      uploadSetStatus(2);
      setStatus('Upload complete. Files committed.');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleOverwrite = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('Uploading ZIP...');

    const formData = new FormData();
    formData.append('file', file);
    try {
      uploadSetStatus(1);
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-zip/overwrite`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!result.ok) {
        throw new Error(await result.text());
      }
      uploadSetStatus(2);
      setStatus('Overwrite complete');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('Overwrite failed.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="mt-6 space-y-4">
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
            : file
              ? `${file.name}`
              : 'Drop ZIP file here or click to select'}
        </p>
      </div>
      {uploadStatus === 0 && (
        <Button size="lg" className="w-full" onClick={handleUpload} disabled={!file || uploading}>
          Upload
        </Button>

      )}

      {uploadStatus === 1 && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Uploading...
        </Button>
      )}

      {uploadStatus === 2 && (
        <Button variant="destructive" size="lg" className="w-full" disabled={!file || uploading} onClick={() => setShowOverwrite(true)}>
          <FolderSync className="mr-2 h-4 w-4" />
          Overwrite
        </Button>
      )}

      {status !== 'Idle' && (
        <p className="text-sm text-center text-gray-600">{status}</p>
      )}

      <AlertDialog open={showOverwrite} onOpenChange={setShowOverwrite}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently overwrite the
              contents of the template repository for this.s
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              <Button variant="destructive" size="lg" onClick={handleOverwrite}>
                <FolderSync className="mr-2 h-4 w-4" />
                Overwrite
              </Button> {/* Onclik do some shit, like handleUpload just overwrite version brev */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
