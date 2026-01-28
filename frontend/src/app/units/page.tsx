"use server";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/units/unit-list";
import { requireSession } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";

type UserRole = {
  userRole: string
}

function CreateUnit({ userRole }: UserRole) {
  return (
    <div>
      {
        userRole === "admin" && (
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={"/units/create-unit/"}>
              <ClipboardPlus />
              Add Unit
            </Link>
          </Button>
        )
      }
    </div>
  )
}

function PageContent({ userRole }: UserRole) {
  return (
    <div className="">
      <div className="space-y-6">
        <Tabs defaultValue="ongoing">
          <div className="flex flex-row align-middle items-center justify-between">
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
            <CreateUnit userRole={userRole} />
          </div>

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
      <PageContent userRole={userRole} />
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
