"use client";
import { Edit, Ellipsis, SquarePen, SquareX } from "lucide-react";
import { useState } from "react";
import DeleteProgrammeButton from "@/app/programmes/delete_programme_button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "../ui/card";
import EditProgramme from "./edit-programme";

type programmeData = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export default function Coursework({
  props,
  hasPermissions,
}: {
  props: programmeData;
  hasPermissions: boolean;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  console.log(props);
  return (
    <div>
      <Card className="bg-muted h-full justify-between flex-1 flex flex-row p-2 hover:bg-foreground/10">
        <div className="h-full flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-lg lg:text-xl">{props.name}</p>
          </div>
          <div className="flex flex-row gap-2">
            <p className="text-sm lg:text-xl text-muted-foreground">
              <span className="text-sm">Start Date: </span>
              {new Date(props.start_date).toLocaleDateString()}
            </p>
            <p className="text-sm lg:text-xl text-muted-foreground">
              <span className="text-sm">End Date: </span>
              {new Date(props.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        {hasPermissions && (
          <div className={"z-20 place-self-end"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={"w-56"}>
                <DropdownMenuLabel>Programme Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={() => setShowEdit(true)}
                  className={"flex flex-row"}>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Edit Programme
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowDelete(true)}
                  className={
                    "text-destructive focus:text-destructive flex flex-row"
                  }
                >
                  <SquareX size={4} className={"text-destructive"}></SquareX>
                  Delete programme
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <EditProgramme
              open_state={showEdit}
              set_open_state={setShowEdit}
              programme_update_data={props}
            />
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the programme and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-full">
                    Cancel
                  </AlertDialogCancel>
                  <DeleteProgrammeButton
                    programmeId={props.id}
                    setAlertState={setShowDelete}
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Card>
    </div>
  );
}
