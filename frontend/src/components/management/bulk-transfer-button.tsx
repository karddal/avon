"use client";

import { ArrowRightLeft, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { transfer_unit_members } from "@/lib/actions/transfer_unit_members";

interface TransferUnitMembersProps {
  unitIdFrom: string;
  unitIdsTo: string[];
  omittedMembers: string[];
  onSuccess: () => void;
}

export default function BulkTransferButton({
  unitIdFrom,
  unitIdsTo,
  omittedMembers,
  onSuccess,
}: TransferUnitMembersProps) {
  const [status, setStatus] = useState<number>(0);

  const handleDelete = async () => {
    try {
      setStatus(1);
      console.log("unitIdFrom:", unitIdFrom);
      console.log("unitIdsTo:", unitIdsTo);
      console.log("OmittedMembers:", omittedMembers);
      const result = await transfer_unit_members({
        unitIdFrom,
        unitIdsTo,
        omittedMembers,
      });
      console.log("result:");
      console.log(result);
      if (result.success) {
        toast.success("Unit Members transferred successfully");
        setStatus(0);
        onSuccess();
      } else if (result.status === 409) {
        toast.error(
          "No Users are enrolled on given unit, that aren't excluded / omitted",
        );
        setStatus(2);
      } else {
        throw new Error();
      }
    } catch (_error) {
      console.log(_error);
      setStatus(2);
      toast.error("Failed to transfer the unit members");

      setTimeout(() => setStatus(0), 3000);
    }
  };

  return (
    <div className="h-full">
      {status === 1 && (
        <Button variant="outline" disabled>
          <Spinner className="mr-2 h-4 w-4" />
          {/* <ArrowRightLeft className="h-4 w-4" /> */}
          Transferring...
        </Button>
      )}

      {status === 0 && (
        <Button variant="outline" onClick={handleDelete}>
          <ArrowRightLeft className="h-4 w-4" />
          Transfer
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
