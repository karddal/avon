import { Suspense } from "react";
import CourseworkList from "@/components/coursework/coursework-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function PageContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="ongoing" className={""}>
        <TabsList className="flex flex-row gap-4 bg-background my-4">
          <div className="bg-accent p-1">
            <TabsTrigger value="ongoing" className="bg-accent px-4 py-2">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="finished" className="bg-accent px-4 py-2">
              Finished
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="ongoing" className="">
          <Suspense>
            <CourseworkList finished={false} />
          </Suspense>
        </TabsContent>
        <TabsContent value="finished" className={""}>
          <Suspense>
            <CourseworkList finished={true} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CourseworkPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
