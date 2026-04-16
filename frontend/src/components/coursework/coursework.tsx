"use client";
import { Ellipsis, SquareX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeleteCourseworkButton from "@/components/coursework/delete_coursework_button";
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
import { formatIsoDate } from "@/lib/date-format";
import { Card } from "../ui/card";

type courseworkData = {
  id: string;
  name: string;
  unit_id?: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
  unit_code?: string;
};

function _getRandomTestsPassed(): number {
  return Math.random() * 100;
}

export default function Coursework({
  props,
  hasPermissions,
}: {
  props: courseworkData;
  hasPermissions: boolean;
}) {
  const colouring = {
    backgroundColor: `#${props.colour}`,
  };
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div>
      <div style={colouring} className="h-2 w-full"></div>
      <Card className="bg-muted h-full flex flex-row p-2 hover:bg-foreground/10">
        <Link className={"flex-1 h-full"} href={`/coursework/${props.id}`}>
          <div className="h-full flex-row justify-between">
            <div className="flex flex-col">
              <p className="text-lg lg:text-xl">{props.name}</p>
              <p className="text-muted-foreground">{props.unit_code}</p>
            </div>
            <div className="flex flex-row gap-2">
              <p className="text-sm lg:text-xl text-muted-foreground">
                <span className="text-sm">Due: </span>
                {formatIsoDate(props.due_date)}
              </p>
            </div>
          </div>
        </Link>
        {hasPermissions && (
          <div className={"z-20 place-self-end"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={"w-56"}>
                <DropdownMenuLabel>Coursework Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowDelete(true)}
                  className={
                    "text-destructive focus:text-destructive flex flex-row"
                  }
                >
                  <SquareX size={4} className={"text-destructive"}></SquareX>
                  Delete coursework
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the coursework and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-full">
                    Cancel
                  </AlertDialogCancel>
                  <DeleteCourseworkButton courseworkId={props.id} />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Card>
    </div>
  );
}
