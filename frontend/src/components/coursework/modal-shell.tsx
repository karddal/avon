"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {useRef} from "react";
import {CourseworkCreateCloseContext} from "@/components/coursework/coursework-create-close";

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
                <DialogContent className="!w-[92vw] !max-w-5xl !p-0 max-h-[90vh] overflow-hidden"
                               onPointerDownOutside={(e) => e.preventDefault()}
                               onInteractOutside={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogTitle>Create coursework</DialogTitle>
                    </VisuallyHidden>
                    {children}
                </DialogContent>
            </Dialog>
        </CourseworkCreateCloseContext.Provider>
    );
}