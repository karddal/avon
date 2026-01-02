'use client'

import {startTransition, useEffect} from 'react';
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {CloudAlert} from "lucide-react";
import {useRouter} from "next/navigation";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error(error);
    }, [error]);
    const router = useRouter();
    return (
        <main className="flex h-full flex-col items-center justify-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant={"icon"}>
                        <CloudAlert/>
                    </EmptyMedia>
                    <EmptyTitle>Whoops, something went wrong.</EmptyTitle>
                    <EmptyDescription>We couldn't fetch your unit. Please check the server status page.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <button
                        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                        onClick={
                            // Attempt to recover by trying to re-render the invoices route
                            () => {
                                startTransition(() => {
                                    reset();
                                    router.refresh();
                                })
                            }
                        }
                    >
                        Try again
                    </button>
                </EmptyContent>
            </Empty>
        </main>
    );
}