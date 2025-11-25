"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TabsTrigger } from "@/components/ui/tabs";

type TabSwitcherProps = {
    currentYear: number;
    activeTab: string;
};

export default function TabSwitcher({
    currentYear,
    activeTab,
}: TabSwitcherProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (tab: string) => {
        startTransition(() => {
            router.push(`?year=${currentYear}&tab=${tab}`);
        });
    };

    return (
        <div className="bg-accent p-1 flex gap-2">
            <TabsTrigger
                value="ongoing"
                className="bg-accent px-4 py-2"
                onClick={() => handleTabChange("ongoing")}
                disabled={isPending}
            >
                Ongoing
            </TabsTrigger>
            <TabsTrigger
                value="finished"
                className="bg-accent px-4 py-2"
                onClick={() => handleTabChange("finished")}
                disabled={isPending}
            >
                Finished
            </TabsTrigger>
        </div>
    );
}