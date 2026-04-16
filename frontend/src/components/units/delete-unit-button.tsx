"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { delete_unit } from "@/lib/actions/unit/delete_unit";

interface DeleteUnitButtonProps {
  unitId: string;
  className?: string;
}

export default function DeleteUnitButton({
  unitId,
  className,
}: DeleteUnitButtonProps) {
  const [status, setStatus] = useState<number>(0);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setStatus(1);

      const result = await delete_unit(unitId);

      if (result) {
        toast.success("Unit deleted successfully");
        router.push("/units");
      } else {
        throw new Error();
      }
    } catch (_error) {
      setStatus(2);
      toast.error("Failed to delete the unit");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className={className}>
      {status === 1 && (
        <Button variant="destructive" disabled className="h-10 w-full">
          <Spinner className="mr-2 h-4 w-4" />
          Deleting...
        </Button>
      )}

      {status === 0 && (
        <Button
          variant="destructive"
          className="h-10 w-full"
<<<<<<< HEAD
=======
          data-cy="confirm-delete-unit"
>>>>>>> dev
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
          className="h-10 w-full border-destructive text-destructive"
        >
          <XIcon className="mr-2 h-4 w-4" />
          Failed
        </Button>
      )}
    </div>
  );
}
