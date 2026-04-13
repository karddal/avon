"use client";

import { UserCog, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { change_role } from "@/lib/actions/change_role";

interface ChangeRoleProps {
  user_id: string;
  closeDialog: () => void;
  newRole: string;
  disabled: boolean;
}

export default function ChangeRoleButton({
  user_id,
  closeDialog,
  newRole,
  disabled,
}: ChangeRoleProps) {
  const [status, setStatus] = useState<number>(0);

  const handleRoleChange = async () => {
    try {
      setStatus(1);

      const result = await change_role(user_id, newRole);

      if (result.success) {
        toast.success("Role changed successfully");
        setStatus(0);
        closeDialog();
      } else {
        throw new Error();
      }
    } catch (_error) {
      setStatus(2);
      toast.error("Failed to change role");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className="h-full">
      {status === 1 && (
        <Button size="lg" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Changing Role ...
        </Button>
      )}

      {status === 0 && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleRoleChange}
          disabled={disabled}
        >
          <UserCog />
          Change Role
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
