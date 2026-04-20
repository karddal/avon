"use client";

import { FolderSync } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { overwrite_zip } from "@/lib/actions/coursework/overwrite_zip";
import { upload_zip } from "@/lib/actions/coursework/upload_zip";

interface UploadZip {
  courseworkGitlabId: string;
  cw_id: string;
  templateGitlabId: number | null;
  uploadStatus: number;
  setUploadStatus: (uploadStatus: number) => void;
  onRefresh: () => void;
}

export default function ZipUploadPage({
  courseworkGitlabId,
  cw_id,
  templateGitlabId,
  uploadStatus,
  setUploadStatus,
  onRefresh,
}: UploadZip) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Idle");
  const [uploading, setUploading] = useState(false);
  const [showOverwrite, setShowOverwrite] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setFile(selected);
    setStatus("File ready to upload.");
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(1);
    setStatus("Uploading ZIP...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await upload_zip({
        cw_id: cw_id,
        courseworkGitLabId: courseworkGitlabId,
        formData: formData,
      });
      if (result.templateId === -1) {
        setStatus(result.error ?? "Upload failed as file is too big.");
        toast.error(result.error ?? "Upload failed as file is too big.");

        setUploadStatus(0);
        return;
      } else {
        onRefresh();
        setStatus("Upload complete. Files committed.");
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setStatus("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleOverwrite = async () => {
    if (!file || !templateGitlabId) return;

    setUploading(true);
    setStatus("Overwriting ZIP...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await overwrite_zip({
        templateId: templateGitlabId,
        formData: formData,
      });
      if (result.templateId === -1) {
        setStatus(result.error ?? "Overwrite failed as file is too big.");
        toast.error(result.error ?? "Overwrite failed as file is too big.");
        return;
      } else {
        setShowOverwrite(false);
        onRefresh();
        setStatus("Overwrite complete");
        toast.success("Template overwritten sucessfully");
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setStatus("Overwrite failed.");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/zip": [".zip"] },
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
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium text-center">
          {isDragActive
            ? "Drop the ZIP file here"
            : file
              ? `${file.name}`
              : "Drop ZIP file here or click to select"}
        </p>
      </div>
      {uploadStatus === 0 && status !== "Uploading ZIP..." && (
        <Button
          size="lg"
          className="w-full bg-accent text-accent-foreground"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          Upload
        </Button>
      )}

      {uploadStatus === 1 && status !== "Uploading ZIP..." && (
        <Button size="lg" disabled className="w-full bg-accent">
          <Spinner className="mr-2 h-4 w-4" />
        </Button>
      )}

      {status === "Uploading ZIP..." && uploadStatus !== 2 && (
        <Button size="lg" disabled className="w-full bg-accent">
          <Spinner className="mr-2 h-4 w-4" />
          Uploading...
        </Button>
      )}

      {status === "Overwriting ZIP..." && uploadStatus === 2 && (
        <Button size="lg" disabled className="w-full bg-accent" variant="destructive">
          <Spinner className="mr-2 h-4 w-4" />
          Overwriting...
        </Button>
      )}

      {uploadStatus === 2 && status !== "Overwriting ZIP..." && (
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          disabled={!file || uploading}
          onClick={() => setShowOverwrite(true)}
        >
          <FolderSync className="mr-2 h-4 w-4" />
          Overwrite
        </Button>
      )}

      {status !== "Idle" && (
        <p className="text-sm text-center text-gray-600">{status}</p>
      )}

      <AlertDialog open={showOverwrite} onOpenChange={setShowOverwrite}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently overwrite the
              contents of the template repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {status !== "Overwriting ZIP..." && (
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
            )}
            {status === "Overwriting ZIP..." && (
              <AlertDialogCancel className="h-full" disabled>
                Cancel
              </AlertDialogCancel>
            )}
            {status !== "Overwriting ZIP..." && (
              <Button variant="destructive" size="lg" onClick={handleOverwrite}>
                <FolderSync className="mr-2 h-4 w-4" />
                Overwrite
              </Button>
            )}
            {status === "Overwriting ZIP..." && (
              <Button size="lg" disabled variant="destructive">
                <Spinner className="mr-2 h-4 w-4" />
                Overwriting...
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
