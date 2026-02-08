import { ClipboardPlus } from "lucide-react";
import Link from "next/dist/client/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import ProgrammeList from "@/components/programme/programme-list";
import { SeedButton } from "@/components/seed-db-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdminSession } from "@/lib/auth-utils";

async function PageContent() {
  const s = await requireAdminSession();
  let userRole = s.user.role;

  if (!userRole) {
    userRole = "user";
  }

  return (
    <>
      {userRole === "admin" && (
        <div className="space-y-6">
          <Tabs defaultValue="ongoing">
            <TabsList className="flex flex-row gap-4 bg-background my-4">
              <div className="bg-accent p-1">
                <TabsTrigger value="ongoing" className="bg-accent px-4 py-2">
                  Ongoing
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="bg-accent px-4 py-2">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="finished" className="bg-accent px-4 py-2">
                  Finished
                </TabsTrigger>
              </div>
              <SeedButton></SeedButton>
            </TabsList>

            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href={{ pathname: "/programmes/create_programme" }}>
                <ClipboardPlus />
                Add programme
              </Link>
            </Button>

            <TabsContent value="ongoing">
              <Suspense fallback={<Loading />}>
                <ProgrammeList finished={false} upcoming={false} />
              </Suspense>
            </TabsContent>

            <TabsContent value="upcoming">
              <Suspense fallback={<Loading />}>
                <ProgrammeList finished={false} upcoming={true} />
              </Suspense>
            </TabsContent>

            <TabsContent value="finished">
              <Suspense fallback={<Loading />}>
                <ProgrammeList finished={true} upcoming={false} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}

export default function ProgrammesPage() {
  return (
    <Suspense fallback={<Loading></Loading>}>
      <PageContent />
    </Suspense>
  );
}
