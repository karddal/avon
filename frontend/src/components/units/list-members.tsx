"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import LecturerList from "@/components/units/lecturer-list";
import StudentList from "@/components/units/student-list";

export default function ListMembers({
  unit_id,
  openState,
  setOpenState,
}: {
  unit_id: string;
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="max-h-[80%] md:overflow-auto overflow-y-scroll ">
        <DialogHeader>
          <DialogTitle>Lecturers</DialogTitle>
          <DialogDescription>
            Lecturers enrolled on this unit are listed below.
          </DialogDescription>
          <LecturerList unit_id={unit_id} />
          <Separator className="my-4"></Separator>
          <DialogTitle>Students</DialogTitle>
          <DialogDescription>
            Students enrolled on this unit are listed below.
          </DialogDescription>
          <StudentList unit_id={unit_id} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
