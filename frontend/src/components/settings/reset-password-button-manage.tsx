"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RotateCcwKey } from "lucide-react";
import { delete_user } from "@/lib/actions/delete_user";
import { reset_password_manage } from "@/lib/actions/reset_password_manage";


interface ResetPasswordProps {
  user_id: string;
  new_password: string;
  closeDialog: () => void;
  disabled: boolean;
}

export default function ResetPasswordButtonManage({ user_id, new_password, closeDialog, disabled }: ResetPasswordProps) {
  const [status, setStatus] = useState<number>(0);

  const handleReset = async () => {
    try {
      setStatus(1);

      const result = await reset_password_manage(user_id, new_password);
      
      if (result.success) {
        toast.success("Password reseted successfully");
        setStatus(0);
        closeDialog();
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Failed to reset the password for the user");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className="h-full">
      {status === 1 && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Reseting ...
        </Button>
      )}

      {status === 0 && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleReset}
          disabled={disabled}
        >
          <RotateCcwKey/>
          Reset Password
        </Button>
      )}

      {status === 2 && (
        <Button
          variant="outline"
          size="lg"
          disabled
          className="w-full border-destructive text-destructive"
        >
          <XIcon className="mr-2 h-4 w-4" />
          Failed
        </Button>
      )}
    </div>
  );
}
