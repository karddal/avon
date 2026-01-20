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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMember from "@/components/units/add-member";
import StudentList from "@/components/units/student-list";

export default function EditUnit({
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
        <Tabs>
          <div className="flex flex-row gap-2 items-center mb-2">
            <DialogTitle className="text-xl">Members</DialogTitle>

            <TabsList className="">
              <TabsTrigger value="View">View</TabsTrigger>
              <TabsTrigger value="Add">Add</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="View">
            <DialogHeader>
              <DialogTitle>Lecturers</DialogTitle>
              <DialogDescription>
                Lecturers enrolled on this unit are listed below.
              </DialogDescription>
              <Separator className="my-4"></Separator>
              <DialogTitle>Students</DialogTitle>
              <DialogDescription>
                Students enrolled on this unit are listed below.
              </DialogDescription>
              <StudentList unit_id={unit_id} />
            </DialogHeader>
          </TabsContent>
          <TabsContent value="Add">
            <DialogHeader>
              <DialogTitle>Add a member</DialogTitle>
              <DialogDescription>
                Find someone using the search bar below.
              </DialogDescription>
              <AddMember></AddMember>
            </DialogHeader>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
