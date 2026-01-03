import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

export function DynTab({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    startTransition(() => {
      router.push(`?tab=${value}`, { scroll: false });
    });
  };

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        orientation={"vertical"}
        className={"flex flex-row"}
      >
        <TabsList className={"flex flex-col h-auto justify-start"}>
          <TabsTrigger value={"2025"}>2025/2026</TabsTrigger>
          <TabsTrigger value={"2024"}>2024/2025</TabsTrigger>
        </TabsList>
        <TabsContent value={"2025"}>2025</TabsContent>
        <TabsContent value={"2024"}>2024</TabsContent>
      </Tabs>
      {isPending && <Spinner />}
    </>
  );
}
