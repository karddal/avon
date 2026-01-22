"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function EditUnit({
  openState,
  setOpenState,
}: {
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}) {
  const b = useIsMobile();
  return (
    <Sheet open={openState} onOpenChange={setOpenState}>
      <SheetContent side={b ? "top" : "right"}>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>This action cannot be undone.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
