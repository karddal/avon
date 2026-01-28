"use server";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";

function PageContent() {
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

async function AdminPage() {
  const s = await requireSession();
  let userRole = s.user.role;
  if (!userRole) {
    userRole = "user";
  }
  return (
    <div>
      {userRole === "admin" && (
        <Link href={"/units/create-unit"}>
          <div className="w-32 py-4 border-2 hover:cursor-pointer">
            Create unit
          </div>
        </Link>
      )}
      <PageContent />
    </div>
  )
}

export default async function UnitPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPage />
    </Suspense>
  );
}
