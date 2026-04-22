"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useRef } from "react";
import { CourseworkCreateCloseContext } from "@/components/coursework/coursework-create-close";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ModalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const beforeCloseRef = useRef<(() => void) | null>(null);

  function leavePage() {
    beforeCloseRef.current?.();
    window.location.assign("/coursework");
  }

  return (
    <CourseworkCreateCloseContext.Provider
      value={{
        setBeforeClose: (fn) => {
          beforeCloseRef.current = fn;
        },
      }}
    >
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) {
            leavePage();
          }
        }}
      >
        <DialogContent
          className="!w-[92vw] !max-w-5xl !p-0 max-h-[90vh] gap-0 overflow-x-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>Create coursework</DialogTitle>
          </VisuallyHidden>

          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 z-50 inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background/90 text-muted-foreground transition hover:text-foreground"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              leavePage();
            }}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="max-h-[90vh] overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </CourseworkCreateCloseContext.Provider>
  );
}
