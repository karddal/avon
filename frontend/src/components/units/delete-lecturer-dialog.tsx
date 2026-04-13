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

type DeleteDialogProps = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  callback: () => void;
};

export default function DeleteDialog({
  open_state,
  set_open_state,
  callback,
}: DeleteDialogProps) {
  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent>
        <DialogTitle>Are you sure you want to remove the lecturer?</DialogTitle>
        <DialogDescription>You cannot undo this operation.</DialogDescription>
        <DialogFooter className="flex flex-row gap-2">
          <DialogClose asChild>
            <Button variant={"outline"}>Close</Button>
          </DialogClose>
          <Button variant={"destructive"} onClick={callback}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
