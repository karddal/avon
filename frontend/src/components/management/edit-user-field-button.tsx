"use client";

import { Loader2, Save, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type EditUserFieldButtonProps = {
  actionLabel: string;
  successMessage: string;
  errorMessage: string;
  disabled?: boolean;
  onSubmit: () => Promise<boolean>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function EditUserFieldButton({
  actionLabel,
  successMessage,
  errorMessage,
  disabled = false,
  onSubmit,
  onSuccess,
  onCancel,
}: EditUserFieldButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  const handleSubmit = async () => {
    if (disabled || status === "saving") {
      return;
    }

    setStatus("saving");

    try {
      const success = await onSubmit();

      if (!success) {
        throw new Error(errorMessage);
      }

      toast.success(successMessage);
      onSuccess?.();
    } catch {
      toast.error(errorMessage);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        onClick={() => void handleSubmit()}
        disabled={disabled || status === "saving"}
      >
        {status === "saving" ? <Loader2 className="animate-spin" /> : <Save />}
        {actionLabel}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel}>
        <XIcon />
        Cancel
      </Button>
    </div>
  );
}
