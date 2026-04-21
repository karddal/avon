"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/components/user-card";
import { upload_profile_image } from "@/lib/actions/auth/upload_profile_image";

type ProfileImageUploaderProps = {
  imageUrl?: string | null;
  name: string;
  buttonLabel: string;
  disabled?: boolean;
  onUploaded: (imageUrl: string) => Promise<void> | void;
};

export default function ProfileImageUploader({
  imageUrl,
  name,
  buttonLabel,
  disabled = false,
  onUploaded,
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreviewUrl(imageUrl ?? "");
  }, [imageUrl]);

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);

    const result = await upload_profile_image(formData);

    if (!result.success || !result.imageUrl) {
      setUploading(false);
      toast.error(result.error ?? "Failed to upload profile image");
      event.target.value = "";
      return;
    }

    try {
      await onUploaded(result.imageUrl);
      setPreviewUrl(result.imageUrl);
      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile image",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-16 border rounded-none">
          <AvatarImage src={previewUrl} alt={name} className="rounded-none" />
          <AvatarFallback className="rounded-none">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, GIF or WebP up to 5MB.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleFileSelection(event)}
        disabled={disabled || uploading}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="size-4" />
            {buttonLabel}
          </>
        )}
      </Button>
    </div>
  );
}
