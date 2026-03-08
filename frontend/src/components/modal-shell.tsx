"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function ModalShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    return (
        <Dialog open onOpenChange={(open) => !open && router.back()}>
            <DialogContent className="!w-[92vw] !max-w-5xl !p-0 max-h-[90vh] overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>Create coursework</DialogTitle>
                </VisuallyHidden>
                {children}
            </DialogContent>
        </Dialog>
    );
}