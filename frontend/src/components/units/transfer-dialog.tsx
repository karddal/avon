import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

type TransferDialogProps = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  callback: () => void;
};

export default function TransferDialog({
  open_state,
  set_open_state,
  callback,
}: TransferDialogProps) {
  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent>
        <DialogTitle>Are you sure you want to transfer ownership?</DialogTitle>
        <DialogDescription>
          You cannot undo this operation. Once applied, you will no longer be
          the owner of this unit, and some unit management options will no
          longer be available.
        </DialogDescription>
        <DialogFooter className="flex flex-row gap-2">
          <DialogClose asChild>
            <Button variant={"outline"}>Close</Button>
          </DialogClose>
          <Button variant={"destructive"} onClick={callback}>
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
