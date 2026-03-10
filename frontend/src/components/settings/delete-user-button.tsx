"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { delete_user } from "@/lib/actions/delete_user";

interface DeleteUserProps {
  user_id: string;
  closeDialog: () => void;
}

export default function DeleteUserButton({
  user_id,
  closeDialog,
}: DeleteUserProps) {
  const [status, setStatus] = useState<number>(0);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setStatus(1);

      const result = await delete_user(user_id);

      if (result) {
        toast.success("User deleted successfully");
        setStatus(0);
        // Need to change this to smth a bit more normal
        window.location.href = "/management";
        closeDialog();
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Failed to delete the user");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className="h-full">
      {status === 1 && (
        <Button size="lg" variant="destructive" disabled className="w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Deleting...
        </Button>
      )}

      {status === 0 && (
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={handleDelete}
        >
          Delete User
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
