"use client";

import { Ellipsis, SquarePen, SquareX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import DeleteUnitButton from "@/components/units/delete-unit-button";
import { Card } from "../ui/card";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
  unit_code: string;
  colour: string;
};

export default function Unit({
  props,
  hasPermissions,
}: {
  props: UnitData;
  hasPermissions: boolean;
}) {
  const colouring = {
    backgroundColor: `#${props.colour}`,
  };
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  return (
    <div className="relative group">
      <Link href={`/units/${props.id}`} className="block">
        <div style={colouring} className="h-2"></div>
        <Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
          <div className="flex flex-col w-full">
            <div className="flex flex-col text-ellipsis">
              <div className="flex flex-row align-center items-center ">
                <p className="text-foreground/80">
                  Unit Code: {props.unit_code}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between w-full gap-x-10 lg:text-lg">
                <p className="text-xl">{props.name}</p>
              </div>
            </div>
            <br />
            <div className="flex flex-row gap-4"></div>
          </div>
          <div className="w-10 h-10" />
        </Card>
      </Link>

      {hasPermissions && (
        <div className="absolute right-2 bottom-2 z-30">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                id="unit-dropdown-button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel>Unit Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/units/${props.id}?edit=1`);
                }}
              >
                <SquarePen className="mr-2 h-4 w-4" /> Edit Unit
              </DropdownMenuItem>

              <DropdownMenuItem
                data-cy="unit-delete-menu-item"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowDelete(true);
                }}
                className="text-destructive focus:text-destructive flex flex-row gap-2"
              >
                <SquareX size={16} />
                Delete unit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  unit and all of its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  Cancel
                </AlertDialogCancel>
                <DeleteUnitButton unitId={props.id} />
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
