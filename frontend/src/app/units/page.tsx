"use server";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";

async function PageContent() {
  await requireSession(); // make sure logged in

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ongoing">
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

        <TabsContent value="ongoing">
          <Suspense fallback={<Loading />}>
            <UnitList finished={false} />
          </Suspense>
        </TabsContent>

        <TabsContent value="finished">
          <Suspense fallback={<Loading />}>
            <UnitList finished={true} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default async function UnitPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
