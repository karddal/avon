"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { delete_unit_members } from "@/lib/actions/delete_unit_members";

interface DeleteUnitMembersProps {
  unit_id: string;
  omitted_user_ids: string[];
  closeDialog: () => void;
  onSuccess: () => void;
}

export default function BulkDeleteButton({
  unit_id,
  omitted_user_ids,
  closeDialog,
  onSuccess,
}: DeleteUnitMembersProps) {
  const [status, setStatus] = useState<number>(0);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setStatus(1);

      const result = await delete_unit_members({ unit_id, omitted_user_ids });

      if (result.success) {
        toast.success("Unit Members deleted successfully");
        setStatus(0);
        onSuccess();
        router.push("/management");
        closeDialog();
      } else if (result.status === 409) {
        toast.error(
          "No Users are enrolled on given unit, that aren't excluded / omitted",
        );
        setStatus(2);
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Failed to delete the unit members");
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
          Delete
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
