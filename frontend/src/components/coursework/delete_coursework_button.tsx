"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { delete_coursework } from "@/lib/actions/delete_coursework";

interface DeleteCourseworkButtonProps {
  courseworkId: string;
}

export default function DeleteCourseworkButton({
  courseworkId,
}: DeleteCourseworkButtonProps) {
  console.log(courseworkId);
  const [status, setStatus] = useState<number>(0);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setStatus(1);

      const result = await delete_coursework({ id: courseworkId });

      if (result) {
        toast.success("Coursework deleted successfully");
        setStatus(0);
        router.push("/coursework");
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(2);
      toast.error("Failed to delete the coursework");
      console.log(error);
      console.log(courseworkId);

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
          data-cy="coursework-delete-confirm"
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
