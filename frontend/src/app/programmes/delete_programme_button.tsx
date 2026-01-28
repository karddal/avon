"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { delete_programme } from "@/lib/actions/delete_programme";

interface DeleteProgrammeButtonProps {
  programmeId: string;
  setAlertState: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteProgrammeButton({
  programmeId,
  setAlertState,
}: DeleteProgrammeButtonProps) {
  const [status, setStatus] = useState<number>(0);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setStatus(1);

      const result = await delete_programme({ id: programmeId });

      if (result) {
        toast.success("Programme deleted successfully");
        setStatus(0);
        setAlertState(false);
        router.refresh();
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Failed to delete the programme");
      console.log(error);
      console.log(programmeId);

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
